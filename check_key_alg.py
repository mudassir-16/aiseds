import base64
import json

anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtdm9nd3dydHl4ZWFqY3FueXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjEzMjEsImV4cCI6MjA4NzM5NzMyMX0.Z7gSHB7WshSfRCOu0GIXanETu9IR7Idq40SZd3BGISI"
header_b64 = anon_key.split('.')[0]
header = json.loads(base64.urlsafe_b64decode(header_b64 + '==').decode('utf-8'))
print(f"Anon Key Alg: {header.get('alg')}")
