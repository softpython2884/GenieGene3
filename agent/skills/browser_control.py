from playwright.sync_api import sync_playwright
import time
import os

class BrowserController:
    def __init__(self, headless=False):
        self.headless = headless
        self.playwright = None
        self.browser = None
        self.page = None

    def start(self):
        """Starts the browser session."""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=self.headless)
        self.page = self.browser.new_page()

    def stop(self):
        """Stops the browser session."""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()

    def navigate(self, url):
        """Navigates to a specific URL."""
        if not self.page:
            raise Exception("Browser not started. Call start() first.")
        self.page.goto(url)
        try:
            self.page.wait_for_load_state("domcontentloaded", timeout=10000)
        except:
            print("⚠️ Timeout ou erreur lors du chargement de la page (continuons...)")

    def right_click_element(self, selector):
        """Performs a right-click on an element."""
        self.page.wait_for_selector(selector)
        self.page.click(selector, button="right")

    def get_dom_content(self, clean=True):
        """Returns the HTML content, optionally cleaned of scripts/styles."""
        if not self.page:
             return ""
        
        content = self.page.content()
        if clean:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            # Remove scripts, styles, svgs, meta, comments
            for element in soup(["script", "style", "svg", "meta", "link", "noscript"]):
                element.decompose()
            # Remove comments
            from bs4 import Comment
            for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
                comment.extract()
            return str(soup)
        return content

    def get_text(self, selector):
        """Gets the text content of an element."""
        try:
            self.page.wait_for_selector(selector, state="visible", timeout=3000)
            return self.page.text_content(selector)
        except:
             return None

    def wait(self, milliseconds):
        """Waits for a specified amount of time."""
        if self.page:
            self.page.wait_for_timeout(milliseconds)

    def click_element(self, selector):
        """Clicks an element with visibility check."""
        try:
             # Try generic selector wait first - Increased timeout for stability
             self.page.wait_for_selector(selector, state="visible", timeout=5000)
             self.page.click(selector)
        except Exception as e:
             # Fallback: force click or try JS click if playwright fails standard click
             print(f"⚠️ 'wait_for_selector' failed for {selector}, attempting JS click...")
             try:
                 self.page.eval_on_selector(selector, "el => el.click()")
             except Exception as e2:
                 raise Exception(f"Failed to click {selector}: {e2}")

    def type_text(self, selector, text):
        """Types text into an input field."""
        self.page.wait_for_selector(selector, state="visible", timeout=5000)
        self.page.fill(selector, text)

    def select_option(self, selector, value):
        """Selects an option in a <select> element."""
        self.page.wait_for_selector(selector, state="visible", timeout=5000)
        self.page.select_option(selector, value)

    def take_screenshot(self, path):
        """Takes a screenshot of the current page."""
        if self.page:
            self.page.screenshot(path=path)

    def evaluate_js(self, script):
        """Evaluates a JavaScript script in the page context."""
        if not self.page:
            return None
        try:
            return self.page.evaluate(script)
        except Exception as e:
            print(f"⚠️ Erreur d'exécution JS: {e}")
            return None

    def take_screenshot(self, filename):
        """Takes a screenshot of the current page."""
        if not self.page:
            return None
        try:
            # Ensure the screenshots directory exists
            os.makedirs("screenshots", exist_ok=True)
            path = os.path.join("screenshots", filename)
            self.page.screenshot(path=path)
            print(f"📸 Capture d'écran sauvegardée : {path}")
            return path
        except Exception as e:
            print(f"⚠️ Erreur lors de la capture d'écran: {e}")
            return None
