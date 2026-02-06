import sys
import os
sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController
import time

def fetch_js():
    browser = BrowserController(headless=True)
    browser.start()
    
    base_url = "https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/js/"
    files = ["gestBanque.js", "gestSequences.js", "gestCode.js"]
    
    for filename in files:
        url = base_url + filename
        print(f"Fetching {url}...")
        try:
            # Navigate to the JS file - browser will display it as text
            browser.navigate(url)
            time.sleep(1) 
            
            # Use evaluate to get full content
            content = browser.evaluate_js("document.body.innerText")
            if not content:
                 # Fallback to page content if innerText fails or is empty
                 content = browser.get_dom_content(clean=False)
            
            print(f"Content length for {filename}: {len(content)}")
            
            save_path = os.path.join(os.getcwd(), "scripts", filename)
            with open(save_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {filename} to {save_path}")
        except Exception as e:
            print(f"Error fetching {filename}: {e}")
            
    browser.stop()

if __name__ == "__main__":
    fetch_js()
