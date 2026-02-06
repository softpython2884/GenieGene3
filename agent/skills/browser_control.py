from playwright.sync_api import sync_playwright
import time

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
        self.page.wait_for_load_state("networkidle")

    def click_element(self, selector):
        """Clicks an element specified by a CSS selector."""
        self.page.wait_for_selector(selector)
        self.page.click(selector)

    def right_click_element(self, selector):
        """Performs a right-click on an element."""
        self.page.wait_for_selector(selector)
        self.page.click(selector, button="right")

    def type_text(self, selector, text):
        """Types text into an input field."""
        self.page.wait_for_selector(selector)
        self.page.fill(selector, text)

    def get_dom_content(self):
        """Returns the full HTML content of the page."""
        return self.page.content()

    def get_text(self, selector):
        """Gets the text content of an element."""
        self.page.wait_for_selector(selector)
        return self.page.text_content(selector)

    def wait(self, milliseconds):
        """Waits for a specified amount of time."""
        self.page.wait_for_timeout(milliseconds)

    def take_screenshot(self, path):
        """Takes a screenshot of the current page."""
        self.page.screenshot(path=path)
