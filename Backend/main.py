from alsGLoss import convertTranscriptToASLGloss
from fastapi import FastAPI, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import os
import subprocess
import io


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
        # Transcribe the audio to text
        segments, info = audioToTextModel.transcribe(tempFilePath)
        transcript = " ".join([segment.text for segment in segments])
        
        # Convert to ASL grammar
        asl_gloss = convertTranscriptToASLGloss(transcript)
        
        return {"original_transcript": transcript, "asl_gloss": asl_gloss}
    finally:
        # Deleting the temporary file
        os.unlink(tempFilePath)


# API endpoint for ASL with video
@app.post("/asl_with_video")
async def asl_with_video(videoFile: UploadFile = File(...)):
    # Get file extension
    file_extension = os.path.splitext(videoFile.filename)[1].lower()

    # Saving the video file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tempFile:
        content = await videoFile.read()
        tempFile.write(content)
        videoFilePath = tempFile.name

    # Create temporary audio file path
    audioFilePath = videoFilePath.replace(file_extension, ".mp3")

    try:
        # Convert video to audio using ffmpeg
        subprocess.run([
            "ffmpeg", "-y", "-i", videoFilePath,
            "-q:a", "0", "-map", "a", audioFilePath
        ], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT, check=True)
        
        # Read the audio file content
        with open(audioFilePath, 'rb') as audio_file:
            audio_content = audio_file.read()
        
        # Create an UploadFile object from the audio bytes
        audio_upload = UploadFile(
            filename="converted_audio.mp3",
            file=io.BytesIO(audio_content)
        )
        
        # Call the asl_with_audio function
        result = await asl_with_audio(audio_upload)
        return result
    finally:
        # Deleting the temporary files
        os.unlink(videoFilePath)
        if os.path.exists(audioFilePath):
            os.unlink(audioFilePath)
