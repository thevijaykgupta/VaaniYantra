import asyncio
import base64
import json
import tempfile
import numpy as np
import soundfile as sf
import pyaudio
import websockets

WS_URL = "ws://127.0.0.1:8000/ws/audio/classroom1"
RATE = 16000
CHANNELS = 1
FORMAT = pyaudio.paInt16
CHUNK = 1024
RECORD_SECONDS = 5

async def stream_mic():
    audio = pyaudio.PyAudio()

    stream = audio.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        frames_per_buffer=CHUNK
    )

    print("🎙️ Recording from PC mic... Speak now")

    frames = []
    for _ in range(int(RATE / CHUNK * RECORD_SECONDS)):
        frames.append(stream.read(CHUNK))

    stream.stop_stream()
    stream.close()
    audio.terminate()

    pcm = b"".join(frames)
    audio_np = np.frombuffer(pcm, dtype=np.int16)

    # Write TEMP WAV (this is the key)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, audio_np, RATE, subtype="PCM_16")
        wav_path = f.name

    async with websockets.connect(WS_URL) as ws:
        with open(wav_path, "rb") as f:
            payload = {
                "type": "audio",
                "data": base64.b64encode(f.read()).decode()
            }
            await ws.send(json.dumps(payload))
            await ws.send(json.dumps({"type": "ping"}))

    print("✅ Mic audio sent to backend")

asyncio.run(stream_mic())