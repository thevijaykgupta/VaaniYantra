import asyncio
import base64
import json
import logging
import tempfile
import subprocess
import os
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

import config
import database
import models
import translation_engine
import utils
import websocket_manager

# ==============================
# LOGGING
# ==============================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

# ==============================
# IMPORTS
# ==============================
from translation_engine import Translator
from websocket_manager import ConnectionManager

init_db = database.init_db
session_scope = database.session_scope

Transcript = models.Transcript
TranscriptCreate = models.TranscriptCreate
TranscriptRead = models.TranscriptRead

run_blocking = utils.run_blocking
timestamp_now = utils.timestamp_now

# ==============================
# FASTAPI APP
# ==============================
app = FastAPI(title="Vaani Yantra Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()

# ==============================
# ASR MODEL CLASS
# ==============================
class WhisperASR:
    def __init__(self):
        try:
            from faster_whisper import WhisperModel
            self.model = WhisperModel("base", device="cpu", compute_type="int8")
            logger.info("✅ faster-whisper loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load faster-whisper: {e}")
            self.model = None

    def _transcribe_sync(self, audio_bytes):
        """Synchronous transcription of audio bytes"""
        if not self.model:
            return []

        try:
            # Save audio bytes to temp file
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name

            try:
                # Transcribe
                segments, info = self.model.transcribe(
                    temp_path,
                    language="en",  # Auto-detect or specify
                    beam_size=5,
                    patience=1,
                    length_penalty=1,
                    repetition_penalty=1,
                    no_repeat_ngram_size=0,
                    initial_prompt=None,
                    suppress_blank=True,
                    suppress_tokens=[-1],
                    without_timestamps=False,
                    max_initial_timestamp=1.0,
                    halluciation_silence_threshold=None,
                )

                results = []
                for segment in segments:
                    results.append({
                        "text": segment.text.strip(),
                        "start": segment.start,
                        "end": segment.end,
                        "confidence": getattr(segment, 'confidence', 0.8)
                    })

                logger.info(f"✅ Transcribed {len(results)} segments")
                return results

            finally:
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass

        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            return []

# ==============================
# MODELS
# ==============================
asr = WhisperASR()          # REQUIRED
translator = Translator()  # Lightweight

# ==============================
# STARTUP
# ==============================
@app.on_event("startup")
async def startup():
    init_db()
    logger.info("✅ Database initialized")

# ==============================
# BASIC ROUTES
# ==============================
@app.get("/")
async def root():
    return {"message": "Vaani Yantra Backend Running"}

@app.get("/health")
async def health():
    return {"status": "ok", "time": timestamp_now()}

# ==============================
# TRANSCRIPTS (REST)
# ==============================
@app.get("/transcripts")
def list_transcripts(room_id: str | None = None):
    with session_scope() as db:
        q = db.query(Transcript)
        if room_id:
            q = q.filter(Transcript.room_id == room_id)

        items = q.order_by(Transcript.created_at.desc()).all()
        return {"items": [TranscriptRead.from_orm(t).dict() for t in items]}

# ==============================
# SAVE + BROADCAST
# ==============================
async def save_and_broadcast(room_id: str, text: str):
    translation = translator.translate(text)

    with session_scope() as session:
        t = Transcript(
            room_id=room_id,
            speaker="Live Speaker",
            text=text,
            translation=translation,
            created_at=datetime.utcnow(),
        )
        session.add(t)
        session.flush()
        payload = TranscriptRead.from_orm(t).dict()

    await manager.broadcast(
        {"type": "transcript", "payload": payload},
        topic=room_id
    )

# ==============================
# AUDIO CONVERSION (WEBM → WAV)
# ==============================
def webm_base64_to_wav_bytes(base64_data: str) -> bytes:
    webm_bytes = base64.b64decode(base64_data)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
        f.write(webm_bytes)
        webm_path = f.name

    wav_path = webm_path.replace(".webm", ".wav")

    cmd = [
        "ffmpeg", "-y",
        "-i", webm_path,
        "-ac", "1",
        "-ar", "16000",
        "-f", "wav",
        wav_path
    ]

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    with open(wav_path, "rb") as f:
        wav_bytes = f.read()

    os.remove(webm_path)
    os.remove(wav_path)

    return wav_bytes

# ==============================
# WHISPER PIPELINE
# ==============================
async def process_audio(room_id: str, wav_bytes: bytes):
    logger.info("🧠 Whisper processing %d bytes", len(wav_bytes))

    try:
        segments = await run_blocking(asr._transcribe_sync, wav_bytes)
    except Exception as e:
        logger.error("❌ Whisper failed: %s", e)
        return

    for seg in segments:
        text = seg.get("text", "").strip()
        if text:
            logger.info("📝 Transcribed: %s", text)
            await save_and_broadcast(room_id, text)

# ==============================
# TRANSCRIPT WS (UI)
# ==============================
@app.websocket("/ws/transcripts/{room_id}")
async def transcript_ws(ws: WebSocket, room_id: str):
    await manager.connect(ws, topic=room_id)
    try:
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        await manager.disconnect(ws, topic=room_id)

# ==============================
# AUDIO WS (MIC)
# ==============================
@app.websocket("/ws/audio/{room_id}")
async def audio_ws(ws: WebSocket, room_id: str):
    await manager.connect(ws, topic=room_id)
    logger.info("🎤 Audio WS connected: %s", room_id)

    try:
        while True:
            msg = await ws.receive_text()
            data = json.loads(msg)

            if data.get("type") == "audio":
                wav_bytes = webm_base64_to_wav_bytes(data["data"])
                await process_audio(room_id, wav_bytes)

            elif data.get("type") == "stop":
                logger.info("⏹ Capture stopped")

            elif data.get("type") == "ping":
                await ws.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("🔌 Audio WS disconnected")
        await manager.disconnect(ws, topic=room_id)

    except Exception as e:
        logger.exception("❌ WS error")
        await manager.disconnect(ws, topic=room_id)
        await ws.close()

# ==============================
# 🔥 DEBUG TRANSCRIPTION (NO UI)
# ==============================
@app.post("/debug/transcribe")
async def debug_transcribe():
    """
    Tests: audio → whisper → translation
    WITHOUT UI, WITHOUT WebSocket
    """

    test_audio_path = "test.wav"

    if not os.path.exists(test_audio_path):
        return {
            "error": "test.wav not found",
            "fix": "Place a WAV file named test.wav in backend folder"
        }

    with open(test_audio_path, "rb") as f:
        audio_bytes = f.read()

    try:
        segments = asr._transcribe_sync(audio_bytes)
    except Exception as e:
        return {
            "error": "ASR failed",
            "details": str(e)
        }

    results = []
    for seg in segments:
        text = seg.get("text", "").strip()
        if not text:
            continue

        translation = translator.translate(text)

        results.append({
            "original": text,
            "translated": translation
        })

    return {
        "status": "SUCCESS",
        "segments": results
    }