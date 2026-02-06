import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
import time

def probe_api():
    browser = BrowserController(headless=False)
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5) # Wait for load

    # Probe for common global objects seen in logs
    js_script = """
    (() => {
        const info = {};
        if (window.oBank) {
            info.oBank = Object.keys(window.oBank);
            info.oBank_methods = Object.getOwnPropertyNames(Object.getPrototypeOf(window.oBank));
        }
        if (window.oSeq) {
            info.oSeq = Object.keys(window.oSeq);
            info.oSeq_tabSeqs_length = window.oSeq.tabSeqs ? window.oSeq.tabSeqs.length : 'N/A';
            // Dump first sequence if exists/loaded
             if (window.oSeq.tabSeqs && window.oSeq.tabSeqs.length > 0) {
                info.firstSeq = window.oSeq.tabSeqs[0];
            }
        }
        return info;
    })()
    """
    
    print("🕵️ Probing Global Objects...")
    result = browser.evaluate_js(js_script)
    print("Result:", result)
    
    # Try to load sequences programmatically if potential method found
    # (checking if oBank.addToSel exists from logs)
    
    browser.stop()

if __name__ == "__main__":
    probe_api()
