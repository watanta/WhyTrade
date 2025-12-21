from sqlalchemy import text
from app.core.database import engine

def reset_db():
    try:
        with engine.connect() as connection:
            print("Dropping schema public...")
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            print("Recreating schema public...")
            connection.execute(text("CREATE SCHEMA public;"))
            connection.commit()
        print("Database reset successfully.")
    except Exception as e:
        print(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_db()
