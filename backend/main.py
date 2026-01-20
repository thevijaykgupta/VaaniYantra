import asyncio
import base64
import json
import logging
import tempfile
import os
import sys
import io
from pathlib import Path

# FIX 1: FORCE UTF-8 ENCODING FOR WINDOWS COMPATIBILITY
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scipy.io import wavfile

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

# Language lock per room
ROOM_LANGUAGE = {}

# Target language per room (user selected)
ROOM_TARGET_LANGUAGE = {}

# Atomic ASR locks per room to prevent CPU overload
from collections import defaultdict
ASR_LOCKS = defaultdict(asyncio.Lock)


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
            detected_language=payload.detected_language,
        )
        session.add(obj)
        session.flush()
        result = serialize_transcript(obj)
        await manager.broadcast({"type": "transcript", "payload": result}, topic=payload.room_id)
    return result


def serialize_transcript(row) -> dict:
    data=models.TranscriptRead.from_orm(row).dict()
    if "created_at" in data and data["created_at"] is not None:
        data["created_at"] = data["created_at"].isoformat()
    return data
    # return models.TranscriptRead.from_orm(row).dict()


async def process_audio_chunk(room_id: str, pcm_bytes: bytes):
    """Process audio chunk: ASR -> Translation -> Save -> Broadcast."""
    # FIX 2: Atomic ASR locking - guarantees only one ASR job per room
    async with ASR_LOCKS[room_id]:
        await _process_audio_chunk_internal(room_id, pcm_bytes)


async def _process_audio_chunk_internal(room_id: str, pcm_bytes: bytes):
    """Internal ASR processing with proper resource management."""
    temp_file_path = None
    try:
        # Convert PCM bytes to numpy array
        pcm_array = np.frombuffer(pcm_bytes, dtype=np.int16)

        # Create temporary WAV file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_file_path = temp_file.name
            # Write WAV file (scipy expects sample rate and data)
            wavfile.write(temp_file_path, config.SAMPLE_RATE, pcm_array)

        logger.info(f"Created temp WAV file: {temp_file_path}, size: {len(pcm_bytes)} bytes")

        # FIX 2: MOVE WHISPER OFF EVENT LOOP TO PREVENT WS TIMEOUT
        # STEP A2: Language detection and locking
        loop = asyncio.get_running_loop()
        if room_id not in ROOM_LANGUAGE:
            segments, info = await loop.run_in_executor(
                None,
                lambda: asr._transcribe_sync(temp_file_path)
            )
            if info and info.language:
                ROOM_LANGUAGE[room_id] = info.language
                logger.info(f"🔒 Locked language for {room_id}: {info.language}")
        else:
            segments, info = await loop.run_in_executor(
                None,
                lambda: asr._transcribe_sync(temp_file_path, language=ROOM_LANGUAGE[room_id])
            )

        logger.info(f"ASR returned {len(segments)} segments")

        # Check if clients are still connected before creating transcripts
        if not manager.has_clients(room_id):
            logger.info(f"No clients connected for room {room_id}, skipping transcript creation")
            return

        for seg in segments:
            text = seg["text"]
            logger.info(f"Segment text: (length={len(text)})")  # Avoid logging raw Unicode
            if text.strip():
                try:
                    # Translate with detected language (safe access)
                    source_lang = getattr(info, 'language', 'en') if info else 'en'
                    target_lang = ROOM_TARGET_LANGUAGE.get(room_id, "en")
                    translation = translator.translate(text, source_lang=source_lang, target_lang=target_lang)
                    logger.info(f"Translation {source_lang}→{target_lang}: (length={len(translation)})")  # Avoid logging raw Unicode
                except Exception as e:
                    logger.error(f"Translation failed: {e}")
                    translation = ""  # Continue without translation

                try:
                    # Create transcript with detected language
                    payload = models.TranscriptCreate(
                        room_id=room_id,
                        speaker="speaker_auto",
                        text=text,
                        translation=translation,
                        detected_language=source_lang,  # Include detected language
                    )
                    await create_transcript(payload)
                    logger.info(f"Created transcript for room {room_id}: (length={len(text)}), lang: {source_lang}")
                except Exception as e:
                    logger.error(f"Failed to create transcript: {e}")

    except Exception as e:
        logger.error(f"ASR processing failed: {e}")
        logger.error(f"Error details: {type(e).__name__}: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Don't re-raise - we don't want to crash the websocket
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temp file: {temp_file_path}")
            except Exception as e:
                logger.error(f"Failed to clean up temp file {temp_file_path}: {e}")
        # ASR lock automatically released when exiting async with block


@app.websocket("/ws/audio/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    try:
        await manager.connect(ws, topic=room_id)
    except Exception as e:
        logger.error(f"Failed to accept WebSocket: {e}")
        return

    buffer = bytearray()
    logger.warning(">>> USING FINAL BINARY-ONLY WS LOOP")

    try:
        while True:
            try:
                message = await asyncio.wait_for(ws.receive(), timeout=30)

            except asyncio.TimeoutError:
                continue  # ✅ keepalive ONLY

            except (WebSocketDisconnect, RuntimeError):
                logger.info(f"WebSocket disconnected for room {room_id}")
                break

            except Exception:
                logger.exception("Fatal WebSocket error")
                break

            # 🔴 HANDLE RAW AUDIO ONLY
            if "bytes" in message and message["bytes"]:
                buffer.extend(message["bytes"])

                required = int(config.SAMPLE_RATE * config.WHISPER_CHUNK_SEC) * 2
                if len(buffer) >= required:
                    chunk = bytes(buffer[:required])
                    del buffer[:required]
                    await process_audio_chunk(room_id, chunk)

            # 🔵 HANDLE CONFIG MESSAGES (text frames)
            elif "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "config":
                        ROOM_TARGET_LANGUAGE[room_id] = data["target_language"]
                        logger.info(f"🎯 Target language set for {room_id}: {data['target_language']}")
                    else:
                        logger.debug("Ignoring unknown text WS frame")
                except Exception:
                    logger.debug("Ignoring malformed text WS frame")

    finally:
        await manager.disconnect(ws, topic=room_id)
        try:
            await ws.close()
        except:
            pass


