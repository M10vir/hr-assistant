import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import engine, Base
from app.db import db_models  # ✅ Ensure this file exists
import asyncio

print("Creating tables...")

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Tables created.")

# Run the async init function
asyncio.run(init())
