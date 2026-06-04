@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================================
echo  repo-creator セットアップ
echo  画面の指示どおりに進めてください。
echo ============================================================
echo.

rem --- Node.js の確認 ---
where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js が見つかりません。
  echo     https://nodejs.org/ja/ からインストールし、PCを再起動してから
  echo     もう一度このファイルをダブルクリックしてください。
  echo.
  pause
  exit /b 1
)

echo === 1/4 必要な部品をインストール中（少し時間がかかります） ===
call npm install
if errorlevel 1 ( echo [!] インストールに失敗しました。& pause & exit /b 1 )
echo.

echo === 2/4 Cloudflare にログインします ===
echo     ブラウザが開いたら「Allow / 許可」を押してください。
call npx wrangler login
if errorlevel 1 ( echo [!] ログインに失敗しました。& pause & exit /b 1 )
echo.

echo === 3/4 ツールを公開（デプロイ）します ===
call npx wrangler deploy
if errorlevel 1 ( echo [!] 公開に失敗しました。& pause & exit /b 1 )
echo.

echo === 4/4 鍵を登録します。聞かれたら貼り付けて Enter を押してください ===
echo     （貼り付けは右クリック または Ctrl+V）
echo.

set /p GH="GitHub トークン（ghp_ で始まる文字列）: "
echo %GH%| npx wrangler secret put GITHUB_TOKEN

set /p CFT="Cloudflare API トークン: "
echo %CFT%| npx wrangler secret put CF_API_TOKEN

set /p CFA="Cloudflare アカウントID: "
echo %CFA%| npx wrangler secret put CF_ACCOUNT_ID

set /p PASS="合言葉（自分で決めた文字列）: "
echo %PASS%| npx wrangler secret put ACCESS_PASSCODE

echo.
echo ============================================================
echo  完了しました！
echo  上の方に表示された  https://repo-creator.****.workers.dev
echo  が、あなたのリポジトリ作成ページのURLです。
echo  スマホでそのURLを開き、ホーム画面に追加すると便利です。
echo ============================================================
echo.
pause
endlocal
