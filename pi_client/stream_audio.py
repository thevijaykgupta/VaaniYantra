import asyncio
import base64
import json
import numpy as np
import sounddevice as sd
import websockets

# ================= CONFIG =================
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SEC = 2
ROOM_ID = "frontend_test"
WS_URL = f"ws://127.0.0.1:8000/ws/audio/{ROOM_ID}"
# =========================================


async def stream_audio():
    print("🔌 Connecting to backend...")
    async with websockets.connect(WS_URL) as ws:
        print("✅ Connected to backend")
        print("🎤 Listening... Speak now")

        loop = asyncio.get_event_loop()

        def callback(indata, frames, time, status):
            if status:
                print("⚠️ Audio status:", status)

            pcm16 = (indata[:, 0] * 32767).astype(np.int16)
            b64 = base64.b64encode(pcm16.tobytes()).decode()

            asyncio.run_coroutine_threadsafe(
                ws.send(json.dumps({
                    "type": "audio",
                    "data": b64
                })),
                loop
            )

        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            callback=callback,
            blocksize=int(SAMPLE_RATE * CHUNK_SEC),
        ):
            while True:
                await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(stream_audio())