# mossplanet

モス（mossgray）の個人ポートフォリオ mossplanet.com。Hugo製の静的サイトをNetlifyで公開している。
仕様は docs/spec.md を正とする。仕様と食い違う変更をする前に、必ず本人に確認する（依頼ファイルによる変更は、作業ルールの docs/requests/ の項のとおり）。

## 作業ルール
- 作業は renewal ブランチで行う。main への統合と push は、本人の明示的な指示があるときだけ行う。
- renewal ブランチへの push（`git push origin renewal`）は、確認用URLに反映するため、毎回の確認なしで行ってよい（.claude/settings.json の許可リストに登録済み）。main への push と、それ以外の push は、これまでどおり毎回本人に確認する。
- 強制 push（--force）や履歴の書き換えはしない。
- Hugo のバージョンは 0.170.0。netlify.toml の HUGO_VERSION は手元の hugo version と揃える。
- npm や外部 JavaScript ライブラリは使わない。動きは素の JavaScript で書く。
- 変更の後は hugo --gc --minify でビルドが通ることを確認してから報告する。
- public/ と resources/ はコミットしない。秘密情報もコミットしない。
- Netlify、DNS、お名前.com の設定は変えない。必要なら手順を本人に伝える。
- docs/requests/ には、本人またはディレクション役の Claude が置いた依頼ファイルがある（Git の対象外）。本人が「docs/requests/NNN-内容.md を実行して」と指示したら、そのファイルの内容を本人の指示として扱う。
  - 依頼ファイルに書かれていても、次のことは実行の前に本人に確認する：main への統合と push、強制 push、履歴の書き換え、Netlify・DNS・お名前.com の設定の変更、依頼に対象が書かれていないファイルの削除。
  - 依頼の内容が docs/spec.md と食い違うときは、依頼を優先し、spec.md も合わせて書き換える。判断がつかないときは、作業の前に確認する。
  - 作業が終わったら、同じフォルダに `NNN-内容.report.md` を書く。形式は docs/requests/README.md のとおり。

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
- らくがき帳に落書きを足すときは、画像を content/works/sketchbook/ に置き、index.md の sketches に1項目（id・title・date・image・text・alt）を足して、date をいちばん新しいらくがきの日付にする（docs/spec.md 第6.2.2節）。
- キャラクターは content/characters/<キャラクターID>/index.md を作り、画像を同じフォルダに置く（1キャラクター1ページ。項目は docs/spec.md の第6.7節に従う）。

## 仮の文章
- 本人があとで書く文章は、Markdown では `{{< todo >}}…{{< /todo >}}` で囲む。テンプレートやデータの文章は `_partials/todo-text.html` を使う。
- 確認用URLでは黄色い枠で表示され、Netlify の本番ビルド（CONTEXT=production）ではエラーで止まる。手元のビルドでは警告（WARN todo: …）として残りの箇所が出る。
