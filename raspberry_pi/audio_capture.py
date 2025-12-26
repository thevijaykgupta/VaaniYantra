import asyncio
import base64
import json
import logging
import time

import pyaudio
import websockets

from .config import CHANNELS, CHUNK_MS, DEVICE_INDEX, SAMPLE_RATE, SERVER_WS_URL
from .rnnoise_wrapper import RNNoiseProc
from .vad import VAD

logger = logging.getLogger("pi_audio")


class PiAudioClient:
    def __init__(self):
        self.uri = SERVER_WS_URL
        self.pa = pyaudio.PyAudio()
        self.chunk = int(SAMPLE_RATE * (CHUNK_MS / 1000.0))
        self.stream = None
        self.rn = RNNoiseProc()
        self.vad = VAD(sample_rate=SAMPLE_RATE)

    def open(self):
        self.stream = self.pa.open(
            format=pyaudio.paInt16,
            channels=CHANNELS,
            rate=SAMPLE_RATE,
            input=True,
            frames_per_buffer=self.chunk,
            input_device_index=DEVICE_INDEX,
        )
        logger.info("Microphone opened")

    async def send_loop(self):
        reconnect = 1
        while True:
            try:
                async with websockets.connect(self.uri) as ws:
                    logger.info("Connected to server")
                    reconnect = 1
                    while True:
                        data = self.stream.read(self.chunk, exception_on_overflow=False)
                        data = self.rn.denoise(data)
                        if not self.vad.is_speech(data):
                            continue
                        payload = {
                            "type": "audio",
                            "ts": time.time(),
                            "data": base64.b64encode(data).decode("ascii"),
                        }
                        await ws.send(json.dumps(payload))
                        await asyncio.sleep(0)
            except Exception:
                logger.exception("ws error")
                await asyncio.sleep(reconnect)
                reconnect = min(30, reconnect * 2)


