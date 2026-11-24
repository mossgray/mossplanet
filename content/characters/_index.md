---
title: "キャラクター"
# キャラクターページ（/original/<キャラクターID>/）のまとまり。docs/spec.md 第6.7節
# この節そのものの一覧ページ（/characters/）は作らない。各ページの URL は front matter の url で決める
build:
  render: never
  list: always
cascade:
  # 元画像はそのまま公開せず、テンプレートで軽量化した画像だけを出力する
  build:
    publishResources: false
---
