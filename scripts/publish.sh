#!/usr/bin/env bash
# 本番公開：renewal を main に merge して push する（Netlify が main をビルドして mossplanet.com に出す）
#
# 使い方（Claude Code の入力欄で、先頭に ! を付けて実行する。本番に入れるのは本人だけ）
#   ! bash scripts/publish.sh "変更の内容"     … 本番に入れる（変更の内容は merge のメッセージになる。省くと「サイトを更新（日付）」）
#   ! bash scripts/publish.sh --dry-run         … 試し。確認と本番条件のビルドだけ行い、main には何もしない
#
# 順番
#   1. 確認：ブランチが renewal か／コミットしていない変更が無いか／renewal と GitHub（origin/renewal）が同じか／
#      main に直接入った変更（公開の merge 以外のコミット）が無いか／
#      本番と同じ条件（CONTEXT=production）の hugo --gc --minify が通るか（出力はリポジトリの外の一時フォルダ）
#   2. 本番に入れる：checkout main → pull --ff-only → merge --no-ff renewal → push origin main
#   3. 後始末：成功しても失敗しても、できる限り renewal に戻る
#
# このスクリプトは、強制 push・reset --hard・履歴の書き換え・ブランチの削除をしない。

set -u

DRY_RUN=0
MESSAGE=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) MESSAGE="$arg" ;;
  esac
done
[ -z "$MESSAGE" ] && MESSAGE="サイトを更新（$(date +%Y-%m-%d)）"

STAGE="確認"
PUSHED=0
ON_MAIN=0

say()  { printf '%s\n' "$*"; }
stop() {
  say ""
  say "■ 止めました（段階：$STAGE）"
  say "  理由：$1"
  if [ "$ON_MAIN" = 1 ]; then
    if git checkout renewal >/dev/null 2>&1; then
      say "  手元のブランチは renewal に戻しました。"
    else
      say "  ※ renewal に戻せませんでした。git status で状態を確かめ、git checkout renewal を実行してください。"
    fi
  fi
  if [ "$PUSHED" = 1 ]; then
    say "  本番：main への push は終わっています（本番は更新されます）。"
  else
    say "  本番：変わっていません（main への push はしていません）。"
  fi
  exit 1
}

# リポジトリのいちばん上で動かす
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { say "Git のリポジトリの中で実行してください。"; exit 1; }
cd "$ROOT" || exit 1

say "== 1. 確認 =="

BRANCH="$(git branch --show-current)"
[ "$BRANCH" = "renewal" ] || stop "今のブランチが renewal ではありません（今：${BRANCH:-不明}）。git checkout renewal してから実行してください。"
say "  ブランチ：renewal"

if [ -n "$(git status --porcelain)" ]; then
  git status --short | sed 's/^/    /'
  stop "コミットしていない変更があります（上の一覧）。コミットして push するか、元に戻してから実行してください。"
fi
say "  コミットしていない変更：なし"

git fetch -q origin || stop "GitHub から最新の状態を取れませんでした（ネットワークを確かめてください）。"
LOCAL="$(git rev-parse renewal)"
REMOTE="$(git rev-parse origin/renewal 2>/dev/null)" || stop "GitHub に renewal ブランチがありません。"
if [ "$LOCAL" != "$REMOTE" ]; then
  AHEAD="$(git rev-list --count origin/renewal..renewal)"
  BEHIND="$(git rev-list --count renewal..origin/renewal)"
  [ "$AHEAD" -gt 0 ] && stop "手元の renewal に、GitHub に push していないコミットが ${AHEAD} 件あります。git push origin renewal してから実行してください。"
  [ "$BEHIND" -gt 0 ] && stop "GitHub の renewal に、手元に無いコミットが ${BEHIND} 件あります。git pull --ff-only origin renewal で取り込んで、確認用URLで確かめてから実行してください。"
fi
say "  renewal と GitHub：同じ（$(git rev-parse --short renewal)）"

# main には、公開のたびの merge のコミットが renewal に無い形で残る。それは数えず、main に直接入った変更（merge 以外のコミット）だけを見る
MAIN_ONLY="$(git rev-list --count --no-merges renewal..origin/main)"
[ "$MAIN_ONLY" -gt 0 ] && stop "GitHub の main に、renewal に無い変更（merge 以外のコミット）が ${MAIN_ONLY} 件あります。Claude Code に相談してください（このスクリプトでは入れません）。"
say "  main にだけある変更：なし（公開の merge のコミットは除く）"

say "  本番と同じ条件でビルドしています（少し時間がかかります）…"
TMP="$(mktemp -d 2>/dev/null || echo "${TMPDIR:-/tmp}/mossplanet-publish-$$")"
mkdir -p "$TMP"
# 画像の処理の結果（resources/）は、一時フォルダに写してから使う（リポジトリの resources/ と public/ は変えない）
[ -d resources ] && cp -r resources "$TMP/resources" 2>/dev/null
# 画像の処理の結果の置き場所（設定の resourceDir）は、環境変数 HUGO_RESOURCEDIR で一時フォルダに向ける
if ! CONTEXT=production HUGO_RESOURCEDIR="$TMP/resources" hugo --gc --minify --environment production \
      --destination "$TMP/public" --quiet > "$TMP/build.log" 2>&1; then
  sed 's/^/    /' "$TMP/build.log" | tail -20
  rm -rf "$TMP"
  stop "本番と同じ条件のビルドが通りません（上のエラー。仮の文章 todo が残っている、など）。renewal で直してから実行してください。"
fi
rm -rf "$TMP"
say "  本番条件のビルド：OK"

if [ "$DRY_RUN" = 1 ]; then
  say ""
  say "■ 試し（--dry-run）：確認とビルドは通りました。main には何もしていません。"
  say "  本番に入れるときは：bash scripts/publish.sh \"変更の内容\""
  exit 0
fi

say ""
say "== 2. 本番に入れる =="
say "  merge のメッセージ：$MESSAGE"

STAGE="main への切り替え"
git checkout -q main || stop "main に切り替えられませんでした。"
ON_MAIN=1

STAGE="main の取り込み（pull）"
git pull -q --ff-only origin main || stop "main を GitHub の状態にそろえられませんでした（早送りできない）。"

STAGE="merge"
if ! git merge -q --no-ff renewal -m "$MESSAGE"; then
  git merge --abort >/dev/null 2>&1
  stop "renewal を main に merge できませんでした（衝突など）。merge は取り消しました。"
fi
MERGE_ID="$(git rev-parse --short HEAD)"

STAGE="push"
git push -q origin main || stop "main を GitHub に push できませんでした（手元の main には merge のコミット ${MERGE_ID} があります。Claude Code に相談してください）。"
PUSHED=1

say ""
say "== 3. 後始末 =="
STAGE="renewal への切り替え"
git checkout -q renewal || stop "renewal に戻せませんでした。"
ON_MAIN=0
say "  手元のブランチを renewal に戻しました。"

say ""
say "■ 本番に反映しました（merge のコミット：${MERGE_ID}）。"
say "  2〜3分後に https://mossplanet.com/ で確かめてください。"
