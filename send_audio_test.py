import asyncio
import websockets
import base64
import wave
import json
from pathlib import Path

AUDIO_FILE = Path("sample_audio/test.wav")
WS_URL = "ws://127.0.0.1:8000/ws/audio/classroom1"

async def send_audio():
    async with websockets.connect(WS_URL) as ws:
        with wave.open(str(AUDIO_FILE), "rb") as wf:
            frames = wf.readframes(wf.getnframes())

        payload = {
            "type": "audio",
            "data": base64.b64encode(frames).decode("utf-8")
        }

        await ws.send(json.dumps(payload))
        await ws.send(json.dumps({"type": "end"}))

        print("Audio sent successfully")

asyncio.run(send_audio())