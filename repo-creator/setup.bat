@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  repo-creator setup
echo  Paste each value then press Enter.
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found.
  echo Install from https://nodejs.org/ then restart PC and run this again.
  pause
  exit /b 1
)

set /p CFACCOUNT="1) Cloudflare Account ID : "
set /p CFTOKEN="2) Cloudflare API token  : "
set /p GH="3) GitHub token (ghp_...) : "
set /p PASS="4) Passcode (your word)  : "

set "CLOUDFLARE_ACCOUNT_ID=%CFACCOUNT%"
set "CLOUDFLARE_API_TOKEN=%CFTOKEN%"

echo.
echo [1/3] Installing packages (takes a moment) ...
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed & pause & exit /b 1 )

echo.
echo [2/3] Deploying the tool ...
call npx wrangler deploy
if errorlevel 1 ( echo [ERROR] deploy failed & pause & exit /b 1 )

echo.
echo [3/3] Registering keys ...
echo %GH%| npx wrangler secret put GITHUB_TOKEN
echo %CFTOKEN%| npx wrangler secret put CF_API_TOKEN
echo %CFACCOUNT%| npx wrangler secret put CF_ACCOUNT_ID
echo %PASS%| npx wrangler secret put ACCESS_PASSCODE

echo.
echo ============================================================
echo  DONE.
echo  Your page URL is the   https://repo-creator.****.workers.dev
echo  printed above in [2/3]. Open it on your phone.
echo ============================================================
echo.
pause
endlocal
