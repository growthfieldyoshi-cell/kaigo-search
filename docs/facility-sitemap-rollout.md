# 施設詳細 sitemap 段階投入方針

施設詳細ページ（`/{prefecture}/{city}/{service_code}/{id}`、約 21 万件）を sitemap に追加する際、いきなり全件投入はせず **25,000 件単位の chunk** で段階追加する。
本ドキュメントは現状と次段階以降の判断基準を集約する。

---

## 現在の sitemap 構成

| URL | 役割 | 件数 | 種別 |
|---|---|---|---|
| `/sitemap.xml` | home / static / prefecture / ranking / articles / city / city-service | **26,802** | Next.js metadata convention（[app/sitemap.ts](../app/sitemap.ts)） |
| `/sitemap-facilities-1.xml` | 施設詳細 第1段（公式 URL ありの上位 25,000 件） | **25,000** | Route Handler（[app/sitemap-facilities-1.xml/route.ts](../app/sitemap-facilities-1.xml/route.ts)） |

robots.txt（[app/robots.ts](../app/robots.ts)）は両方を `Sitemap:` directive で列挙：

```
Sitemap: https://www.kaigosagashi.jp/sitemap.xml
Sitemap: https://www.kaigosagashi.jp/sitemap-facilities-1.xml
```

---

## 第1段階の抽出条件

`getFacilitiesForSitemap(0, 25000)` ([lib/queries.ts](../lib/queries.ts)) を呼び出し、以下の条件で抽出：

```sql
WHERE f.url IS NOT NULL
  AND TRIM(f.url) <> ''
  AND f.url ~* '^https?://'
ORDER BY f.id ASC
LIMIT 25000 OFFSET 0
```

| 条件 | 意図 |
|---|---|
| **url が `http://` または `https://` で始まる施設のみ** | 公式サイトを持つ「品質シグナルが強い」施設に絞る |
| **id ASC** | 決定論的順序（同じ chunk が常に同じ施設集合になる） |
| **LIMIT 25000 OFFSET 0** | 50,000 URL/sitemap 上限の半分。失敗時のロールバック影響範囲を限定 |
| **city は city_agg に正規化** | `LEFT JOIN municipality_mapping ... COALESCE(NULLIF(m.city_agg, ''), f.city)` で大阪市住吉区 → 大阪市等の重複URL生成を防止 |

URL 形式：

```
https://www.kaigosagashi.jp/{encodeURIComponent(prefecture)}/{encodeURIComponent(city_agg)}/{service_code}/{id}
```

各 URL のメタデータ：

| 属性 | 値 |
|---|---|
| `<changefreq>` | `monthly` |
| `<priority>` | `0.5` |
| `<lastmod>` | sitemap 生成時刻（`new Date().toISOString()`） |

---

## 第2段階を増やす判断基準

下記すべてが満たされたとき、第2段階の追加を検討する。

| # | チェック項目 | 確認場所 |
|---|---|---|
| 1 | GSC で `sitemap-facilities-1.xml` のステータスが「成功」 | Search Console > サイトマップ |
| 2 | 検出URL数が 25,000 前後（おおよそ送信数と一致） | 同上 |
| 3 | 5xx エラーが増えていない | Vercel ログ / GSC「ページ」 |
| 4 | 404 エラーが増えていない | GSC「ページ」 > Not found |
| 5 | 重複URL問題が増えていない | GSC「ページ」 > 重複しています |
| 6 | 施設詳細の一部がインデックスされ始めている | GSC「ページ」 > インデックス済み |
| 7 | Vercel / Neon の使用量に異常がない | 各ダッシュボード |

---

## 第2段階の予定

| 項目 | 値 |
|---|---|
| 配信 URL | `https://www.kaigosagashi.jp/sitemap-facilities-2.xml` |
| 実装パス | `app/sitemap-facilities-2.xml/route.ts`（第1段階と同じパターンの Route Handler） |
| 抽出関数呼び出し | `getFacilitiesForSitemap(25000, 25000)` |
| `<priority>` | `0.5` |
| `<changefreq>` | `monthly` |
| robots.txt | `Sitemap:` directive に第2段の URL を追加 |
| GSC 操作 | 新規 sitemap として `sitemap-facilities-2.xml` を送信 |

---

## 判断タイミング

| 時期 | アクション |
|---|---|
| **2026-05-15 前後**（一次確認） | sitemap 取得が安定しているか、5xx 増加していないか、Vercel/Neon に異常がないかを確認。GSC ステータスは未反映でも OK |
| **2026-05-29 前後**（本判断） | GSC で sitemap-facilities-1.xml の処理が完了し、上記「判断基準」の 7 項目すべてを評価。問題なければ第2段階の実装に進む |

GSC は反映に **2〜4 週間**程度の遅延があるため、本判断は最低 2 週間後に行う。

---

## STOP 条件（第2段階以降を中断・ロールバックすべき条件）

下記いずれかが発生した場合、追加投入を停止し、原因究明と対策を優先する。

| 条件 | 対応 |
|---|---|
| sitemap 取得失敗（GSC で「取得できませんでした」、または 5xx） | Vercel ログ・Neon の負荷を確認し、Route Handler の挙動を調査 |
| 5xx の増加 | アプリケーションログで原因特定。施設詳細ページ（`/[id]/page.tsx`）の整合性ガードに retry 不能なバグがないか再点検 |
| ほぼ全件が「クロール済み - インデックス未登録」 | コンテンツ品質のさらなる引き上げが必要。条件を `url ~ '^https?://'` から「tel + url」「対応サービス情報あり」等に厳格化、または投入件数を減らす |
| 重複扱いが大量発生 | URL 整合性ガード（`getCanonicalCityForFacility`）の挙動再確認。canonical タグと sitemap URL の不一致を検査 |
| サーバー / DB 負荷増加 | `revalidate` を伸ばす、`getFacilitiesForSitemap` のクエリプランを EXPLAIN で確認、Neon の compute time を Vercel cron 経由のオフピーク再生成に切り替え検討 |

---

## 注意点

1. **いきなり全件投入しない。** 21 万件を一度に Google に渡すと「クロール済み - インデックス未登録」が大量発生してサイト全体の評価が下がる懸念がある。
2. **25,000 件単位で段階追加する。** 1 sitemap ファイルあたり 50,000 URL の上限の半分に設定。失敗時のロールバック範囲を限定し、各段階で品質シグナルを観測できるサイクルを作る。
3. **GSC 反映には 2〜4 週間かかる。** 投入直後に判断せず、最低 2 週間は様子を見る。第2段階以降の判断は必ず GSC のステータスとインデックス済み件数の推移を見てから。
4. **第3段階以降の方針は別途見直す。** url 条件を緩めて tel あり全件まで拡大するか、url なし施設は永久に除外するかは、第1〜第2段階の Google のインデックス挙動を見て判断する。
5. **chunk URL の naming は `/sitemap-facilities-{N}.xml` で統一する。** sitemap index は使わず（Next.js metadata convention の制約で `/sitemap.xml` への手動 Route Handler が置けない）、robots.txt の `Sitemap:` directive で各 chunk を直接列挙する方式を採用。
