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

## Flask API connections in detail

Flask is the bridge between the browser interface and the Groq AI services. The browser never calls Groq directly and never receives the `GROQ_API_KEY`; it only communicates with this application's Flask routes.

### 1. Loading the application — `GET /`

When a user opens the website, the browser requests the root URL. The `index()` function in `app.py` responds with `templates/index.html`. The browser then loads `static/styles.css` for styling and `static/app.js` for interactive behavior.

```text
Browser ── GET / ──> Flask (`app.py`) ──> `index.html`
Browser <── HTML, CSS, JS ─────────────── Flask
```

### 2. Text analysis — `POST /analyze`

When the user clicks **Analyze Now**, `static/app.js` reads the text area and sends a JSON request using `fetch()`:

```json
{
  "text": "I have been feeling stressed recently."
}
```

`app.py` receives this request in the `analyze()` route. It trims the text and rejects empty input with a `400 Bad Request` response. Valid text is passed to `detect_mental_health()` in `health.py`.

`health.py` creates a Groq client using the private `GROQ_API_KEY` environment variable and sends the text plus a safety-focused system prompt to the `llama-3.1-8b-instant` model. The prompt requests a JSON response. Flask returns that result to the browser, which updates the risk level, concerns, advice, and immediate-help fields.

Example response:

```json
{
  "risk_level": "medium",
  "concerns": ["Stress", "Emotional distress"],
  "advice": "Consider taking a short break and speaking with someone you trust.",
  "requires_immediate_help": false,
  "disclaimer": "This is not a medical diagnosis."
}
```

```text
`app.js` ── POST /analyze (JSON) ──> `app.py`
`app.py` ── `detect_mental_health(text)` ──> `health.py`
`health.py` ── Groq chat request ──> Groq
Groq ── JSON result ──> `health.py` ──> `app.py` ──> `app.js`
```

If the Groq call or result parsing fails, `health.py` returns an error object. The Flask route sends it to the browser with a `502 Bad Gateway` status, and the browser shows the error message.

### 3. Audio transcription and analysis — `POST /upload-audio`

When the user clicks **Analyze Audio**, `static/app.js` either uses the selected file or converts recorded microphone chunks into a `Blob`. It adds the audio to a `FormData` object and sends it without manually setting `Content-Type`; the browser adds the required `multipart/form-data` boundary automatically.

```javascript
const formData = new FormData();
formData.append("audio", audioFileOrBlob, "recording.webm");

fetch("/upload-audio", {
  method: "POST",
  body: formData
});
```

The `upload_audio()` route in `app.py` performs these steps:

1. Checks that the request contains an `audio` file field.
2. Checks that a file name exists and that its extension is in the allowed audio-format list.
3. Applies Flask's 25 MB request-size limit.
4. Saves the upload to a temporary file with the same extension.
5. Calls `transcribe_audio()` in `health.py`, which sends that file to Groq's `whisper-large-v3` transcription model.
6. Removes the temporary file after transcription.
7. Sends the returned transcript to `detect_mental_health()` for the same screening process used by text input.
8. Adds `transcribed_text` to the JSON response and returns it to the browser.

Example audio response:

```json
{
  "transcribed_text": "I have been feeling overwhelmed at work.",
  "risk_level": "medium",
  "concerns": ["Stress"],
  "advice": "Try taking a short break and reach out for support if needed.",
  "requires_immediate_help": false,
  "disclaimer": "This is not a medical diagnosis."
}
```

After receiving the response, `app.js` displays the transcript in the Audio Input card, copies it into the text area for visibility, renders the analysis, and saves an `audio` item to local history. Audio validation failures return `400`; transcription errors return `502`; unexpected server errors return `500`.

### API security and data handling

- `GROQ_API_KEY` stays on the server as an environment variable and must never be added to client-side JavaScript, HTML, or Git commits.
- Uploaded audio is written to a temporary server file only for transcription, then deleted by the current request flow.
- Analysis History uses browser `localStorage`; it is not stored in Flask or a server database.
- This project has no user authentication or permanent database. Deploy it over HTTPS so microphone access and data in transit are protected.

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

### API key storage

The Groq API key is deliberately **not stored in this project**. `health.py` reads it at runtime from the `GROQ_API_KEY` environment variable:

```python
api_key = os.environ.get("GROQ_API_KEY")
```

An environment variable is a value held by the operating system or deployment platform, outside the source code. This keeps the secret out of `app.py`, `health.py`, client-side JavaScript, and GitHub commits. Never add a key beginning with `gsk_` to a project file or share it publicly.

To create or copy a Groq API key, open [Groq API Keys](https://console.groq.com/keys). If an existing key was not saved when it was created, make a new key and use that one.

#### Set the key locally in PowerShell

Run this in the PowerShell window before starting the app. It applies only to that terminal session:

```powershell
$env:GROQ_API_KEY = "your-groq-api-key"
```

To check the key currently available in that terminal, run:

```powershell
$env:GROQ_API_KEY
```

This command prints the secret, so do not use it in a screenshot, screen share, or public terminal log.

#### Set the key in Render

Render runs on a separate server, so it cannot use the environment variable from your computer. In the Render dashboard, open your web service and go to **Environment**. Add an environment variable with:

```text
Key:   GROQ_API_KEY
Value: your-groq-api-key
```

Save the change and redeploy or restart the service. The application will then access the key through `os.environ.get("GROQ_API_KEY")` without exposing it to website visitors.

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


## Updated model 
- previous model ="llama-3.1-8b-instant" ( This model is dropped by the developer , 
  I am using a different model instead of llama)
- New model is "openai/gpt-oss-120b"
a good project
