from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import User, Trade, TradeReflection
from app.core import security
import uuid

def debug_registration():
    db = SessionLocal()
    try:
        email = f"debug_{uuid.uuid4()}@example.com"
        password = "password123"
        print(f"Attempting to register user: {email}")
        
        # Test 1: Hashing
        print("Testing password hashing...")
        hashed = security.get_password_hash(password)
        print(f"Hash generated: {hashed[:10]}...")
        
        # Test 2: DB Insert
        user = User(
            email=email,
            hashed_password=hashed,
            full_name="Debug User",
            id=uuid.uuid4()
        )
        print("Adding to DB...")
        db.add(user)
        db.commit()
        print("Registration flow (Logic) User added successfully!")
        
    except Exception as e:
        print(f"Error in registration flow: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_registration()
