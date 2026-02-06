from google import genai
from config import GOOGLE_API_KEY, MODEL_FLASH, MODEL_PRO

class GeminiAgent:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set in environment variables.")
        
        self.client = genai.Client(api_key=GOOGLE_API_KEY)

    def analyze_dom(self, prompt, dom_content):
        """Uses Flash for fast DOM analysis and action selection."""
        full_prompt = f"{prompt}\n\nCONTEXTE DOM:\n{dom_content}"
        
        response = self.client.models.generate_content(
            model=MODEL_FLASH,
            contents=full_prompt
        )
        return response.text

    def plan_task(self, prompt):
        """Uses Pro for high-level planning and reasoning."""
        response = self.client.models.generate_content(
            model=MODEL_PRO,
            contents=prompt
        )
        return response.text

llm_client = GeminiAgent()
