@echo off
cd /d "%~dp0src\app"
if exist "(app)" (
    if exist "app" (
        echo Merging (app) into app...
        xcopy /s /y "(app)\*" "app\"
        echo Done.
    ) else (
        echo Renaming (app) to app...
        ren "(app)" app
        echo Done.
    )
) else (
    echo (app) directory not found, checking app...
    if exist "app" echo app directory exists - OK.
)
echo.
echo Route structure fixed.
pause
