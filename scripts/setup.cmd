@echo off
setlocal

echo Checking for pac CLI installation...
dotnet tool list --global | find /I "Microsoft.PowerApps.CLI.Tool" >nul

if errorlevel 1 (
    echo pac CLI not installed. Installing...
    dotnet tool install --global Microsoft.PowerApps.CLI.Tool
) else (
    echo pac CLI is already installed. Updating to the latest version...
    dotnet tool update --global Microsoft.PowerApps.CLI.Tool
)

endlocal