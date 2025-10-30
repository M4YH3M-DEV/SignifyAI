from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import os

# Global variables
app = FastAPI()
audioToTextModel = WhisperModel("base", device="cpu", compute_type="int8")

# API endpoint for ASL with audio
@app.post("/asl_with_audio")
async def asl_with_audio(audioFile: UploadFile = File(...)):
    # Saving the audio file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tempFile:
        content = await audioFile.read()
        tempFile.write(content)
        tempFilePath = tempFile.name
    
    try:
        # Converting the audio file to text
        segments, info = audioToTextModel.transcribe(tempFilePath)
        transcript = " ".join([segment.text for segment in segments])
        
        # Returning the transcript
        return {"transcript": transcript}
    finally:
        # Deleting the temporary file
        os.unlink(tempFilePath)
        