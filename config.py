import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Mapping to available models
MODEL_FLASH = "gemini-2.5-flash" 
MODEL_PRO = "gemini-2.5-pro"

# URLs
GENIEGENE_URL = "https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/"
