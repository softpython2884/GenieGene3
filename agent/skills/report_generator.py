class ReportGenerator:
    def __init__(self):
        self.observations = []
        self.knowledge = []
        self.conclusions = []

    def add_observation(self, text):
        self.observations.append(text)

    def add_knowledge(self, text):
        self.knowledge.append(text)

    def add_conclusion(self, text):
        self.conclusions.append(text)

    def generate_report(self):
        """Generates the final structured report."""
        report = "# Synthèse de l'Analyse Biologique\n\n"
        
        report += "## Je vois (Observations)\n"
        for item in self.observations:
            report += f"- {item}\n"
        
        report += "\n## Je sais (Connaissances)\n"
        for item in self.knowledge:
            report += f"- {item}\n"
        
        report += "\n## Je conclus (Interprétation)\n"
        for item in self.conclusions:
            report += f"- {item}\n"
            
        return report

    def clear(self):
        self.observations = []
        self.knowledge = []
        self.conclusions = []
