from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

load_dotenv()

from backend.services.supabase_service import supabase_service

# No longer need manual JWT secrets as we use the official Supabase SDK for verification

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("Auth Error: Missing or invalid header")
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    
    # Official Supabase verification:
    try:
        if not supabase_service.client:
            print("Auth Error: Supabase client not initialized")
            raise HTTPException(status_code=500, detail="Auth service unavailable")
            
        auth_response = supabase_service.client.auth.get_user(token)
        if not auth_response or not auth_response.user:
            print("Auth Error: Supabase could not verify token")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
            
        user_id = auth_response.user.id
        # print(f"Auth Success: User {user_id} verified via Supabase SDK")
        return user_id
        
    except Exception as e:
        print(f"Auth Error: Supabase verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
