@echo off
setlocal
cd /d "%~dp0"
echo [1/3] Installing npm packages...
npm install
if errorlevel 1 goto :fail
echo [2/3] Adding Android platform...
if not exist android npx cap add android
if errorlevel 1 goto :fail
echo [3/3] Syncing Android project...
npx cap sync android
if errorlevel 1 goto :fail
echo.
echo DONE. Opening Android Studio...
npx cap open android
exit /b 0
:fail
echo.
echo Build setup failed. Check Node.js, Android Studio/SDK and internet connection.
exit /b 1
