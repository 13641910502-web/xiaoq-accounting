@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   ╔══════════════════════════════════════╗
echo   ║       小Q记账  Q + ¥                  ║
echo   ║       智能记账，轻松理财               ║
echo   ╚══════════════════════════════════════╝
echo.
echo   选择启动模式:
echo     [1] 网页版 (可视化仪表盘)
echo     [2] Expo 开发服务器 (全部平台)
echo     [3] Android 模拟器
echo.
set /p mode="请输入选项 (1/2/3): "

if "%mode%"=="1" goto web
if "%mode%"=="2" goto all
if "%mode%"=="3" goto android

:all
echo.
echo   正在启动 Expo 开发服务器...
echo   启动后按 w 打开网页版 | 按 a 打开 Android | 扫描二维码用 Expo Go
echo.
npx expo start
goto end

:web
echo.
echo   正在启动网页版...
echo   浏览器将自动打开 http://localhost:8081
echo.
npx expo start --web
goto end

:android
echo.
echo   正在启动 Android...
echo.
npx expo start --android
goto end

:end
pause
