import asyncio
import base64
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect,HTTPException
from fastapi.middleware.cors import CORSMiddleware

import config
import asr_whisper
import database
import models
import translation_engine
import utils
import websocket_manager

from fastapi.responses import FileResponse
import tempfile
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

WhisperASR = asr_whisper.WhisperASR
init_db = database.init_db
session_scope = database.session_scope
Transcript = models.Transcript
TranscriptCreate = models.TranscriptCreate
TranscriptRead = models.TranscriptRead
TranscriptList = models.TranscriptList
Translator = translation_engine.Translator
run_blocking = utils.run_blocking
timestamp_now = utils.timestamp_now
ConnectionManager = websocket_manager.ConnectionManager


logger = logging.getLogger("backend")

app = FastAPI(title="Vaani Yantra Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
asr = WhisperASR()
translator = Translator()


@app.on_event("startup")
async def on_startup():
    init_db()
    logger.info("Database initialized")


@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "message": "Vaani Yantra Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "GET /": "API information",
            "GET /health": "Health check",
            "GET /transcripts": "List transcripts",
            "POST /transcripts": "Create transcript",
            "WebSocket /ws/audio/{room_id}": "Audio streaming"
        }
    }


@app.get("/health")
async def health():
    return {"status": "ok", "time": timestamp_now()}


@app.get("/transcripts/{transcript_id}/download")
def download_transcript(transcript_id: int, format: str = "pdf"):
    with session_scope() as session:
        transcript = session.query(Transcript).get(transcript_id)

        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

    if format == "pdf":
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        c = canvas.Canvas(temp.name, pagesize=A4)
        c.drawString(50, 800, f"Room: {transcript.room_id}")
        c.drawString(50, 780, f"Speaker: {transcript.speaker}")
        c.drawString(50, 740, transcript.text)
        c.drawString(50, 700, "Translation:")
        c.drawString(50, 680, transcript.translation)
        c.save()
        return FileResponse(temp.name, filename="transcript.pdf")

    raise HTTPException(status_code=400, detail="Unsupported format")


@app.get("/transcripts")
def list_transcripts(room_id: str | None = None):
    with session_scope() as db:
        q = db.query(Transcript)
        if room_id:
            q = q.filter(Transcript.room_id == room_id)

        items = q.order_by(Transcript.created_at.desc()).all()
        return {"items": [serialize_transcript(t) for t in items]}

@app.post("/transcripts", response_model=TranscriptRead)
async def create_transcript(payload: TranscriptCreate):
    with session_scope() as session:
        obj = Transcript(
            room_id=payload.room_id,
            speaker=payload.speaker,
            text=payload.text,
            translation=payload.translation,
        )
        session.add(obj)
        session.flush()
        result = serialize_transcript(obj)
    await manager.broadcast({"type": "transcript", "payload": result}, topic=payload.room_id)
    return result


def serialize_transcript(row: Transcript) -> dict:
    return TranscriptRead.from_orm(row).dict()


async def process_audio_chunk(room_id: str, pcm_bytes: bytes):
    try:
        segments = await run_blocking(asr._transcribe_sync, pcm_bytes)
    except Exception as e:
        logger.warning("ASR skipped on PC: %s", e)
        return

    for seg in segments:
        text = seg["text"]
        if text.strip():
            # Translate
            translation = translator.translate(text)

            # Create transcript
            payload = TranscriptCreate(
                room_id=room_id,
                speaker="speaker_auto",
                text=text,
                translation=translation,
            )
            await create_transcript(payload)


# WebSocket endpoint for audio input from Pi clients
@app.websocket("/ws/audio/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    await manager.connect(ws, topic=room_id)

    # Audio buffer for this room
    buffer = bytearray()

    try:
        while True:
            message = await ws.receive_text()
            data = json.loads(message)

            if data.get("type") == "audio":
                # Decode base64 audio chunk
                chunk = base64.b64decode(data["data"])
                buffer.extend(chunk)

                # Process when we have enough audio (5 seconds)
                required_bytes = int(config.SAMPLE_RATE * config.WHISPER_CHUNK_SEC) * 2
                if len(buffer) >= required_bytes:
                    # Extract chunk and process
                    audio_chunk = bytes(buffer[:required_bytes])
                    del buffer[:required_bytes]
                    await process_audio_chunk(room_id, audio_chunk)

            elif data.get("type") == "ping":
                await ws.send_json({"type": "pong"})

    except WebSocketDisconnect:
        await manager.disconnect(ws, topic=room_id)
    except Exception as exc:
        logger.exception("WebSocket failure: %s", exc)
        await manager.disconnect(ws, topic=room_id)
        await ws.close()


# ==============================
# 🔥 DEBUG TRANSCRIPTION (TEST AUDIO)
# ==============================
@app.post("/debug/transcribe")
async def debug_transcribe():
    """
    Test the complete audio → whisper → translation pipeline
    WITHOUT UI, WITHOUT WebSocket
    """
    test_audio_path = "test.wav"

    if not os.path.exists(test_audio_path):
        return {
            "error": "test.wav not found",
            "message": "Place a WAV file named 'test.wav' in the backend directory to test transcription"
        }

    try:
        # Read audio file
        with open(test_audio_path, "rb") as f:
            audio_bytes = f.read()

        logger.info(f"Testing transcription with {len(audio_bytes)} bytes of audio data")

        # Process with Whisper
        segments = asr._transcribe_sync(audio_bytes)

        if not segments:
            return {
                "error": "No speech detected",
                "message": "The audio file appears to be silent or contains no recognizable speech"
            }

        results = []
        for seg in segments:
            text = seg.get("text", "").strip()
            if not text:
                continue

            # Translate the text
            translation = translator.translate(text)

            results.append({
                "original_text": text,
                "translated_text": translation,
                "confidence": seg.get("confidence", 0),
                "start_time": seg.get("start", 0),
                "end_time": seg.get("end", 0)
            })

        return {
            "status": "SUCCESS",
            "message": f"Successfully transcribed {len(results)} text segments",
            "total_segments": len(segments),
            "successful_segments": len(results),
            "transcription_results": results,
            "model_info": {
                "asr_model": "faster-whisper",
                "translation_model": "marianmt"
            }
        }

    except Exception as e:
        logger.error(f"Debug transcription failed: {e}")
        return {
            "error": "Transcription failed",
            "details": str(e),
            "message": "Check backend logs for more details"
        }


