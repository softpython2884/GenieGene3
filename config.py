import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Mapping to available models
# Using experimental versions as placeholders for "2.5" if not strictly available by that name in the SDK yet.
# Adjust these strings to the actual model names available in your Google Cloud Project.
MODEL_FLASH = "gemini-2.0-flash-exp" 
MODEL_PRO = "gemini-2.0-pro-exp"

# URLs
GENIEGENE_URL = "https://www.pedagogie.ac-nice.fr/svt/productions/geniegen2/"
