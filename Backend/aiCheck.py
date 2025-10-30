import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
api_key = f"Bearer {os.getenv('API_KEY')}"


def getResponse(message):
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": api_key,
            "Content-Type": "application/json",
        },
        data=json.dumps(
            {
                "model": "openai/gpt-5",
                "messages": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": message}],
                    }
                ],
            }
        ),
    )

    if response.status_code == 200:
        data = response.json()
        message_content = data["choices"][0]["message"]["content"]
        return message_content
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

# Check ALS GLOSS
def checkASLGloss(transcript, asl_gloss):
    print(f"Checking ASL Gloss started")
    returnResponse = getResponse(
        f"Validate this ASL gloss. Transcript: '{transcript}' | Gloss: '{asl_gloss}' | If gloss is correct, respond 'VALID'. If incorrect, provide the corrected gloss. One line only. With no symbol Its ASL Gloss ASL dont have signs, do some websearch to understand what is right and what is wrong"
    )
    print(f"CheckASLGloss AI: {returnResponse}")
    return returnResponse.strip()
