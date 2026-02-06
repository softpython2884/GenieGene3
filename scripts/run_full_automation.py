import sys
import os
import json
import time

# Add project root to path
sys.path.append(os.getcwd())

from agent.skills.browser_control import BrowserController
from agent.skills.geniegen_api import GeniegenAPI
from agent.skills.bio_calculator import BioCalculator
from agent.skills.report_generator import ReportGenerator

def run_automation():
    print("🚀 Démarrage de l'automatisation complète...")
    
    # 1. Initialize Components
    browser = BrowserController(headless=False)
    api = GeniegenAPI(browser)
    calc = BioCalculator()
    report_gen = ReportGenerator()
    
    try:
        browser.start()
        
        # 2. Navigate
        print("🌍 Navigation vers Geniegen2...")
        browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
        time.sleep(5) # Initial load
        
        # 3. Load Sequences
        print("📥 Chargement des séquences Hémoglobine...")
        if not api.load_hemoglobin_sequences():
            print("❌ Erreur lors de l'envoi de la commande de chargement.")
            return

        if not api.wait_for_sequences_loaded(min_count=3):
             print("❌ Timeout: Les séquences ne se sont pas chargées à temps.")
             return
             
        print("✅ Séquences chargées.")
        img_load = browser.take_screenshot("1_chargement_sequences.png")
        report_gen.add_image(img_load, "Séquences chargées (ADN)")
        
        # 4. Analyze DNA
        sequences_dna = api.get_all_sequences_data()
        report_gen.add_observation(f"J'ai chargé {len(sequences_dna)} séquences d'ADN/ARN.")
        
        for seq in sequences_dna:
            # Stats locally
            counts = calc.count_nucleotides(seq['seq'])
            report_gen.add_observation(f"Séquence {seq['titre']} (ADN): {seq['longueur']} nucléotides. Composition: {counts}")
            
        # 5. Transcription
        print("⚙️ Transcription des séquences...")
        # Alpha (0), Beta (1), Gamma (2) -> mRNA will be added
        api.transcribe_sequence(0) 
        api.transcribe_sequence(1)
        api.transcribe_sequence(2)
        
        api.wait_for_sequences_loaded(min_count=6)
        print("✅ Transcription terminée.")
        img_trans = browser.take_screenshot("2_transcription.png")
        report_gen.add_image(img_load, "Séquences transcrites (ARNm)")
        
        # 6. Translation
        print("⚙️ Traduction des ARN...")
        # Assuming new RNA sequences are at indices 3, 4, 5
        # We need to refresh our list to be sure of indices
        sequences_all = api.get_all_sequences_data()
        indices_rn = [i for i, s in enumerate(sequences_all) if s['type'] == 'ARN']
        
        for idx in indices_rn:
            api.translate_sequence(idx)
            
        api.wait_for_sequences_loaded(min_count=9) # 3 DNA + 3 RNA + 3 PRO
        print("✅ Traduction terminée.")
        img_transl = browser.take_screenshot("3_traduction.png")
        report_gen.add_image(img_transl, "Séquences traduites (Protéines)")
        
        # 7. Final Data Collection
        print("📊 Collecte des résultats finaux...")
        final_sequences = api.get_all_sequences_data()
        
        # 8. Comparison Analysis (Bio Logic)
        # Sequence titles are likely 'HBA...', 'HBB...', 'HBG...'
        seq_alpha_pro = next((s for s in final_sequences if 'HBA' in s['titre'] and s['type'] == 'PRO'), None)
        seq_beta_pro = next((s for s in final_sequences if 'HBB' in s['titre'] and s['type'] == 'PRO'), None)
        seq_gamma_pro = next((s for s in final_sequences if 'HBG' in s['titre'] and s['type'] == 'PRO'), None)

        if seq_alpha_pro:
            report_gen.add_observation(f"Protéine Alpha trouvée: {len(seq_alpha_pro['seq'])} acides aminés.")
        
        if seq_alpha_pro and seq_beta_pro:
             # Basic length check before mutation
             l = min(len(seq_alpha_pro['seq']), len(seq_beta_pro['seq']))
             diffs = calc.identify_mutation(seq_alpha_pro['seq'][:l], seq_beta_pro['seq'][:l])
             report_gen.add_knowledge(f"Comparaison Alpha vs Bêta (Protéine): {len(diffs)} différences sur les {l} premiers acides aminés.")
             
        if seq_beta_pro and seq_gamma_pro:
             l = min(len(seq_beta_pro['seq']), len(seq_gamma_pro['seq']))
             diffs = calc.identify_mutation(seq_beta_pro['seq'][:l], seq_gamma_pro['seq'][:l])
             report_gen.add_knowledge(f"Comparaison Bêta vs Gamma (Protéine): {len(diffs)} différences sur les {l} premiers acides aminés.")

        # 9. Conclusions
        report_gen.add_conclusion("Les séquences d'hémoglobine Bêta et Gamma sont très proches, suggérant une parenté évolutive (duplication de gène).")
        report_gen.add_conclusion("L'hémoglobine Alpha est plus éloignée.")
        
        # 10. Generate Report
        markdown_report = report_gen.generate_report()
        
        # Make screenshots relative in report if needed, but absolute path is safer for now or just basename if in same dir.
        # Report generator uses raw path passed.
        
        report_path = "rapport_analyse_hemoglobine.md"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(markdown_report)
            
        print(f"📄 Rapport généré : {report_path}")
        print(markdown_report)
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # browser.stop()
        pass

if __name__ == "__main__":
    run_automation()
