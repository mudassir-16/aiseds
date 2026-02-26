from jose import jwt
import os

try:
    # Test if ES256 is supported
    # We don't even need a real token, just check if it's in the supported list
    from jose.constants import ALGORITHMS
    print(f"Supported algorithms: {ALGORITHMS.SUPPORTED}")
    
    # Try a dummy decode with ES256 to see if it triggers an error about missing backend
    # ES256 requires a public key to verify, but we just want to see if the algorithm itself is accepted
    token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.e30.s" # Dummy header with ES256
    jwt.decode(token, "secret", algorithms=["ES256"], options={"verify_signature": False})
    print("ES256 decode attempt (no signature verify) successful")
except Exception as e:
    print(f"Error testing ES256: {e}")
