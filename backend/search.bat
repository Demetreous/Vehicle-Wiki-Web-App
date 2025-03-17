@echo off
if "%~1"=="" (
    echo Usage: search "your query"
    exit /b 1
)
python search_faiss.py "%~1"
