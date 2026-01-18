import asyncio
import base64
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import config
import asr_whisper
import database
import models
import translation_engine
import utils
import websocket_manager

logger = logging.getLogger("backend")

app = FastAPI(title="Vaani Yantra Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = websocket_manager.ConnectionManager()
asr = asr_whisper.WhisperASR()
translator = translation_engine.Translator()


@app.on_event("startup")
async def on_startup():
    database.init_db()
    logger.info("Database initialized")


@app.get("/health")
async def health():
    return {"status": "ok", "time": utils.timestamp_now()}


@app.get("/transcripts", response_model=models.TranscriptList)
async def list_transcripts(room_id: str = config.ROOM_ID, limit: int = 50):
    with database.session_scope() as session:
        query = (
            session.query(models.Transcript)
            .filter(models.Transcript.room_id == room_id)
            .order_by(models.Transcript.created_at.desc())
            .limit(limit)
        )
        items = [serialize_transcript(row) for row in query.all()]
    return {"items": items}


@app.post("/transcripts", response_model=models.TranscriptRead)
async def create_transcript(payload: models.TranscriptCreate):
    with database.session_scope() as session:
        obj = models.Transcript(
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


def serialize_transcript(row) -> dict:
    return models.TranscriptRead.from_orm(row).dict()


async def process_audio_chunk(room_id: str, pcm_bytes: bytes):
    """Process audio chunk: ASR -> Translation -> Save -> Broadcast."""
    try:
        # Run ASR
        segments = await utils.run_blocking(asr._transcribe_sync, pcm_bytes)

        for seg in segments:
            text = seg["text"]
            if text.strip():
                try:
                    # Translate
                    translation = translator.translate(text)
                except Exception as e:
                    logger.error(f"Translation failed for text '{text}': {e}")
                    translation = ""  # Continue without translation

                try:
                    # Create transcript
                    payload = models.TranscriptCreate(
                        room_id=room_id,
                        speaker="speaker_auto",
                        text=text,
                        translation=translation,
                    )
                    await create_transcript(payload)
                except Exception as e:
                    logger.error(f"Failed to create transcript: {e}")

    except Exception as e:
        logger.error(f"ASR processing failed: {e}")
        # Don't re-raise - we don't want to crash the websocket


# WebSocket endpoint for audio input from Pi clients
@app.websocket("/ws/audio/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    await manager.connect(ws, topic=room_id)

    # Audio buffer for this room
    buffer = bytearray()

    try:
        # Send initial pong to confirm connection
        await ws.send_json({"type": "connected", "room_id": room_id})

        while True:
            # Add timeout to prevent hanging
            try:
                message = await asyncio.wait_for(ws.receive_text(), timeout=30.0)
                data = json.loads(message)

                if data.get("type") == "audio":
                    try:
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
                    except Exception as e:
                        logger.error(f"Failed to process audio chunk: {e}")
                        # Send error back to client but don't close websocket
                        await ws.send_json({"type": "error", "message": "Audio processing failed"})
                        continue

                elif data.get("type") == "ping":
                    await ws.send_json({"type": "pong"})

            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await ws.send_json({"type": "ping"})
                continue

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for room {room_id}")
        await manager.disconnect(ws, topic=room_id)
    except Exception as exc:
        logger.exception(f"WebSocket failure for room {room_id}: {exc}")
        await manager.disconnect(ws, topic=room_id)
        try:
            await ws.close()
        except:
            pass


