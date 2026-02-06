import sys
import os

# Ajout du dossier racine au PATH pour permettre les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.core import GenieAgent
from config import GENIEGENE_URL

def main():
    print("Démarrage de l'agent GenieGene2...")
    agent = GenieAgent(headless=False)
    
    try:
        agent.start()
        
        # Consigne spécifique pour l'Hémoglobine
        task_prompt = f"""
        Aller sur {GENIEGENE_URL}.
        Charger la banque de séquences "Hémoglobine".
        Sélectionner les séquences "Allèle Alpha", "Allèle Bêta" et "Allèle Gamma".
        Comparer les séquences pour identifier les différences.
        Traduire les séquences en protéines.
        Comparer les séquences protéiques.
        Produire un rapport synthétique expliquant les différences observées (mutations) et leurs conséquences.
        """
        
        report = agent.run_task(task_prompt)
        print("\n=== FIN DE LA MISSION ===")
        print(report)
        
    except Exception as e:
        print(f"Une erreur est survenue : {e}")
    finally:
        import time
        time.sleep(5)
        agent.stop()

if __name__ == "__main__":
    main()
