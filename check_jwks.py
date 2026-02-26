import requests
import json

supabase_url = "https://hmvogwwrtyxeajcqnyys.supabase.co"
jwks_url = f"{supabase_url}/auth/v1/jwks.json"

anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtdm9nd3dydHl4ZWFqY3FueXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjEzMjEsImV4cCI6MjA4NzM5NzMyMX0.Z7gSHB7WshSfRCOu0GIXanETu9IR7Idq40SZd3BGISI"
headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}"
}

try:
    response = requests.get(f"{supabase_url}/auth/v1/jwks.json", headers=headers)
    if response.status_code == 200:
        print("JWKS content:")
        # print(json.dumps(response.json(), indent=2))
        keys = response.json().get('keys', [])
        for k in keys:
            print(f"Key ID: {k.get('kid')}, Alg: {k.get('alg')}, Kty: {k.get('kty')}")
    else:
        print(f"Failed to fetch JWKS: {response.status_code}, {response.text}")
except Exception as e:
    print(f"Error: {e}")
