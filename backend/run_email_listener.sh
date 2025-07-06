#!/bin/bash
cd /Users/AnnaM10vir/hr-assistant/backend
/Users/AnnaM10vir/hr-assistant/venv/bin/python3 -m app.resume_ingestion.email_listener >> logs/cron_resume.log 2>&1
