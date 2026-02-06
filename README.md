# GenieGene2 AI Agent 🧬

Un agent intelligent capable de piloter l'application web [GénieGène2](https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/) pour réaliser des tâches de biologie moléculaire (transcription, traduction, comparaison de séquences, etc.).

## Fonctionnalités

*   **Pilotage Automatique** : Utilise Playwright pour interagir avec le site web comme un humain.
*   **Intelligence Biologique** : Utilise Gemini 2.x Pro/Flash pour comprendre les consignes et analyser les résultats.
*   **Interface Graphique** : Contrôle complet via une interface web locale simple (Streamlit).
*   **Rapport Structuré** : Génère automatiquement une synthèse "Je vois, Je sais, Je conclus".

## Installation Rapide

1.  **Clé API** :
    *   Renommez `.env.example` en `.env`.
    *   Ajoutez votre clé API Google Gemini dans `.env` (`GOOGLE_API_KEY=...`).

2.  **Lancement** :
    *   **Windows** : Double-cliquez sur `lancer_mission.bat`.
    *   **Mac/Linux** : Exécutez `./lancer_mission.sh`.

## Structure du Projet

```
GenieGene3/
├── agent/                  # Cœur de l'intelligence artificielle
│   ├── core.py             # Logique principale
│   ├── llm.py              # Connecteur Gemini
│   └── skills/             # Compétences (Navigation, Bio, etc.)
├── scripts/                # Scripts d'automatisation
├── interface.py            # Interface utilisateur (Streamlit)
├── lancer_mission.bat      # Script d'installation Windows
├── lancer_mission.sh       # Script d'installation Linux/Mac
└── requirements.txt        # Dépendances Python
```

## Stack Technique

*   **Langage** : Python 3.10+
*   **Contrôle Navigateur** : Playwright
*   **IA** : Google Gemini (via `google-genai` SDK)
*   **Interface** : Streamlit
