from bs4 import BeautifulSoup
import re

class SequenceExtractor:
    def __init__(self):
        pass

    def extract_sequences_from_html(self, html_content):
        """
        Extracts plausible DNA/RNA sequences from HTML content.
        Returns a list of dictionaries with 'text' and 'context'.
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        sequences = []

        # Find all text nodes
        text_nodes = soup.find_all(string=True)

        # Regex for long sequences of nucleotides (at least 10 chars)
        dna_regex = re.compile(r'\b[ATCGU]{10,}\b', re.IGNORECASE)

        for text in text_nodes:
            clean_text = text.strip()
            if dna_regex.search(clean_text):
                parent = text.parent
                sequences.append({
                    'sequence': clean_text,
                    'tag': parent.name,
                    'class': parent.get('class', []),
                    'id': parent.get('id', '')
                })
        
        return sequences

    def find_specific_sequence(self, html_content, target_sequence):
        """Finds if a specific sequence exists in the HTML."""
        if target_sequence in html_content:
            return True
        return False
