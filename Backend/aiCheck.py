import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = f"Bearer {os.getenv('API_KEY')}"

# API Configuration
MODEL = "google/gemini-2.5-pro"

def getResponse(message):
    # Make API request to OpenRouter with error handling
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
        },
        data=json.dumps(
            {
                "model": MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": message}],
                    }
                ],
                "temperature": 0.3,  # Lower temperature for consistency
            }
        ),
    )

    if response.status_code == 200:
        data = response.json()
        message_content = data["choices"][0]["message"]["content"]
        return message_content.strip()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


def checkASLGloss(transcript, asl_gloss):
    """Validate ASL gloss against transcript"""
    print(f"Checking ASL Gloss started")
    
    prompt = f"""You are an ASL (American Sign Language) expert. Validate whether the following ASL gloss correctly represents the transcript.

Transcript: {transcript}
ASL Gloss: {asl_gloss}

Respond with ONLY:
- nothing if the gloss is correct
- The corrected gloss (uppercase, space separated signs) if incorrect

Remember: ASL uses classifiers, spatial grammar, and non-manual markers. Ensure the gloss follows proper ASL conventions."""

    returnResponse = getResponse(prompt)
    print(f"CheckASLGloss AI: {returnResponse}")
    return returnResponse


def checkLanguage(transcript):
    """Detect language and convert to English if needed"""
    print(f"Checking Language started")
    
    prompt = f"""Analyze the transcript language. If it's English, return it unchanged. If it's not English, translate it to English.

Transcript: {transcript}

Respond with ONLY the English text, nothing else."""

    returnResponse = getResponse(prompt)
    print(f"CheckLanguage AI: {returnResponse}")
    return returnResponse


def checkTone(transcript):
    """Analyze emotional tone of transcript"""
    print("Checking Tone started")
    
    prompt = f"""Analyze the emotional tone/sentiment of the following transcript.

Transcript: {transcript}

Respond with ONLY a single word from this list:
Happy, Sad, Angry, Neutral, Confused

If multiple tones are present, choose the most dominant one."""

    returnResponse = getResponse(prompt)
    # returnResponse = "Angry"
    print(f"CheckTone AI: {returnResponse}")
    return returnResponse
