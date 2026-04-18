# backend/seed.py
from sqlalchemy.orm import Session
from database import SessionLocal
import models

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining",  "type": "expense", "colour": "#f97316", "icon": "🍔"},
    {"name": "Transport",      "type": "expense", "colour": "#3b82f6", "icon": "🚗"},
    {"name": "Housing",        "type": "expense", "colour": "#8b5cf6", "icon": "🏠"},
    {"name": "Utilities",      "type": "expense", "colour": "#06b6d4", "icon": "💡"},
    {"name": "Healthcare",     "type": "expense", "colour": "#ef4444", "icon": "🏥"},
    {"name": "Entertainment",  "type": "expense", "colour": "#ec4899", "icon": "🎬"},
    {"name": "Shopping",       "type": "expense", "colour": "#f59e0b", "icon": "🛒"},
    {"name": "Education",      "type": "expense", "colour": "#10b981", "icon": "📚"},
    {"name": "Travel",         "type": "expense", "colour": "#6366f1", "icon": "✈"},
    {"name": "Subscriptions",  "type": "expense", "colour": "#14b8a6", "icon": "📱"},
    {"name": "Other Expense",  "type": "expense", "colour": "#94a3b8", "icon": "💸"},
    {"name": "Salary",         "type": "income",  "colour": "#22c55e", "icon": "💼"},
    {"name": "Freelance",      "type": "income",  "colour": "#84cc16", "icon": "💻"},
    {"name": "Investments",    "type": "income",  "colour": "#a3e635", "icon": "📈"},
    {"name": "Other Income",   "type": "income",  "colour": "#4ade80", "icon": "💰"},
]


def seed_categories():
    """
    Insert default categories if the table is empty.
    Must be called AFTER create_tables() so the table exists.
    """
    db: Session = SessionLocal()
    try:
        if db.query(models.Category).count() == 0:
            for cat in DEFAULT_CATEGORIES:
                db.add(models.Category(**cat))
            db.commit()
            print(f"[seed] Inserted {len(DEFAULT_CATEGORIES)} default categories.")
        else:
            print(f"[seed] Categories already seeded, skipping.")
    except Exception as e:
        print(f"[seed] Error: {e}")
        db.rollback()
    finally:
        db.close()

# NOTE: Do NOT call seed_categories() here at module level.
# It is called from main.py inside on_startup() AFTER tables are created.