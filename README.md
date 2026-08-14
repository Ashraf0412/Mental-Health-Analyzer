# Mental Health Analyzer

A simple mental health text analyzer built with Flask and the Groq client.

## Local setup

1. Create a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Set your Groq API key:
   ```powershell
   $env:GROQ_API_KEY = "your-groq-api-key"
   ```
4. Run locally:
   ```powershell
   python app.py
   ```
5. Open http://127.0.0.1:5000 in the browser.

## Render deployment

1. Connect the repository to Render.
2. Create a new Web Service.
3. Set the build command to:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the start command to:
   ```bash
   gunicorn app:app
   ```
5. Add the `GROQ_API_KEY` environment variable in Render.
6. Deploy the service.
