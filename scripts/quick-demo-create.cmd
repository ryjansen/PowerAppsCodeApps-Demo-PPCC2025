@echo off
setlocal

REM Usage: quick-demo-create [environmentId] [appName]
set "environmentId=%~1"
set "appName=%~2"

echo.
echo =====================================================
echo Creating Power Apps Code App
echo Environment ID:    %environmentId%
echo App Name / Folder: %appName%
echo =====================================================

REM Force yes for npx prompts; optional but convenient
set npm_config_yes=true

echo.
echo Cloning starter template...
echo.
echo ^> npx degit microsoft/PowerAppsCodeApps/templates/starter#main "%appName%"

call npx degit microsoft/PowerAppsCodeApps/templates/starter#main "%appName%"
if errorlevel 1 ( echo Error: degit failed & exit /b 1 )

if not exist "%appName%" ( echo Error: Folder not created & exit /b 1 )
cd "%appName%"

echo.
echo Installing npm packages...
echo.
echo ^> npm install

call npm install || ( echo Error: npm install failed & exit /b 1 )

echo.
echo Initializing app with Power Apps...
echo.
echo ^> pac code init --environment "%environmentId%" --displayName "%appName%"

call pac code init --environment "%environmentId%" --displayName "%appName%" || exit /b 1

echo.
echo Building app...
echo.
echo ^> npm run build

call npm run build || exit /b 1

echo.
echo Publishing app to Power Apps...
echo.
echo ^> pac code push
call pac code push || exit /b 1

echo.
echo Done!
endlocal