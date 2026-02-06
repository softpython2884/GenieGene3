import json
import time

class GeniegenAPI:
    def __init__(self, browser_controller):
        self.browser = browser_controller

    def is_ready(self):
        """Checks if the API is accessible."""
        return self.browser.evaluate_js("(typeof oBank !== 'undefined' && typeof oSeq !== 'undefined')")

    def load_hemoglobin_sequences(self):
        """Loads the specific hemoglobin sequences (Alpha, Beta, Gamma)."""
        script = """
        () => {
            if (typeof oBank === 'undefined') return false;
            
            // Open panel IS needed because addToSel might interact with the DOM elements of the panel
            try {
                oBank.openPanel(); 
            } catch(e) { console.log("Panel open error", e); }
            
            // Add sequences
            oBank.addToSel(53); // Alpha
            oBank.addToSel(58); // Beta
            oBank.addToSel(61); // Gamma
            
            oBank.loadSelection();
            return true;
        }
        """
        return self.browser.evaluate_js(script)

    def transcribe_sequence(self, index, use_coding_strand=False):
        """Transcribes the sequence at the given index."""
        # 0 = non-transcrit (default), 1 = transcrit (matrice)
        # The logic in the app seems to be: Select seq, then action.
        # But we can perhaps call oCode.transcrire(seqObject) direct?
        # Log showed: oCode.transcrireSelSeq(false)
        
        # We need to SELECT the sequence first programmatically.
        # oSeq.select(id)? oSeq.tabSeqs[i].selected = true?
        
        script = f"""
        () => {{
            if (!oSeq || !oCode) return false;
            
            // Deselect all
            oSeq.deselectAll();
            
            // Select the target sequence
            // Assuming tabSeqs is the array
            if (oSeq.tabSeqs && oSeq.tabSeqs[{index}]) {{
                oSeq.tabSeqs[{index}].selected = true;
                // Force redraw or update state? 
                // oSeq.update(); // Hypothetical
                
                // Transcribe
                oCode.transcrireSelSeq({str(use_coding_strand).lower()});
                return true;
            }}
            return false;
        }}
        """
        return self.browser.evaluate_js(script)

    def translate_sequence(self, index):
        """Translates the sequence at the given index."""
        # Log: oCode.traduireSelSeq('debut')
        script = f"""
        () => {{
            if (!oSeq || !oCode) return false;
            oSeq.deselectAll();
            
            if (oSeq.tabSeqs && oSeq.tabSeqs[{index}]) {{
                oSeq.tabSeqs[{index}].selected = true;
                oCode.traduireSelSeq('debut');
                return true;
            }}
            return false;
        }}
        """
        return self.browser.evaluate_js(script)

    def get_all_sequences_data(self):
        """Extracts data for all active sequences."""
        script = """
        () => {
            if (!oSeq || !oSeq.tabSeqs) return [];
            
            return oSeq.tabSeqs.map(s => ({
                id: s.id,
                nom: s.nom,
                type: s.type, // ADN, ARN, PRO
                seq: s.seq,
                longueur: s.seq.length,
                brin: s.infoBrin || "Inconnu" // Hypothetical field
            }));
        }
        """
        return self.browser.evaluate_js(script)
