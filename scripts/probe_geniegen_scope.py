import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
import time

def probe_scope():
    browser = BrowserController(headless=True)
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5) 
    
    # Probe direct access (not window.oBank) in case of let/const
    js_script = """
    (() => {
        const report = {};
        
        try {
            report.oBank_exists = typeof oBank !== 'undefined';
            if (report.oBank_exists) {
                report.oBank_keys = Object.keys(oBank);
            }
        } catch(e) { report.oBank_error = e.toString(); }

        try {
            report.oSeq_exists = typeof oSeq !== 'undefined';
            if (report.oSeq_exists) {
                report.oSeq_keys = Object.keys(oSeq);
                // Check if we can read sequences
                report.tabSeqs_exists = !!oSeq.tabSeqs;
                if (oSeq.tabSeqs) {
                    report.seq_count = oSeq.tabSeqs.length;
                    report.data_structure_sample = oSeq.tabSeqs[0];
                }
            }
        } catch(e) { report.oSeq_error = e.toString(); }

        return report;
    })()
    """
    
    print("🕵️ Probing Scope...")
    result = browser.evaluate_js(js_script)
    print("Result:", result)
        
    browser.stop()

if __name__ == "__main__":
    probe_scope()
