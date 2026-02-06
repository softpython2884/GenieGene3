class BioCalculator:
    def __init__(self):
        self.codon_table = {
            'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
            'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
            'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'AUG': 'Met',
            'GUU': 'Val', 'GUC': 'Val', 'GUA': 'Val', 'GUG': 'Val',
            'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
            'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
            'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
            'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
            'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'STOP', 'UAG': 'STOP',
            'CAU': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
            'AAU': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
            'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
            'UGU': 'Cys', 'UGC': 'Cys', 'UGA': 'STOP', 'UGG': 'Trp',
            'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
            'AGU': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
            'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly'
        }

    def count_nucleotides(self, sequence):
        """Counts the occurrence of each nucleotide in a sequence."""
        return {
            'A': sequence.count('A'),
            'T': sequence.count('T'),
            'C': sequence.count('C'),
            'G': sequence.count('G'),
            'U': sequence.count('U')
        }

    def transcribe_dna_to_rna(self, dna_sequence):
        """Transcribes a DNA sequence to mRNA (T -> U)."""
        return dna_sequence.replace('T', 'U')

    def translate_rna(self, rna_sequence):
        """Translates an RNA sequence into a protein sequence."""
        protein = []
        for i in range(0, len(rna_sequence), 3):
            codon = rna_sequence[i:i+3]
            if len(codon) < 3:
                break
            amino_acid = self.codon_table.get(codon, '?')
            if amino_acid == 'STOP':
                protein.append('*') # Stop codon marker
                break
            protein.append(amino_acid)
        return "".join(protein) # Standard single-letter representation usually preferred? 
        # Using 3-letter codes in table, so join with hyphen is better for readability unless converted.
        # Let's keep hyphen for 3-letter codes.
        # But wait, table has 3-letter values (Phe, Leu...). 
        # User requested: "Nombre d'acides aminés". 
        # Let's stick to hyphen join.

    def identify_mutation(self, seq1, seq2):
        """Identifies differences between two sequences."""
        diffs = []
        for i, (n1, n2) in enumerate(zip(seq1, seq2)):
            if n1 != n2:
                diffs.append(f"Position {i+1}: {n1} -> {n2}")
        return diffs
