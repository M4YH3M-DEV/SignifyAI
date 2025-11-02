# SignifyAI

> [!Note]
> Built at MUJHackX 3.0, the biggest hackathon of MUJ, and we won 3rd place among 500+ teams nationwide! 🔥
> ![winning](/Assets/winning.jpeg)

A real-time application that converts spoken audio and video into American Sign Language gestures, enabling accessibility for deaf and hard-of-hearing individuals.

## Problem

Hearing-impaired individuals cannot easily access spoken communication in classrooms, meetings, and online content due to limited interpreter availability and high costs.

## Solution

The system translates speech to ASL through three stages:
1. **Speech Recognition** - Whisper AI transcribes audio to English text
2. **Grammar Conversion** - Removes articles/verbs and normalizes tense for ASL notation
3. **Gesture Mapping** - Displays corresponding hand gestures with auto-advancing animation

## Key Features

- Microphone recording and video upload support
- Real-time gesture animation (800ms per gesture)
- Automatic fingerspelling for unknown words
- Progress tracking and sequence display
- Both speech-to-sign and video-to-sign processing

## How It Works

**User speaks** >> **Whisper transcribes** >> **NLP converts to ASL Gloss** >> **Gestures map to images** >> **Animated display**

## Technology Stack

- **Backend**: FastAPI + Python (Faster Whisper, FFmpeg)
- **Frontend**: Next.js + React (Framer Motion animations)
- **Data**: JSON gesture mappings, Kaggle ASL Alphabet
- **AI**: Openrouter

## Benefits

- **Accessibility**: Independent access to communication without interpreters
- **Cost Reduction**: Eliminates continuous interpreter fees
- **Scalability**: Supports multiple simultaneous translations
- **24/7 Availability**: On-demand access to translated content

## Impact

Makes education, employment, and information equally accessible to the deaf community by removing communication barriers in real-time.

## Setup

- **Backend**: `pip install -r requirements.txt` >> `uvicorn main:app --reload`
- **Frontend**: `yarn` >> `yarn dev`

---

## Credits

💡 [HB Singh Chaudhary (M4YH3M)](https://github.com/M4YH3M-DEV/)
👨‍💻 [BIGBEASTISHANK (Pranjal)](https://bigbeastishank.com/)

---

*Bridging communication gaps through AI and accessibility.* 🤝

