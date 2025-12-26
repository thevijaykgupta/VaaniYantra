import asyncio
import base64
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .asr_whisper import WhisperASR
from .database import init_db, session_scope
from .models import Transcript, TranscriptCreate, TranscriptList, TranscriptRead
from .translation_engine import Translator
from .utils import run_blocking, timestamp_now
from .websocket_manager import ConnectionManager

logger = logging.getLogger("backend")

app = FastAPI(title="Vaani Yantra Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.get("/health")
async def health():
    return {"status": "ok", "time": timestamp_now()}


@app.get("/transcripts", response_model=TranscriptList)
async def list_transcripts(room_id: str = config.ROOM_ID, limit: int = 50):
    with session_scope() as session:
        query = (
            session.query(Transcript)
            .filter(Transcript.room_id == room_id)
            .order_by(Transcript.created_at.desc())
            .limit(limit)
        )
        items = [serialize_transcript(row) for row in query.all()]
    return {"items": items}


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
    """Process audio chunk: ASR -> Translation -> Save -> Broadcast."""
    # Run ASR
    segments = await run_blocking(asr._transcribe_sync, pcm_bytes)

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


