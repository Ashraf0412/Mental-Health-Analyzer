from flask import Flask, render_template, request, jsonify
import json
import os
from groq import Groq
from health import transcribe_audio, detect_mental_health
from werkzeug.utils import secure_filename
import tempfile

GROQ_API_KEY = "REDACTED_GROQ_API_KEY"
client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MB max file size

ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "m4a", "mp4", "flac", "ogg", "opus", "webm", "aac"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    text_input = request.json.get("text", "").strip()
    if not text_input:
        return jsonify({
            "error": "Please enter text to analyze."
        }), 400

    result = detect_mental_health(text_input)
    
    if "error" in result:
        return jsonify(result), 502
    
    return jsonify(result)

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    """Handle audio file upload, transcription, and analysis."""
    
    # Check if audio file is present
    if "audio" not in request.files:
        return jsonify({
            "error": "No audio file provided."
        }), 400
    
    audio_file = request.files["audio"]
    
    if audio_file.filename == "":
        return jsonify({
            "error": "No audio file selected."
        }), 400
    
    if not allowed_file(audio_file.filename):
        return jsonify({
            "error": f"Invalid audio format. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}"
        }), 400
    
    try:
        # Save file to temporary location with the original file extension
        ext = os.path.splitext(audio_file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        # Transcribe audio
        transcribed_text = transcribe_audio(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        if isinstance(transcribed_text, str) and transcribed_text.startswith("Audio transcription error"):
            return jsonify({
                "error": transcribed_text
            }), 502
        
        # Analyze the transcribed text
        result = detect_mental_health(transcribed_text)
        result["transcribed_text"] = transcribed_text
        
        return jsonify(result)
        
    except Exception as error:
        return jsonify({
            "error": f"Audio processing failed: {str(error)}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
