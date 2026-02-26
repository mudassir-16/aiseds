import os
from dotenv import load_dotenv
from jose import jwt
import base64

load_dotenv()

SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET")
print(f"Secret: {SECRET_KEY[:10]}...")

# Some secrets in Supabase are base64 encoded.
# Let's try to see if decoding helps.
try:
    decoded_secret = base64.b64decode(SECRET_KEY)
    print("Base64 decoding successful")
except Exception as e:
    print(f"Base64 decoding failed: {e}")

# If you have a token locally you could try it here.
