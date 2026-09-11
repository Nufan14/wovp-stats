@echo off
REM ============================================================
REM WoVP Stats — Push rapide vers GitHub (raccourci Windows)
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   WoVP Stats - Push vers GitHub
echo ============================================================
echo.

set /p MESSAGE="Message de commit : "

if "%MESSAGE%"=="" (
    echo.
    echo Erreur : il faut un message de commit.
    echo.
    pause
    exit /b 1
)

echo.
echo Commit : %MESSAGE%
echo.

git add .
git commit -m "%MESSAGE%"

if errorlevel 1 (
    echo.
    echo Aucun changement a commiter, ou erreur.
    pause
    exit /b 0
)

git push

echo.
echo ============================================================
echo   Push termine !
echo   Site en ligne dans ~2 minutes.
echo ============================================================
echo.

pause