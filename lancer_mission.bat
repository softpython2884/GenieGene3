@echo off
setlocal
echo ===================================================
echo    INSTALLATION ET LANCEMENT DE GENIEGENE AGENT
echo ===================================================

REM 1. Vérification de Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou pas dans le PATH.
    echo Veuillez installer Python depuis python.org et cocher "Add Python to PATH".
    pause
    exit /b
)

REM 2. Configuration de la clé API
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [.env] Fichier cree a partir de .env.example.
    ) else (
        echo GOOGLE_API_KEY=votre_cle_ici > .env
        echo [.env] Fichier cree.
    )
    echo.
    echo [ATTENTION] VOUS DEVEZ CONFIGURER VOTRE CLE API GEMINI !
    echo Le fichier .env a ete cree. Ouvrez-le et remplacez 'votre_cle_ici' par votre vraie cle.
    echo (https://aistudio.google.com/app/apikey)
    echo.
    echo Appuyez sur une touche une fois la cle configuree pour continuer...
    pause
)

REM 3. Création de l'environnement virtuel (avec python -m pour éviter les erreurs de path)
if not exist venv (
    echo [VENV] Creation de l'environnement virtuel...
    python -m venv venv
)

REM 4. Activation et installation
echo [VENV] Activation...
call venv\Scripts\activate

echo [PIP] Mise a jour de pip...
python -m pip install --upgrade pip

echo [PIP] Installation des dependances...
python -m pip install -r requirements.txt

echo [PLAYWRIGHT] Installation des navigateurs...
python -m playwright install chromium

REM 5. Lancement de l'interface
echo.
echo ===================================================
echo    LANCEMENT DE L'INTERFACE
echo ===================================================
echo.
echo Ouverture de l'application dans votre navigateur...
streamlit run interface.py

pause
