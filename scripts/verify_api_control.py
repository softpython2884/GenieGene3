import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
from agent.skills.geniegen_api import GeniegenAPI
import time
import json

def verify_control():
    print("🚀 Démarrage du test API...")
    browser = BrowserController(headless=False) # Visible for visual confirmation
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5) 
    
    api = GeniegenAPI(browser)
    
    if not api.is_ready():
        print("❌ API non accessible (oBank/oSeq manquants).")
        browser.stop()
        return

    print("✅ API Détectée.")
    
    # 1. Load Sequences
    print("📥 Chargement des séquences Hémoglobine...")
    success = api.load_hemoglobin_sequences()
    print(f"   -> Resultat commande charge: {success}")
    
    time.sleep(5) # Increased wait time
    
    # Debug: Check count
    count = browser.evaluate_js("oSeq.tabSeqs ? oSeq.tabSeqs.length : -1")
    print(f"📊 Nombre de séquences après chargement: {count}")
    
    if count <= 0:
        print("❌ Aucune séquence chargée. Abandon.")
        browser.stop()
        return

    # 2. Transcribe Alpha (should be index 0)
    print("⚙️ Transcription de la séquence 0 (Alpha)...")
    res = api.transcribe_sequence(0)
    print(f"   -> Resultat transcription: {res}")
    time.sleep(1)
    
    # 3. Transcribe Beta (index 1)
    print("⚙️ Transcription de la séquence 1 (Bêta)...")
    res = api.transcribe_sequence(1)
    time.sleep(1)

    # 4. Transcribe Gamma (index 2)
    print("⚙️ Transcription de la séquence 2 (Gamma)...")
    res = api.transcribe_sequence(2)
    time.sleep(1)

    # 5. Extract Data
    print("📊 Extraction des données...")
    data = api.get_all_sequences_data()
    print(json.dumps(data, indent=2))
    
    print("Test terminé.")
    # browser.stop() # Keep open to see result

if __name__ == "__main__":
    verify_control()
