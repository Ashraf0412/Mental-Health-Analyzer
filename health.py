import json
import os
from groq import Groq



GROQ_API_KEY = os.environ.get("GROQ_API_KEY")


if (
    not GROQ_API_KEY
):
    raise ValueError(
        "Set the GROQ_API_KEY environment variable before starting the app."
    )


# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)


def transcribe_audio(audio_file_path):
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(
            f"Audio file not found: {audio_file_path}"
        )

    try:
        with open(audio_file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3"
            )

        return transcription.text

    except Exception as error:
        return f"Audio transcription error: {error}"


def detect_mental_health(text_input):
    """
    Analyze text for possible mental-health concerns.

    This program does not provide a medical diagnosis.
    """

    if not text_input.strip():
        return {
            "risk_level": "unknown",
            "concerns": [],
            "advice": "Please enter some text.",
            "requires_immediate_help": False,
            "disclaimer": "This is not a medical diagnosis."
        }

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
                    "content": text_input.strip()
                }
            ],
            temperature=0.2,
            response_format={
                "type": "json_object"
            }
        )

        result_text = response.choices[0].message.content

        return json.loads(result_text)

    except json.JSONDecodeError:
        return {
            "error": "The model did not return valid JSON.",
            "raw_response": result_text
        }

    except Exception as error:
        return {
            "error": str(error)
        }


def main():
    print("=" * 50)
    print("Mental Health Text Analysis")
    print("=" * 50)

    user_text = input(
        "\nEnter your thoughts or feelings: "
    ).strip()

    if not user_text:
        print("\nNo input text provided.")
        return

    print("\n🔍 Analyzing your text...")

    result = detect_mental_health(user_text)

    print("\n🧾 Result:")
    print(json.dumps(result, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    main()
