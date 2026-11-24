# mossplanet

モス（mossgray）の個人ポートフォリオ mossplanet.com。Hugo製の静的サイトをNetlifyで公開している。
仕様は docs/spec.md を正とする。仕様と食い違う変更をする前に、必ず本人に確認する（依頼ファイルによる変更は、作業ルールの docs/requests/ の項のとおり）。

## 作業ルール
- 作業は renewal ブランチで行う。main への統合と push は、本人の明示的な指示があるときだけ行う。
- main は本番（mossplanet.com。2026年11月25日にリニューアルを公開）。公開の流れは次のとおり。
  - renewal で作業して push し、確認用URL（https://renewal--mossplanet.netlify.app/ ）で本人が確かめる。
  - 本番に入れるのは本人だけ。本人が Claude Code の入力欄で、先頭に `!` を付けて `scripts/publish.sh` を実行する（Claude Code は本番まで実行しない。試しの `--dry-run` だけ実行してよい。main への push を許可する設定は足さない）。
    - 本番に入れる：`! bash scripts/publish.sh "変更の内容"`（省くと merge のメッセージは「サイトを更新（日付）」）
    - 試し：`! bash scripts/publish.sh --dry-run`（確認と本番条件のビルドだけ。main には何もしない）
    - スクリプトは、ブランチが renewal か、コミットしていない変更が無いか、renewal と GitHub が同じか、main に直接入った変更（公開の merge のコミット以外）が無いか、本番と同じ条件（`CONTEXT=production`）のビルドが通るかを確かめてから、main に `--no-ff` で merge して push し、renewal に戻る。
    - 止まったときは「■ 止めました（段階：…）」の理由と「本番：変わっていません／push は終わっています」を見る。確認で止まったら、理由のとおり renewal で直して（コミット・push して）からもう一度実行する。merge や push で止まったら、Claude Code に表示を見せて相談する。
    - スクリプトが使えないときの予備：`! git checkout main` → `! git pull --ff-only origin main` → `! git merge --no-ff renewal -m "変更の内容"` → `! git push origin main` → `! git checkout renewal`（または GitHub の画面でプルリクエストを merge する）。
  - 公開後は、本番の URL で表示・転送・noindex が無いことを確かめる。
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
- 差分のある作品（TRPG の立ち絵など）は、画像を同じフォルダに置き、front matter の variants に axes（ボタンの列）と items（各差分の values・image・alt）を書く。cover は最初に表示する差分の画像にする（docs/spec.md 第6.2.3節）。
- らくがき帳に落書きを足すときは、画像を content/works/sketchbook/ に置き、index.md の sketches に1項目（id・title・date・image・text・alt）を足して、date をいちばん新しいらくがきの日付にする（docs/spec.md 第6.2.2節）。
- キャラクターは content/characters/<キャラクターID>/index.md を作り、画像を同じフォルダに置く（1キャラクター1ページ。項目は docs/spec.md の第6.7節に従う）。
- リポジトリは公開なので、front matter の `permission` には、名前や事情を書かず、「確認済み」「自作」などの短い言葉だけを書く。依頼者とのやりとりの中身や、伏せている情報の手がかり（元のファイル名など）は、コメントも含めて Git の対象のファイルに書かない。

## 仮の文章
- 本人があとで書く文章は、Markdown では `{{< todo >}}…{{< /todo >}}` で囲む。テンプレートやデータの文章は `_partials/todo-text.html` を使う。
- 確認用URLでは黄色い枠で表示され、Netlify の本番ビルド（CONTEXT=production）ではエラーで止まる。手元のビルドでは警告（WARN todo: …）として残りの箇所が出る。
