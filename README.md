# Mindify — Mental Health Analyzer

Mindify is a Flask web application for supportive mental-wellbeing screening. A user can enter text, upload an audio file, or record their voice. Audio is transcribed first, then the text is analyzed for possible concerns and supportive next steps.

> This application is not a medical diagnostic tool. In an emergency or if someone may be in immediate danger, contact local emergency services or a qualified crisis-support provider.

## Features

- Analyze written thoughts and feelings.
- Upload common audio formats or record voice from the browser.
- View the audio transcript in the Audio Input section.
- Display risk level, detected concerns, supportive advice, and an immediate-help indicator.
- Save up to 20 text and audio analyses in browser-local history.
- Delete individual history records.

## How it works

### Text analysis

1. The browser sends the written input to `POST /analyze`.
2. Flask calls `detect_mental_health()` in `health.py`.
3. The Groq chat model returns structured JSON containing the screening result.
4. The browser displays the result and stores it in `localStorage`.

### Audio analysis

1. The user uploads an audio file or records one with their microphone.
2. The browser sends the audio to `POST /upload-audio` as form data.
3. Flask saves it temporarily and calls Groq's Whisper transcription model.
4. The returned transcript is shown in the Audio Input transcript card and is passed to the same text-analysis flow.
5. The transcript and result are saved in browser-local history as an `audio` entry.

## Project files

| File / folder | Significance |
| --- | --- |
| `app.py` | The Flask application and HTTP routes. It serves the page, validates incoming audio, limits uploads to 25 MB, and coordinates transcription and analysis. |
| `health.py` | Connects to Groq. It contains the transcription function and the mental-wellbeing screening prompt plus JSON result handling. It can also be run directly as a small command-line text analyzer. |
| `templates/index.html` | The main page structure: text and audio input tabs, recording controls, transcript card, result panel, and History view. |
| `static/app.js` | Client-side behavior. It handles tabs, microphone recording, audio uploads, API requests, transcript display, result rendering, and local history including per-record deletion. |
| `static/styles.css` | Visual styling, responsive layout, and styles for the audio, transcript, history, and delete-button components. |
| `requirements.txt` | Python packages required to run the application: Flask, Gunicorn, and the Groq client. |
| `Procfile` | Deployment command for platforms that use a Procfile. It starts the app with Gunicorn. |
| `README.md` | This project guide. |

## Tools and technologies used

| Tool / technology | Purpose in this project |
| --- | --- |
| Python | Backend application language. |
| Flask | Serves the web page and provides the `/analyze` and `/upload-audio` API endpoints. |
| Groq Python SDK | Authenticates with Groq and calls the AI services. |
| `whisper-large-v3` | Converts uploaded or recorded speech into text. |
| `llama-3.1-8b-instant` | Produces the structured supportive screening response from text. |
| HTML and CSS | Provide the accessible page structure and visual design. |
| JavaScript | Controls the interactive interface and communicates with the Flask API. |
| Browser MediaRecorder API | Records microphone input directly in the browser. |
| Browser `localStorage` | Saves the most recent 20 analysis records on the user's device; history is not stored in a server database. |
| Gunicorn | Production-ready Python web server used for deployment. |

## Local setup

### Prerequisites

- Python 3.10 or later
- A Groq API key

### Run the app

1. Move into the project folder:

   ```powershell
   cd "Mental Health Analyzer"
   ```

2. Create and activate a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Set the Groq API key for the current PowerShell session:

   ```powershell
   $env:GROQ_API_KEY = "your-groq-api-key"
   ```

5. Start the server:

   ```powershell
   python app.py
   ```

6. Open `http://127.0.0.1:5000` in your browser.

## Deployment

For Render or a similar service:

1. Connect the repository and create a Python web service.
2. Use `pip install -r requirements.txt` as the build command.
3. Use `gunicorn app:app` as the start command.
4. Add `GROQ_API_KEY` as an environment variable in the hosting dashboard.
5. Deploy.

## Notes and limitations

- Audio uploads are limited to 25 MB. Supported formats include MP3, WAV, M4A, MP4, FLAC, OGG, OPUS, WebM, and AAC.
- The microphone feature needs browser permission and generally requires HTTPS when deployed (localhost is typically allowed during development).
- History is device- and browser-specific. Clearing browser site data also clears it.
- The AI output is a supportive screening result, not medical advice or a diagnosis.
