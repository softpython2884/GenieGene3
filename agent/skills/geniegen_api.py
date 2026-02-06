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
            
            // Open panel to be safe
            try { oBank.openPanel(); } catch(e) {}
            
            // Add sequences by ID
            // 53: Alpha, 58: Beta, 61: Gamma
            // Check if already loaded to avoid duplicates?
            // oBank.tSel is the selection list.
            oBank.tSel = [53, 58, 61]; 
            
            oBank.loadSelection();
            return true;
        }
        """
        return self.browser.evaluate_js(script)

    def wait_for_sequences_loaded(self, min_count=3, timeout=10):
        """Waits for sequences to be present in oSeqNa.tSeq."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            count = self.browser.evaluate_js("typeof oSeqNa !== 'undefined' ? oSeqNa.tSeq.length : 0")
            if count >= min_count:
                return True
            time.sleep(0.5)
        return False

    def transcribe_sequence(self, index, use_coding_strand=False):
        """Transcribes the sequence at the given index in oSeqNa."""
        script = f"""
        () => {{
            if (typeof oSeqNa === 'undefined' || typeof oCode === 'undefined') return false;
            
            // Select the target sequence locally
            // oSeqNa.tSeq[i].sel handles selection state
            
            // Deselect all handled by app logic usually, but let's be explicit
            if (oSeq && oSeq.deselectAll) oSeq.deselectAll();
            
            if (oSeqNa.tSeq && oSeqNa.tSeq[{index}]) {{
                oSeqNa.tSeq[{index}].sel = true;
                oSeq.updateSel(); // Important to trigger UI updates
                
                // Transcribe
                // oCode.transcrireSelSeq takes boolean for coding strand
                oCode.transcrireSelSeq({str(use_coding_strand).lower()});
                return true;
            }}
            return false;
        }}
        """
        return self.browser.evaluate_js(script)

    def translate_sequence(self, index):
        """Translates the selected sequence (assumed newly added/transcribed)."""
        # Translation often creates a new sequence object or modifies view.
        # We need to ensure we target the right one.
        # Usually translation acts on the SELECTED sequence.
        
        script = f"""
        () => {{
            if (typeof oSeqNa === 'undefined' || typeof oCode === 'undefined') return false;
            
            // Assuming we want to translate the sequence at 'index'
            // NOTE: Transcription creates a NEW sequence. 
            // If we transcribed Alpha (index 0), the mRNA is likely at index 3 (if 0,1,2 were initial).
            // This method blindly translates whatever is at 'index'.
            
            oSeq.deselectAll();
            if (oSeqNa.tSeq && oSeqNa.tSeq[{index}]) {{
                oSeqNa.tSeq[{index}].sel = true;
                oSeq.updateSel();
                oCode.traduireSelSeq('debut');
                return true;
            }}
            return false;
        }}
        """
        return self.browser.evaluate_js(script)

    def get_all_sequences_data(self):
        """Extracts data for all active sequences in oSeqNa."""
        script = """
        () => {
            if (typeof oSeqNa === 'undefined' || !oSeqNa.tSeq) return [];
            
            return oSeqNa.tSeq.map(s => ({
                id: s.id,
                titre: s.titre,
                type: s.type, // ADN, ARN, PRO
                seq: s.seq,
                longueur: s.seq.length,
                // Computed/Extra fields if available
            }));
        }
        """
        return self.browser.evaluate_js(script)

