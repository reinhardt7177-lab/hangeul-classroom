@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 태블릿 QR을 쓰려면 Node.js가 필요합니다. 공식 Node.js를 설치한 뒤 다시 실행해 주세요.
  pause
  exit /b 1
)
echo 오늘의 국경일(한글날·개천절) 교실 서버를 시작합니다.
echo 교사 컴퓨터에서 http://localhost:4198/ 주소를 열어 주세요.
echo 수업 중에는 이 창을 열어 두고, 수업이 끝나면 Ctrl+C를 눌러 종료하세요.
node server.mjs
if errorlevel 1 pause
