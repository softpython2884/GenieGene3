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
Ta mission est d'exécuter des protocoles expérimentaux complexes.

Règles de conduite :
1. Planification : Décompose la consigne en étapes logiques.
2. Précision : Ne devine jamais. Extrais du DOM.
3. Vérification : Vérifie visuellement (DOM) après chaque action.
4. Analyse : Utilise tes connaissances biologiques.

Format de réponse attendu pour l'exécution (JSON) :
{
    "action": "click" | "type" | "navigate" | "wait" | "extract" | "calculate" | "finish",
    "target": "selecteur_css" | "url" | "sequence_a_analyser",
    "value": "texte_a_saisir" | null,
    "reasoning": "Pourquoi je fais ça"
}
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

    def run_task(self, user_goal):
        print(f"Objectif: {user_goal}")
        
        # 1. Planning (Pro)
        plan_prompt = f"""
        Objectif utilisateur : {user_goal}
        
        Décompose cette tâche en une liste numérotée d'étapes très précises pour une automatisation web.
        Identifie les moments clés où il faut extraire des données ou faire des calculs.
        """
        plan = llm_client.plan_task(plan_prompt)
        print("\n--- PLANIFICATION ---\n")
        print(plan)
        
        # 2. Execution Loop (Flash)
        steps = plan.split('\n') # Simplistic parsing, can be improved
        
        current_step_index = 0
        max_steps = 20
        step_count = 0
        
        while step_count < max_steps:
            dom_content = self.browser.get_dom_content()
            
            # Context for the agent
            context_prompt = f"""
            Objectif global: {user_goal}
            Plan: {plan}
            
            Historique récent: {self.history[-3:]}
            
            Analyse le DOM ci-dessous et décide de la PROCHAINE action immédiate.
            Réponds UNIQUEMENT le JSON.
            """
            
            response_json = llm_client.analyze_dom(context_prompt, dom_content)
            
            try:
                # Robust JSON extraction using regex
                import re
                json_match = re.search(r"\{.*\}", response_json, re.DOTALL)
                if json_match:
                    cleaned_response = json_match.group(0)
                else:
                    cleaned_response = response_json

                action_data = json.loads(cleaned_response)
                
                reasoning = action_data.get('reasoning', 'Aucun raisonnement fourni')
                action = action_data.get('action', 'unknown')
                
                print(f"\nAction: {action} - {reasoning}")
                
                self.execute_action(action_data)
                self.history.append(action_data)
                
                if action == 'finish':
                    break
                    
            except json.JSONDecodeError:
                print(f"Erreur de parsing JSON: {response_json}")
            except Exception as e:
                print(f"Erreur d'exécution: {e}")
                import traceback
                traceback.print_exc()
                break
                
            step_count += 1
            time.sleep(1) # Pause for visual following

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
        elif act == 'wait':
            try:
                ms = int(val) if val else 1000
                self.browser.wait(ms)
            except:
                self.browser.wait(1000)
        elif act == 'extract':
            # Extraction logic (simplified)
            raw_html = self.browser.get_dom_content()
            seqs = self.extractor.extract_sequences_from_html(raw_html)
            self.reporter.add_observation(f"Séquences trouvées: {len(seqs)}")
        elif act == 'calculate':
            # Calculation logic based on previous extractions
            pass
        elif act == 'finish':
            pass
        else:
            print(f"Action inconnue: {act}")

if __name__ == "__main__":
    # Test script usage
    agent = GenieAgent(headless=False)
    agent.start()
    try:
        agent.run_task("Naviguer sur GénieGène2")
    finally:
        agent.stop()
