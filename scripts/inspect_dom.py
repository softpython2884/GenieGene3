import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
import time

def inspect():
    browser = BrowserController(headless=True) # Headless is fine for inspecting DOM
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5) 
    
    content = browser.get_dom_content(clean=False)
    
    print("Has oBank in source:", "oBank" in content)
    print("Has iframe:", "<iframe" in content)
    
    # Save to file for manual inspection if needed, but printing snippet is enough
    with open("page_dump.html", "w", encoding="utf-8") as f:
        f.write(content)
        
    browser.stop()

if __name__ == "__main__":
    inspect()
