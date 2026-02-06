import time
import json
from agent.llm import llm_client
from agent.skills.browser_control import BrowserController
from agent.skills.bio_calculator import BioCalculator
from agent.skills.sequence_extractor import SequenceExtractor
from agent.skills.report_generator import ReportGenerator
from config import GENIEGENE_URL

SYSTEM_PROMPT = """
Tu es un expert en bio-informatique pilotant GénieGène2 via Playwright.
Ta mission est d'exécuter des protocoles expérimentaux complexes avec une RIGUEUR SCIENTIFIQUE absolue.

Règles d'OR (Science & Méthode) :
1. DÉMARCHE SCIENTIFIQUE : Pour chaque étape clé, structure ta pensée ainsi :
   - JE VOIS (Observation) : Ce qui est affiché à l'écran (ex: "La séquence HBA commence par ATG").
   - JE SAIS (Connaissance) : Tes connaissances biologiques (ex: "ATG est le codon d'initiation").
   - JE CONCLUS (Interprétation) : Le résultat logique (ex: "La traduction commence ici").
2. BIOLOGIE PRÉCISE :
   - Brin Codant (Défaut sur Geniegen) : Identique à l'ARNm (sauf T -> U).
   - Brin Transcrit (Non-Codant) : Complémentaire de l'ARNm.
   - Ne confonds jamais "Complémentarité" et "Identité". Si tu vois ATG sur le brin codant et AUG sur l'ARNm, c'est une IDENTITÉ (T->U).
3. VÉRIFICATION VISUELLE : Ne suppose jamais que le logiciel a marché. Vérifie le DOM ou prends une capture.
4. PLANIFICATION : Décompose la tâche en actions atomiques.

Format de réponse attendu pour l'exécution (JSON) :
Une SEULE action :
{ "action": "...", "target": "...", ... }
OU une LISTE d'actions (pour aller plus vite, ex: cocher plusieurs cases) :
[
  { "action": "...", "target": "...", "reasoning": "Je sélectionne HBA..." },
  { "action": "...", "target": "...", "reasoning": "Je sélectionne HBB..." }
]
IMPORTANT : 'target' est OBLIGATOIRE sauf pour 'wait'.
"""

class GenieAgent:
    def __init__(self, headless=False):
        self.browser = BrowserController(headless=headless)
        self.bio_calc = BioCalculator()
        self.extractor = SequenceExtractor()
        self.reporter = ReportGenerator()
        self.history = []

    def start(self):
        self.browser.start()

    def stop(self):
        self.browser.stop()

    def run_task(self, user_goal, status_callback=None):
        print(f"Objectif: {user_goal}")
        
        # 1. Planning (Pro)
        if status_callback:
            status_callback("🧠 Planification de la mission...")
            
        plan_prompt = f"""
        Objectif utilisateur : {user_goal}
        
        Décompose cette tâche en une liste numérotée d'étapes très précises pour une automatisation web.
        Identifie les moments clés où il faut extraire des données ou faire des calculs.
        """
        plan = llm_client.plan_task(plan_prompt)
        print("\n--- PLANIFICATION ---\n")
        print(plan)
        # 2. auto-navigation pour éviter la page blanche
        print(f"🚀 Navigation automatique vers {GENIEGENE_URL}...")
        if status_callback:
            status_callback("🚀 Démarrage et Navigation...")
            
        self.browser.navigate(GENIEGENE_URL)
        time.sleep(2)

        # 3. Execution Loop (Flash)
        steps = plan.split('\n') # Simplistic parsing, can be improved
        
        current_step_index = 0
        max_steps = 20
        step_count = 0
        
        consecutive_failures = 0
        last_action_str = ""
        
        while step_count < max_steps:
            # Use cleaned DOM to save tokens and focus LLM
            dom_content = self.browser.get_dom_content(clean=True)
            
            # Context for the agent
            context_prompt = f"""
            {SYSTEM_PROMPT}

            Objectif global: {user_goal}
            Plan: {plan}
            
            Historique récent: {self.history[-5:]}
            
            Analyse le DOM ci-dessous et décide de la PROCHAINE action immédiate.
            Réponds UNIQUEMENT le JSON.
            """
            
            if status_callback:
                status_callback(f"🤔 Analyse de la page (Étape {step_count + 1})...")
                
            response_json = llm_client.analyze_dom(context_prompt, dom_content)
            
            try:
                # Robust JSON extraction
                cleaned_response = response_json.strip()
                # Remove markdown code blocks if present
                if "```" in cleaned_response:
                    cleaned_response = cleaned_response.split("```")[-2] # Get content inside last block
                    if cleaned_response.startswith("json"):
                        cleaned_response = cleaned_response[4:]
                
                cleaned_response = cleaned_response.strip()
                
                print(f"🔍 Réponse brute LLM: {cleaned_response}") 
                action_data = json.loads(cleaned_response)
                
                action_list = []
                if isinstance(action_data, list):
                    action_list = action_data
                else:
                    action_list = [action_data]
                
                if not action_list:
                     raise ValueError("Liste d'actions vide")

                # Execute all actions in the batch
                for i, action_item in enumerate(action_list):
                    # Loop detection (on the single action)
                    current_action_str = str(action_item)
                    if current_action_str == last_action_str:
                        consecutive_failures += 1
                        print(f"⚠️ Détection de boucle ({consecutive_failures}/3)")
                        if consecutive_failures >= 3:
                            print("❌ Boucle infinie détectée, arrêt d'urgence.")
                            # Break inner loop and outer loop request
                            step_count = max_steps 
                            break
                    else:
                        consecutive_failures = 0
                    last_action_str = current_action_str

                    reasoning = action_item.get('reasoning', 'Aucun raisonnement fourni')
                    action = action_item.get('action', 'unknown')
                    target_check = action_item.get('target')
                    
                    log_msg = f"Action ({i+1}/{len(action_list)}): {action} - {reasoning}"
                    print(f"\n{log_msg}")
                    
                    if status_callback:
                        status_callback(f"⚡ {action}: {reasoning[:60]}...")
                    
                    self.execute_action(action_item)
                    self.history.append(action_item)
                    
                    if action == 'finish':
                        step_count = max_steps # Force exit
                        break
                    
                    # Small pause between batched actions
                    if len(action_list) > 1:
                        time.sleep(0.2)

            except json.JSONDecodeError:
                print(f"Erreur de parsing JSON: {response_json}")
                consecutive_failures += 1
            except Exception as e:
                print(f"Erreur d'exécution: {e}")
                import traceback
                traceback.print_exc()
                consecutive_failures += 1
            
            if consecutive_failures >= 5:
                print("❌ Trop d'erreurs consécutives, arrêt.")
                break

            step_count += 1
            # Sleep moved inside the batch loop or handled naturally by LLM latency
            # We keep a small sleep here just in case of single actions
            if len(action_list) == 1:
                 time.sleep(0.3)

        # 3. Final Report
        report = self.reporter.generate_report()
        print("\n--- RAPPORT FINAL ---\n")
        print(report)
        return report

    def execute_action(self, action_data):
        act = action_data.get('action')
        tgt = action_data.get('target')
        val = action_data.get('value')
        
        if act == 'navigate':
            if not tgt:
                print("⚠️ Cible de navigation manquante.")
                # Fallback intelligent
                if "geniegen2" in str(action_data).lower() or len(self.history) == 0:
                     print(f"🔄 Utilisation de l'URL par défaut : {GENIEGENE_URL}")
                     tgt = GENIEGENE_URL
                else:
                    print("❌ Impossible de naviguer : pas d'URL fournie.")
                    return

            self.browser.navigate(tgt)
        elif act == 'click':
            if tgt:
                self.browser.click_element(tgt)
            else:
                print("⚠️ Cible de clic manquante.")
        elif act == 'type':
            if tgt:
                self.browser.type_text(tgt, val)
            else:
                print("⚠️ Cible de saisie manquante.")
        elif act == 'select':
            if tgt and val:
                try:
                    self.browser.select_option(tgt, val)
                except Exception as e:
                    print(f"⚠️ Erreur de sélection option '{val}' sur '{tgt}': {e}")
            else:
                print("⚠️ Cible ou valeur de sélection manquante.")
        elif act == 'screenshot':
            filename = f"screenshot_{int(time.time())}.png"
            # Sauvegarde dans le dossier courant ou un dossier dédié
            filepath = f"screenshots/{filename}"
            import os
            os.makedirs("screenshots", exist_ok=True)
            self.browser.take_screenshot(filepath)
            print(f"📸 Capture d'écran sauvegardée : {filepath}")
            self.reporter.add_observation(f"Capture d'écran prise : {filename}")
        elif act == 'wait':
            try:
                ms = int(val) if val else 1000
                self.browser.wait(ms)
            except:
                self.browser.wait(1000)
        elif act == 'extract':
            # Improved extraction logic
            if tgt:
                # Check for JS extraction
                if tgt.startswith("window.") or tgt.startswith("document.") or "return " in tgt:
                     print(f"🖥️ Exécution JS: {tgt[:50]}...")
                     res = self.browser.evaluate_js(tgt)
                     if res:
                         self.reporter.add_observation(f"Donnée JS ({tgt[:30]}...): {res}")
                         # Also print specifically for the user to see in logs
                         print(f"✅ Résultat JS: {res}")
                     else:
                         print("⚠️ Résultat JS vide ou erreur.")
                else:
                    # Targeted text extraction
                    text = self.browser.get_text(tgt)
                    if text:
                        print(f"📄 Texte extrait de {tgt}: {text[:50]}...")
                        self.reporter.add_observation(f"Donnée extraite ({tgt}): {text}")
                    else:
                        print(f"⚠️ Impossible d'extraire le texte de {tgt}")
            else:
                # General extraction (tables, sequences)
                print("🔍 Extraction générale (Tables & Séquences)...")
                raw_html = self.browser.get_dom_content()
                
                # Tables (Comparison results)
                tables = self.extractor.extract_tables(raw_html)
                for i, table in enumerate(tables):
                    self.reporter.add_observation(f"Tableau {i+1}:\n{table}")
                    print(f"📊 Tableau extrait:\n{table}")

                # Sequences
                seqs = self.extractor.extract_sequences_from_html(raw_html)
                prots = self.extractor.extract_proteins(raw_html)
                
                if seqs:
                    self.reporter.add_observation(f"Séquences ADN trouvées: {len(seqs)}")
                if prots:
                    self.reporter.add_observation(f"Protéines trouvées: {len(prots)}")
                
                if not tables and not seqs and not prots:
                    self.reporter.add_observation("Aucune donnée structurée trouvée automatiquement.")

if __name__ == "__main__":
    # Test script usage
    agent = GenieAgent(headless=False)
    agent.start()
    try:
        agent.run_task("Naviguer sur GénieGène2")
    finally:
        agent.stop()
