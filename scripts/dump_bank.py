import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
import time
import json

def dump_bank():
    browser = BrowserController(headless=True)
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5) 
    
    js_script = """
    (() => {
        // Try to find the bank data
        // Inspecting gstBanque.js source (simulated) suggests oBank.tabBanque or similar
        // Let's dump keys of oBank again to find the data holder
        
        let bankData = [];
        if (typeof oBank !== 'undefined') {
            // Check for potential data arrays
            // Common patterns: tabSequences, tabBanque, etc.
            // Let's just return the keys first if we don't know
            if (oBank.tabBanque) {
                return oBank.tabBanque;
            }
        }
        return "Bank data not found directly";
    })()
    """
    
    print("🕵️ Dumping Bank Data...")
    result = browser.evaluate_js(js_script)
    
    # Save to file
    with open("bank_dump.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        
    print("Dump saved to bank_dump.json")
    browser.stop()

if __name__ == "__main__":
    dump_bank()
