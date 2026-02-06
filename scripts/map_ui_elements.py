import sys
import os
import json
import time

sys.path.append(os.getcwd())
from agent.skills.browser_control import BrowserController

def map_ui():
    print("🚀 Démarrage du mappage de l'interface...")
    browser = BrowserController(headless=True)
    browser.start()
    browser.navigate("https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/")
    time.sleep(5)
    
    script = """
    () => {
        function getElementPath(el) {
            if (!(el instanceof Element)) return;
            var path = [];
            while (el.nodeType === Node.ELEMENT_NODE) {
                var selector = el.nodeName.toLowerCase();
                if (el.id) {
                    selector += '#' + el.id;
                    path.unshift(selector);
                    break;
                } else {
                    var sib = el, nth = 1;
                    while (sib = sib.previousElementSibling) {
                        if (sib.nodeName.toLowerCase() == selector)
                           nth++;
                    }
                    if (nth != 1)
                        selector += ":nth-of-type("+nth+")";
                }
                path.unshift(selector);
                el = el.parentNode;
            }
            return path.join(" > ");
        }

        const elements = [];
        
        // Find all buttons
        document.querySelectorAll('button, .bouton, .boutonRect, input[type="button"]').forEach(el => {
             elements.push({
                 type: 'button',
                 text: el.innerText || el.value,
                 id: el.id,
                 class: el.className,
                 path: getElementPath(el),
                 onclick: el.getAttribute('onclick')
             });
        });
        
        // Find menus
        document.querySelectorAll('.menu, .menuItem').forEach(el => {
             elements.push({
                 type: 'menu',
                 text: el.innerText,
                 id: el.id,
                 class: el.className,
                 path: getElementPath(el),
                 onclick: el.getAttribute('onclick')
             });
        });
        
        return elements;
    }
    """
    
    ui_elements = browser.evaluate_js(script)
    
    print(f"✅ {len(ui_elements)} éléments UI trouvés.")
    
    with open("ui_map.json", "w", encoding="utf-8") as f:
        json.dump(ui_elements, f, indent=2, ensure_ascii=False)
        
    print("🗺️ Carte de l'interface sauvegardée dans ui_map.json")
    browser.stop()

if __name__ == "__main__":
    map_ui()
