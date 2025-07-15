# backend/scripts/create_tables.py

import asyncio
from app.db.database import engine, Base
from app.models import db_models

async def create_all_tables():
    async with engine.begin() as conn:
        print("🔧 Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(create_all_tables())
