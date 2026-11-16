# mossplanet

モス（mossgray）の個人ポートフォリオ mossplanet.com。Hugo製の静的サイトをNetlifyで公開している。
仕様は docs/spec.md を正とする。仕様と食い違う変更をする前に、必ず本人に確認する。

## 作業ルール
- 作業は renewal ブランチで行う。main への統合と push は、本人の明示的な指示があるときだけ行う。
- 強制 push（--force）や履歴の書き換えはしない。
- Hugo のバージョンは 0.170.0。netlify.toml の HUGO_VERSION は手元の hugo version と揃える。
- npm や外部 JavaScript ライブラリは使わない。動きは素の JavaScript で書く。
- 変更の後は hugo --gc --minify でビルドが通ることを確認してから報告する。
- public/ と resources/ はコミットしない。秘密情報もコミットしない。
- Netlify、DNS、お名前.com の設定は変えない。必要なら手順を本人に伝える。

## デザインの約束
- ドット絵は必ず整数倍で拡大し、image-rendering: pixelated を付ける。
- 文字色は #0b1b1a。色の付いた背景に白文字を載せない。
  - 例外：トップの惑星のタイトルは、縁取りを付けることを条件に白文字を使う（本文や見出しには当てはめない）。
- 作品ページは上部のタイトル帯だけ惑星の色、その下は白背景。作品画像の周りに装飾を置かない。
- ファンアート（/fanart/）には依頼への導線を置かない。
- 「視差効果を減らす」設定のときは、すべての動きを止める。

## 作品の追加
- content/works/<作品ID>/index.md を作り、画像を同じフォルダに置く。ファンアートは content/fanart/<作品ID>/（1枚1ページ）。
- 作品IDは英小文字とハイフン。Front Matter の項目は docs/spec.md の第7.1節に従う。

## 仮の文章
- 本人があとで書く文章は、Markdown では `{{< todo >}}…{{< /todo >}}` で囲む。テンプレートやデータの文章は `_partials/todo-text.html` を使う。
- 確認用URLでは黄色い枠で表示され、Netlify の本番ビルド（CONTEXT=production）ではエラーで止まる。手元のビルドでは警告（WARN todo: …）として残りの箇所が出る。
