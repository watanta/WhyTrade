from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.trade import Trade
from app.models.reflection import TradeReflection
import uuid

def test_insert_user():
    db = SessionLocal()
    try:
        user = User(
            email="debug@example.com",
            hashed_password="hashed_password_debug",
            full_name="Debug User",
            id=uuid.uuid4()
        )
        print("Attempting to add user...")
        db.add(user)
        db.commit()
        print("User added successfully!")
    except Exception as e:
        print(f"Error inserting user: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_insert_user()
