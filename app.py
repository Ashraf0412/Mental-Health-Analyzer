from flask import Flask, render_template, request, jsonify
import json
import os
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("Please set GROQ_API_KEY in your environment variables.")

client = Groq(api_key=GROQ_API_KEY)

app = Flask(__name__, static_folder="static", template_folder="templates")

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

    system_prompt = """
You are a supportive mental-wellbeing screening assistant.

Analyze the user's text for possible signs of:

- Stress
- Anxiety
- Sadness
- Depression
- Emotional distress
- Self-harm or suicidal thoughts

Do not provide a medical diagnosis.

Return only valid JSON in this exact structure:

{
    "risk_level": "low, medium, or high",
    "concerns": ["concern 1", "concern 2"],
    "advice": "Short, supportive and actionable advice",
    "requires_immediate_help": false,
    "disclaimer": "This is not a medical diagnosis."
}

Set "requires_immediate_help" to true when the text indicates
immediate danger, suicidal intent, self-harm intent, or intent
                to harm another person.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": text_input
                }
            ],
            temperature=0.2,
            response_format={
                "type": "json_object"
            }
        )

        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({
            "error": "The model did not return valid JSON.",
            "raw_response": result_text
        }), 502
    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
