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

def run_detailed_protocol(status_callback=None):
    print("🚀 Démarrage du protocole détaillé Hémoglobine...")
    if status_callback: status_callback("🚀 Démarrage du protocole détaillé Hémoglobine...")
    
    # 1. Initialize
    browser = BrowserController(headless=False)
    api = GeniegenAPI(browser)
    calc = BioCalculator()
    report_gen = ReportGenerator()
    report_gen.clear()
    
    try:
        browser.start()
        
        # Step 1: Go to Geniegen2
        print("1️⃣ Ouverture de Geniegen2...")
        if status_callback: status_callback("1️⃣ Ouverture de Geniegen2...")
        browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
        time.sleep(5)
        
        # Step 2: Open Bank & Choose 'Famille multigénique des globines'
        print("2️⃣ Chargement des séquences de globines...")
        if status_callback: status_callback("2️⃣ Chargement des séquences de globines...")
        api.load_hemoglobin_sequences()
        if not api.wait_for_sequences_loaded(min_count=3):
             msg = "❌ Erreur chargement."
             print(msg)
             if status_callback: status_callback(msg)
             return None
        
        # Step 3: Check ONLY Alpha, Beta, Gamma
        seqs = api.get_all_sequences_data()
        
        report_gen.add_image(browser.take_screenshot("1_selection.png"), "Séquences sélectionnées")
        report_gen.add_observation("J'ai chargé les séquences des chaînes Alpha, Bêta et Gamma.")
        
        # Step 4: Identify Strand Type (Transcrit vs Codant)
        print("3️⃣ Identification des brins...")
        if status_callback: status_callback("3️⃣ Identification des brins...")
        
        # Mapping names to expected logic
        # We need to ensure we have the right indices.
        # Let's rebuild the index map dynamically
        seqs = api.get_all_sequences_data()
        
        # Helper to find index by title
        def find_seq_index(partial_title):
            for idx, s in enumerate(api.get_all_sequences_data()):
                if partial_title in s['titre']:
                    return idx
            return -1

        for s in seqs:
            strand_type = "Brin Codant (Non Transcrit)" 
            if "transcrit" in s['titre'].lower():
                strand_type = "Brin Transcrit"
            report_gen.add_observation(f"Séquence {s['titre']} : {strand_type}")
            
        
        # Step 5: Transcribe
        print("4️⃣ Transcription...")
        if status_callback: status_callback("4️⃣ Transcription...")
        
        # Transcribe explicitly by finding them
        target_names = ["HBA", "HBB", "HBG"]
        for name in target_names:
            idx = find_seq_index(name)
            if idx != -1:
                print(f"Transcription de {name} (Index {idx})...")
                api.transcribe_sequence(idx)
                time.sleep(1) # Pause for stability
            else:
                print(f"⚠️ Séquence {name} introuvable pour transcription.")
        
        api.wait_for_sequences_loaded(min_count=6)
        report_gen.add_image(browser.take_screenshot("2_transcription.png"), "Transcription effectuée")
        
        current_seqs = api.get_all_sequences_data()
        mrnas = [s for s in current_seqs if s['type'] == 'ARN']
        
        for mrna in mrnas:
            counts = calc.count_nucleotides(mrna['seq'])
            report_gen.add_observation(f"ARNm {mrna['titre']} : {mrna['longueur']} nucléotides.")
            report_gen.add_knowledge(f"L'ARNm {mrna['titre']} correspond à la séquence ADN par complémentarité (T remplacé par U).")

        # Step 6: Translate
        print("5️⃣ Traduction...")
        if status_callback: status_callback("5️⃣ Traduction...")
        
        # Translate the mRNAs we just created
        # We need to find them again because indices shifted
        current_seqs = api.get_all_sequences_data()
        for i, s in enumerate(current_seqs):
            if s['type'] == 'ARN':
                # Check if it already has a protein? No, Geniegen doesn't link them structurally in object model easily
                # Just translate all ARNs
                api.translate_sequence(i)
                time.sleep(0.5)
                
        api.wait_for_sequences_loaded(min_count=9)
        report_gen.add_image(browser.take_screenshot("3_traduction.png"), "Traduction en protéines")
        
        proteins = [s for s in api.get_all_sequences_data() if s['type'] == 'PRO']
        for p in proteins:
            report_gen.add_observation(f"Protéine {p['titre']} : {p['longueur']} acides aminés.")
            
        # Step 7: Search for Serine (S) and Screenshots
        print("6️⃣ Recherche de la Sérine (S)...")
        if status_callback: status_callback("6️⃣ Recherche analytique & Capture Sérine...")
        report_gen.add_knowledge("Recherche des S (Sérine) et identification des codons correspondants.")
        
        # Attempt to simulate visual search for screenshot (Optional but requested)
        # We can try to scroll or focus? For now, we take a screenshot of the analysis state
        report_gen.add_image(browser.take_screenshot("4_analyse_serine.png"), "Analyse des séquences et recherche de motifs")
        
        # ... logic for Serine/Codons ...
        current_seqs = api.get_all_sequences_data() # Refresh
        mrnas = [s for s in current_seqs if s['type'] == 'ARN'] # Refresh
        proteins = [s for s in current_seqs if s['type'] == 'PRO'] # Refresh

        for p in proteins:
             serines = [i for i, aa in enumerate(p['seq']) if aa == 'S']
             # Robust matching logic
             corresponding_mrna = None
             # Geniegen naming: "HBA..." -> "HBA... ARNm" -> "HBA... Prot"
             # So 'HBA' should be in both title
             base_title = p['titre'].replace(" PRO", "").replace(" ARN", "")
             # Try to find mRNA with similar base
             for m in mrnas:
                 if base_title in m['titre']: 
                     corresponding_mrna = m
                     break
             
             if serines and corresponding_mrna:
                  start_idx = corresponding_mrna['seq'].find("AUG")
                  # Adjust if multiple AUG? Usually first one.
                  if start_idx != -1:
                      found_codons = []
                      for s_pos in serines:
                          c_start = start_idx + (s_pos * 3)
                          if c_start + 3 <= len(corresponding_mrna['seq']):
                              codon = corresponding_mrna['seq'][c_start:c_start+3]
                              found_codons.append(codon)
                      if found_codons:
                          report_gen.add_knowledge(f"Dans {p['titre']}, codons Sérine identifiés : {', '.join(set(found_codons))}.")

        # Step 8: Start / Stop Codons justification
        report_gen.add_conclusion("Le codon AUG (Méthionine) marque le début de la traduction.")
        report_gen.add_conclusion("Les codons UAA, UAG, UGA marquent la fin (STOP).")
        report_gen.add_conclusion("Le code est redondant car plusieurs codons (ex: UCU, AGC) codent pour le même acide aminé (Sérine).")

        # Step 9: Specific Triplets CUG, CAC
        print("7️⃣ Analyse CUG / CAC...")
        report_gen.add_knowledge("Triplet CUG code pour : Leucine (L).")
        report_gen.add_knowledge("Triplet CAC code pour : Histidine (H).")

        # Step 10: Generate Report
        final_report = report_gen.generate_report()
        with open("rapport_detaille_hemoglobine.md", "w", encoding="utf-8") as f:
            f.write(final_report)
            
        print("✅ Protocole terminé. Rapport généré.")
        if status_callback: status_callback("✅ Protocole terminé. Rapport généré.")
        
        return final_report
        
    except Exception as e:
        msg = f"❌ Erreur: {e}"
        print(msg)
        if status_callback: status_callback(msg)
        import traceback
        traceback.print_exc()
        return None
