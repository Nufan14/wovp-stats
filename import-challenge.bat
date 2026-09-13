@echo off
REM ============================================================
REM WoVP Stats — Import Challenge (raccourci Windows)
REM ============================================================

cd /d "%~dp0"

python import-challenge.py

REM La fenêtre reste ouverte si le script plante
if errorlevel 1 (
    echo.
    echo Le script a rencontre une erreur.
    pause
)