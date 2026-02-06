#!/bin/bash

echo "==================================================="
echo "   INSTALLATION ET LANCEMENT DE GENIEGENE AGENT"
echo "==================================================="

# 1. Vérification de Python
if ! command -v python3 &> /dev/null; then
    echo "[ERREUR] Python3 n'est pas installé."
    exit 1
fi

# 2. Configuration de la clé API
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "[.env] Fichier créé à partir de .env.example."
    else
        echo "GOOGLE_API_KEY=votre_cle_ici" > .env
        echo "[.env] Fichier créé."
    fi
    echo ""
    echo "[ATTENTION] VOUS DEVEZ CONFIGURER VOTRE CLE API GEMINI !"
    echo "Le fichier .env a été créé. Modifiez-le pour ajouter votre clé."
    echo "Une fois fait, relancez ce script."
    exit 1
fi

# 3. Création de l'environnement virtuel
if [ ! -d "venv" ]; then
    echo "[VENV] Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# 4. Activation et installation
echo "[VENV] Activation..."
source venv/bin/activate

echo "[PIP] Installation des dépendances..."
pip install -r requirements.txt

echo "[PLAYWRIGHT] Installation des navigateurs..."
python3 -m playwright install chromium

# 5. Lancement
echo ""
echo "==================================================="
echo "   LANCEMENT DE L'INTERFACE"
echo "==================================================="
echo ""
streamlit run interface.py
