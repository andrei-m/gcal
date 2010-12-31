@setlocal
@echo off

:: Kill the current sidebar process
taskkill /f /im sidebar.exe

:: Update files
set src="%CD%"
set dst="%USERPROFILE%\appdata\local\microsoft\windows sidebar\gadgets\gcal.gadget"

xcopy /s /y %src% %dst%

:: Relaunch sidebar
start "" "%ProgramFiles%\Windows Sidebar\sidebar.exe"

@endlocal