import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # bypasses RLS for backend inserts
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Groq models
GROQ_MODEL = "llama-3.3-70b-versatile"          # text analysis
GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # vision (image input)
