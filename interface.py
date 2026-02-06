import streamlit as st
import sys
import os
import time
import asyncio
from io import StringIO

# Hack pour les imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Fix pour Windows et asyncio/Playwright
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from agent.core import GenieAgent
from config import GENIEGENE_URL

# Configuration de la page
st.set_page_config(
    page_title="GenieGene2 Agent",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Titre et Style
st.title("🧬 GenieGene2 - Agent de Biologie IA")
st.markdown("""
<style>
    .stButton>button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
    }
    .report-box {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #4CAF50;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.header("⚙️ Configuration")
    api_key_status = "✅ Configurée" if os.getenv("GOOGLE_API_KEY") else "❌ Manquante"
    st.write(f"Clé API: {api_key_status}")
    
    st.header("🎮 Contrôles")
    headless_mode = st.checkbox("Mode Headless (Caché)", value=False, help="Si coché, le navigateur sera invisible.")
    
    st.info("L'agent automatisera le navigateur web pour effectuer les tâches biologiques.")

# State Management
if 'report' not in st.session_state:
    st.session_state.report = None

# Layout Principal sectionné
col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("📝 Mission")
    default_prompt = f"""Aller sur {GENIEGENE_URL}.
Charger la banque de séquences "Hémoglobine".
Sélectionner les séquences "Allèle Alpha", "Allèle Bêta" et "Allèle Gamma".
Comparer les séquences pour identifier les différences.
Traduire les séquences en protéines.
Comparer les séquences protéiques.
Produire un rapport synthétique."""
    
    task_input = st.text_area("Instructions pour l'Agent", value=default_prompt, height=300)
    
    if st.button("🚀 Lancer la Mission"):
        with st.status("🧬 Mission en cours...", expanded=True) as status:
            st.write("Initialisation de l'agent...")
            try:
                # Initialisation
                agent = GenieAgent(headless=headless_mode)
                agent.start()
                
                st.write("Navigation et Analyse...")
                
                # Fonction de callback pour le log en direct
                def log_update(msg):
                    st.write(msg)
                    # Mise à jour du label du status si c'est court
                    if len(msg) < 60:
                        status.update(label=msg)
                
                report = agent.run_task(task_input, status_callback=log_update)
                
                st.session_state.report = report
                
                agent.stop()
                status.update(label="✅ Mission Terminée !", state="complete", expanded=False)
                
            except Exception as e:
                st.error(f"Une erreur est survenue : {e}")
                import traceback
                st.code(traceback.format_exc())
                status.update(label="❌ Erreur", state="error")

with col2:
    st.subheader("📊 Résultats & Rapport")
    
    if st.session_state.report:
        st.markdown('<div class="report-box">', unsafe_allow_html=True)
        st.markdown(st.session_state.report)
        st.markdown('</div>', unsafe_allow_html=True)
        
        st.download_button(
            label="💾 Télécharger le rapport (MD)",
            data=st.session_state.report,
            file_name="rapport_biologie.md",
            mime="text/markdown"
        )
    else:
        st.info("Les résultats s'afficheront ici une fois la mission terminée.")

