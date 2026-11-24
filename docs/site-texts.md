# mossplanet サイト文章（確定版）

作成日：2026-11-17　／　出典：例文集（Claude Docs）の最終版

## Claude Code への指示

この文書の文章で、サイトの仮の文章（todo）を置き換えてください。

- 見出しの「対象ファイル」に書いたファイルを書き換えてください。文章は、この文書の表記どおりにしてください（言い回しを変えない）。
- 【要確認】が付いている箇所は、まだ決まっていません。その部分だけ todo のまま残し、残した場所を私に報告してください。
- 文章の中の「→ 〇〇の惑星」は、その惑星の一覧ページへのリンクにしてください。
- 置き換えたら `hugo --gc --minify` でビルドを確認し、確認用URLで見られるようにしてください。

### あわせて行う変更

1. **惑星の「ひとこと紹介」をやめる**：トップの吹き出しにひとこと紹介は表示しません。data/planets.yaml のひとこと紹介の項目（日本語・英語）を削除し、吹き出しのテンプレートと docs/spec.md の吹き出しの説明からも外してください。
2. **惑星の紹介文のルビ**：紹介文の「惑星」には「ページ」とルビを振ります。文中の `<ruby>惑星<rt>ページ</rt></ruby>` をそのまま HTML として表示してください（data/planets.yaml の文字列は、テンプレートで HTML として出力する処理が必要です）。英語版にルビはありません。
3. **YouTube の埋め込み**：YouTube の動画は `youtube-nocookie.com` のアドレスで埋め込んでください。
4. **フォントの読み込み元を確認する**：Noto Sans JP と Zen Maru Gothic を Google Fonts から読み込んでいるかどうかを、私に報告してください（読み込んでいる場合は、プライバシーポリシーの扱いを相談します）。
5. **BGM のクレジット**：ゆうゆさん、かなめさんの BGM のクレジットは、About ではなく、ゲームブック『Flourish』のページに入れてください。

---

## 1. About

対象ファイル：content/about/index.md

### 自己紹介

はじめまして、モスです。フリーランスのイラストレーターとして、「かわいいに、わくわくをひとさじ」を合言葉に制作しています。

キャラクターイラスト、ピクセルアート、ゲームブック、Live2Dなど、つくるものはいろいろ。ひとつひとつの活動を「惑星」に見立てて、このサイトでは小さな宇宙として並べています。

惑星どうしは、ときどきつながり合います。ゲームのために描いたドット絵が、一枚のイラストになったり。そんな寄り道も、楽しんでいただけたら嬉しいです。

### SNSごとの説明

| リンク | 説明 |
| --- | --- |
| X | 新しい作品や、制作途中の様子を投稿しています。いちばん更新が早い場所です。イベント参加の告知もここから。 |
| YouTube | ゲームブック『Flourish』の世界観BGM、Live2Dのshowcase動画を公開しています。 |
| Skeb | イラストとピクセルアートのご依頼を受け付けています。 |
| BOOTH | イベントで頒布した作品の通信販売をしています。 |

### BOOTHの頒布物

コミティアで頒布した『ドット絵イラスト集 vol.1』を通信販売しています。ゲームブック『Flourish』のシーンを中心に、ドット絵の世界をじっくり楽しめる一冊です。（中身のイラストは本サイトに掲載されています）

### クレジット

フォント：x8y12pxDenkiChip（でんきチップ） by hicc（SIL Open Font License 1.1） https://github.com/hicchicc/x8y12pxDenkiChip

---

## 2. 惑星の紹介文

対象ファイル：data/planets.yaml（各惑星の紹介文。日本語・英語）

| 惑星 | 紹介文（日本語） |
| --- | --- |
| イラスト | ゲーム用の挿絵やライブ配信用ビジュアル、SNSアイコン、お祝いイラストなど、ご依頼と自主制作のイラストを集めた<ruby>惑星<rt>ページ</rt></ruby>です。 |
| ピクセルアート | ひとつひとつのドットを置いて描く、ピクセルアートの<ruby>惑星<rt>ページ</rt></ruby>です。小さな画面の中に、光や空気、季節の気配まで詰めこむことを大事にしています。ゲームブック『Flourish』のシーンも、ここから生まれました。 |
| ゲームブック | 企画からルール、文章、イラスト、デザインまで、すべてひとりでつくったゲームブックの<ruby>惑星<rt>ページ</rt></ruby>です。サイコロやカードをきっかけに、遊ぶ人が自分だけの物語を綴っていく、ひとり用の作品が中心です。 |
| Live2D | VTuberや配信活動向けに制作した、Live2Dモデルの<ruby>惑星<rt>ページ</rt></ruby>です。自然で違和感のない動きを特に追求して制作しています。 |
| オリジナル | まだ誰も知らない世界で暮らす、オリジナルキャラクターたちの<ruby>惑星<rt>ページ</rt></ruby>です。好きなものや旅の目的、世界の設定を重ねながら、少しずつ住人を増やしています。 |

英語の紹介文は「7. 英語版」にあります。

---

## 3. 依頼・問い合わせ

対象ファイル：content/contact/_index.md

### 冒頭の案内

イラストやピクセルアートのご依頼、お仕事のご相談はこちらからどうぞ。内容が固まっていなくてもかまいません。「こんなことはできますか？」から、お気軽にお問い合わせください。

### できること

- **キャラクターイラスト**：TRPGのキャラクター、SNSアイコン、配信用ビジュアルなど → 作品例：イラストの惑星
- **ピクセルアート**：キャラクター、アイコン、背景つきのシーンなど → 作品例：ピクセルアートの惑星
- **Live2Dモデル制作**：キャラクターデザインからモデルイラストの描き起こし、パーツ分け、モデリング、アニメーション → 作品例：Live2Dの惑星
- **ゲーム・出版物のイラスト**：ゲームブックやTRPGシナリオの表紙、挿絵、カードなど → 作品例：イラストの惑星、ゲームブックの惑星

お受けしていないもの：成人向けの内容、生成AIへの学習を目的としたご依頼。

### 依頼の窓口

| こんなときは | 窓口 |
| --- | --- |
| 個人で楽しむイラストを、おまかせで描いてほしい | Skeb |
| 商用利用したい（配信、グッズ、ゲーム、出版物など） | フォーム |
| ラフの確認や修正のやりとりをしながら進めたい | フォーム |
| Live2Dモデル制作、複数枚や継続のご依頼 | フォーム |
| 依頼以外のお問い合わせ | フォーム |

Skebは、文章でリクエストを送るだけで依頼できるサービスです。仕上がりはおまかせになり、途中の確認や修正はできません。細かいご希望がある場合は、フォームからご相談ください。

### 進め方（フォームからのご依頼）

1. **ご相談**：フォームから、用途、枚数、納期、ご予算をお知らせください。5日以内に返信します。
2. **お見積もり**：内容をうかがい、料金とスケジュールをご提示します。ご了承いただいた時点で、正式なご依頼となります。
3. **ラフ**：構図やポーズをご確認いただきます。
4. **仕上げ**：線画と着彩を進め、必要に応じて途中でご確認いただきます。
5. **納品**：データをお渡しします。

### 規約

**商用利用**

商用利用は可能です。利用方法を事前にお知らせいただき、内容に応じて料金をお見積もりします。個人利用としてご依頼いただいた作品を、後から商用利用する場合もご相談ください。

**修正の回数**

ラフの段階では、大きな修正を2回まで無料で承ります。線画以降は、色味や小物などの細かな修正に限ります。それを超える修正や、構図の変更は、追加料金をいただきます。

**支払いのタイミング**

個人の方：お見積もりにご了承いただいた後、制作開始前に全額をお支払いください。

法人・団体の方：納品後に請求書をお送りします。納品の翌月末までにお支払いください。

**支払い方法**

国内の方：銀行振込でお支払いください。振込手数料はご依頼者様のご負担となります。

海外の方：PayPalの請求書でお支払いください。PayPalの決済手数料は、ご依頼者様にご負担いただきます。

**使用範囲**

納品した作品は、お見積もりのときにお伺いした用途の範囲でご利用いただけます。著作権は制作者（モス）にあり、譲渡をご希望の場合は別途ご相談ください。

次のことはお断りしています：第三者への再配布や転売、画像の大きな加工、生成AIの学習への利用、作品を自作として公開すること。

制作した作品は、公開後に制作実績として、このサイトやSNSに掲載することがあります。掲載を控えてほしい場合は、ご依頼のときにお知らせください。

**キャンセル**

正式なご依頼の後にキャンセルされる場合は、進み具合に応じて料金をいただきます（ラフの提出前：0％、ラフの提出後：30％、線画以降：全額）。制作者の都合で納品できなくなった場合は、お支払いいただいた全額を返金します。

**納品形式**

イラストはPNG、Live2Dモデルはモデルデータ一式でお渡しします。サイズは用途（Web用、配信用、印刷用など）に合わせて、ご相談のうえ決めます。PSDなどの制作データが必要な場合は、ご依頼のときにご相談ください。

---

## 4. 送信完了ページ

対象ファイル：content/contact/thanks.md

**見出し**：送信しました

お問い合わせありがとうございます。内容を確認のうえ、5日以内にご入力いただいたメールアドレスへご連絡します。

5日を過ぎても返信がない場合は、迷惑メールのフォルダもご確認ください。それでも届いていない場合は、お手数ですが、XのDMからお知らせいただけると助かります。

それまでのあいだ、よければほかの惑星ものぞいていってください。

（ボタン：トップへ戻る）

---

## 5. プライバシーポリシー

対象ファイル：content/privacy/index.md（今ある下書きと食い違うところは、こちらを正とする）

**プライバシーポリシー**

mossplanet（以下「当サイト」）は、イラストレーター・モスが運営する個人のポートフォリオサイトです。当サイトでの個人情報の取り扱いについて、次のとおり定めます。

**1. 取得する情報**

- お問い合わせフォームに入力いただいた情報（お名前、メールアドレス、お問い合わせの内容など）
- サーバーが自動で記録する情報（IPアドレス、ブラウザの種類、アクセス日時など）

**2. 利用目的**

- お問い合わせやご依頼への返信と、その後のやりとりのため
- 当サイトの安全な運営と、不正なアクセスの防止のため

**3. 外部サービスの利用**

当サイトは、Netlify, Inc.（米国）のサービスで公開しています。お問い合わせフォームの内容とサーバーの記録は、同社のサーバーに保存されます。

検索結果での表示状況を確認するため、Google Search Consoleを利用しています。これは検索結果に関する集計のみで、当サイトを閲覧した方の情報を個別に収集するものではありません。

当サイトでは、アクセス解析ツールや広告のCookieを利用していません。

当サイトの一部のページでは、YouTubeの動画を埋め込んでいます。動画が表示されると、Google LLC（米国）がCookieなどを通じて閲覧者の情報を取得することがあります。取得された情報の扱いは、Googleのプライバシーポリシーをご確認ください。

**4. 第三者への提供**

法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供することはありません。

**5. 保管と削除**

お問い合わせの内容は、対応が終わってから1年を過ぎたものから削除します。なお、ご依頼の取引に関する記録（お見積もり、請求書など）は、法令で定められた期間保存します。ご本人から開示や訂正、削除のご依頼があった場合は、確認のうえ速やかに対応します。

**6. お問い合わせ先**

個人情報の取り扱いに関するお問い合わせは、当サイトのお問い合わせフォームからお願いします。

**7. 改定**

このポリシーは、必要に応じて改定することがあります。改定後の内容は、このページに掲載した時点から効力を生じます。

制定日：2026年11月25日

---

## 6. ファンアート

ファンアートのページの文章は、置き換え済みのため対象外です。

---

## 7. 英語版

日本語版と同じ内容の英訳です。

### About

対象ファイル：content/about/index.en.md

Hi, I'm Moss (mossgray). I'm a freelance illustrator, creating under the motto "cute, with a spoonful of wonder."

Character illustrations, pixel art, gamebooks, Live2D — I make all sorts of things. On this site, each of my activities is a "planet," and together they form a small universe.

Now and then, the planets connect. Pixel art drawn for a game becomes an illustration of its own, for example. I hope you enjoy those little detours, too.

### 惑星の紹介文（data/planets.yaml の英語）

| Planet | Description |
| --- | --- |
| Illustration | A planet of illustrations, both commissioned and personal: art for games, livestream visuals, social media icons, celebration pieces, and more. |
| Pixel Art | A planet of pixel art, drawn by placing each pixel one by one. I care about fitting light, air, and even a hint of the season into a tiny canvas. The scenes of the gamebook Flourish were born here, too. |
| Gamebooks | A planet of gamebooks I made entirely on my own, from concept and rules to writing, illustration, and design. Most are solo games where dice and cards spark a story that only you can write. |
| Live2D | A planet of Live2D models made for VTubers and streamers. I pay special attention to natural, seamless movement. |
| Original Characters | A planet of original characters who live in a world no one knows yet. Layering their favorite things, the purpose of their journeys, and the setting of their world, I'm adding new residents little by little. |

### 依頼・問い合わせ

対象ファイル：content/contact/_index.en.md

**Intro**

Commissions for illustration and pixel art, and other work inquiries, are welcome here. I'm happy to hear from clients outside Japan, and you can write to me in English. Your idea doesn't need to be fully formed — feel free to start with "Is something like this possible?"

**What I can make**

- **Character illustrations**: TRPG characters, social media icons, streaming visuals, and more → Examples: Illustration planet
- **Pixel art**: characters, icons, scenes with backgrounds, and more → Examples: Pixel Art planet
- **Live2D models**: from character design and model illustration to part separation, rigging, and animation → Examples: Live2D planet
- **Art for games and publications**: covers, illustrations, and cards for gamebooks and TRPG scenarios → Examples: Illustration planet, Gamebooks planet

Not accepted: adult content, and requests intended for training generative AI.

**How to commission**

| If you want to… | Where |
| --- | --- |
| Get a personal-use illustration, leaving the details to me | Skeb |
| Use the art commercially (streaming, merchandise, games, publications) | Contact form |
| Review the rough sketch and request revisions along the way | Contact form |
| Order a Live2D model, multiple pieces, or ongoing work | Contact form |
| Ask about anything other than a commission | Contact form |

Skeb lets you commission simply by sending a written request, and it handles payment and translation. The result is left to the artist, and there are no check-ins or revisions along the way. If you have detailed requests, please contact me through the form.

**Process (commissions through the form)**

1. **Request**: Send your purpose, number of pieces, deadline, and budget through the form. I'll reply within 5 days (JST).
2. **Quote**: I'll send a quote and schedule. The commission becomes official once you approve.
3. **Rough sketch**: You review the composition and pose.
4. **Finishing**: Line art and coloring, with check-ins along the way as needed.
5. **Delivery**: I send you the files.

Prices are quoted in Japanese yen. Payment from outside Japan is made by PayPal invoice, and the PayPal fee is paid by the client.

### 送信完了ページ

対象ファイル：content/contact/thanks.en.md

**Heading**: Thank you!

Your message has been sent. I'll get back to you at the email address you provided within 5 days (JST).

If you haven't heard from me after 5 days, please check your spam folder. If it's still not there, I'd appreciate it if you could let me know by DM on X.

While you wait, feel free to explore the other planets.

(Button: Back to top)

---

## 8. 英語版の追加分（2026-11-17 追記）

日本語版と同じ内容の英訳です。前回 todo のまま残った3か所に入れてください。

### About の SNS ごとの説明

対象ファイル：content/about/index.en.md

| Link | Description |
| --- | --- |
| X | New work and behind-the-scenes looks at what I'm making. This is where I post first. Event announcements go here, too. |
| YouTube | World-themed BGM for the gamebook Flourish, and showcase videos of my Live2D models. |
| Skeb | Commissions for illustration and pixel art. |
| BOOTH | Mail-order sales of works I've released at events. |

### About の頒布物の紹介

対象ファイル：content/about/index.en.md

My pixel art collection, "Pixel Art Illustration Collection vol.1," first released at COMITIA, is available by mail order on BOOTH. Centered on scenes from the gamebook Flourish, it's a book for taking your time with a world made of pixels. (The illustrations in it can also be seen on this site.)

### 依頼ページの Terms（規約）

対象ファイル：content/contact/_index.en.md

冒頭に、日本語版が優先する旨の一文を入れてください。

**Terms**

These terms are a translation of the Japanese version. If there is any difference between the two, the Japanese version takes precedence.

**Commercial use**

Commercial use is available. Please tell me how you plan to use the art in advance, and I'll quote a price based on that use. If you'd like to use art commissioned for personal use commercially later, please contact me as well.

**Revisions**

At the rough sketch stage, I accept up to two major revisions free of charge. From line art onward, revisions are limited to small details such as colors and accessories. Revisions beyond this, or changes to the composition, are charged extra.

**Payment timing**

Individuals: Please pay the full amount before work begins, after you approve the quote.

Companies and organizations: I'll send an invoice after delivery. Please pay by the end of the month following delivery.

**Payment method**

Clients in Japan: Please pay by bank transfer. The transfer fee is paid by the client.

Clients outside Japan: Please pay by PayPal invoice. The PayPal fee is paid by the client.

**Scope of use**

You may use the delivered art within the purpose we agreed on at the quote stage. Copyright remains with the creator (Moss). If you wish to have the copyright transferred, please contact me separately.

The following are not permitted: redistributing or reselling the art to third parties, heavily editing the image, using it to train generative AI, and presenting the art as your own work.

After the art is published, I may post it on this site and on social media as part of my portfolio. If you'd prefer that I don't, please let me know when you commission.

**Cancellation**

If you cancel after the commission becomes official, a fee is charged depending on progress (before the rough sketch: 0%; after the rough sketch: 30%; from line art onward: the full amount). If I become unable to deliver for my own reasons, I'll refund the full amount you paid.

**Delivery format**

Illustrations are delivered as PNG files, and Live2D models as a complete set of model data. Image size is decided together with you based on the use (web, streaming, print, etc.). If you need working files such as PSD, please ask when you commission.

---

## 9. 特定商取引法に基づく表記（2026-11-17 追記）

対象ファイル：content/legal/index.md（新しく作るページ。URL は /legal/）

- フッターと、依頼・問い合わせページの「規約」の末尾から、このページへリンクしてください。
- 日本語版だけでよく、英語版は作りません（海外の方との契約は特定商取引法の適用外のため）。
- noindex にはしないでください（誰でも見られる状態にしておく必要があります）。

**特定商取引法に基づく表記**

| 項目 | 内容 |
| --- | --- |
| 事業者 | mossplanet（モス） |
| 事業者の氏名・住所・電話番号 | ご請求があった場合、遅滞なく電子メールで開示します。お問い合わせフォームからご請求ください。 |
| 連絡先 | お問い合わせフォーム（5日以内に返信します） |
| 提供する役務 | イラスト、ピクセルアート、Live2Dモデルの制作 |
| 役務の対価 | ご依頼の内容に応じて個別にお見積もりし、電子メールでお知らせします。 |
| 対価以外に必要な費用 | 銀行振込の振込手数料、PayPalの決済手数料（いずれもご依頼者様のご負担） |
| 支払時期 | 個人の方：お見積もりにご了承いただいた後、制作開始前に全額 ／ 法人・団体の方：納品後、納品の翌月末まで |
| 支払方法 | 銀行振込（国内の方）、PayPalの請求書（海外の方） |
| 役務の提供時期 | 納期は、お見積もりの際にご提示します。 |
| 納品方法 | 電子データでお渡しします（イラストはPNG、Live2Dモデルはモデルデータ一式）。 |
| キャンセル | 正式なご依頼の後にキャンセルされる場合は、進み具合に応じて料金をいただきます（ラフの提出前：0％、ラフの提出後：30％、線画以降：全額）。制作者の都合で納品できなくなった場合は、お支払いいただいた全額を返金します。 |

あわせて、依頼・問い合わせページの「規約」の末尾に、次の一文とリンクを入れてください。

特定商取引法に基づく表記は、こちらのページをご覧ください。（→ /legal/）

---

## 10. フォントとプライバシーポリシー（2026-11-17 追記）

- フォントは仕様書 7.3 のとおり、Noto Sans JP（本文）と Zen Maru Gothic（見出し）を、どちらも Google Fonts から読み込んでください（display=swap、使う太さだけ）。
- プライバシーポリシー（content/privacy/index.md）の「3. 外部サービスの利用」の、YouTube の段落の後に、次の段落を足してください。

文字の表示に、Google LLC（米国）が提供する Google Fonts を利用しています。フォントの読み込みの際、閲覧者のIPアドレスなどの情報がGoogleに送信されます。

---

## 11. トップの紹介文（2026-11-17 追記）

対象：i18n/ja.yaml の home_intro（トップの惑星の下の紹介文。2行）

モス / moss のイラスト・ドット絵・ゲームブック・Live2Dなどの作品ポートフォリオです。
宇宙に浮かぶ惑星に見立てて、ジャンルごとに紹介しています。

英語版（i18n/en.yaml の home_intro）は、今の文章のままです。
