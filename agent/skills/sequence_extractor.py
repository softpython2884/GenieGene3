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

    def extract_proteins(self, html_content):
        """Extracts plausible protein sequences."""
        soup = BeautifulSoup(html_content, 'html.parser')
        proteins = []
        # Basic regex for peptide sequences (at least 10 AA, standard code)
        # Avoiding DNA-like strings if possible, but overlaps exist.
        prot_regex = re.compile(r'\b[ACDEFGHIKLMNPQRSTVWY]{10,}\b', re.HEADER)
        
        for text in soup.find_all(string=True):
            clean_text = text.strip()
            # Simple heuristic: uppercase and length, avoiding common words
            if len(clean_text) > 10 and clean_text.isupper() and " " not in clean_text:
                 proteins.append(clean_text)
        return proteins

    def extract_tables(self, html_content):
        """Extracts data from standard HTML tables."""
        soup = BeautifulSoup(html_content, 'html.parser')
        tables_data = []
        for table in soup.find_all('table'):
            rows = []
            for tr in table.find_all('tr'):
                cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append(" | ".join(cells))
            if rows:
                tables_data.append("\n".join(rows))
        return tables_data

    def find_specific_sequence(self, html_content, target_sequence):
        """Finds if a specific sequence exists in the HTML."""
        if target_sequence in html_content:
            return True
        return False
