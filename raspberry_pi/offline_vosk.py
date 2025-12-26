import json
import logging
import os

from vosk import KaldiRecognizer, Model

logger = logging.getLogger("vosk_offline")
MODEL_PATH = "/home/pi/vosk-model-small-en-us-0.15"


class VoskOffline:
    def __init__(self, model_path=MODEL_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError("Vosk model missing")
        self.model = Model(model_path)

    def transcribe_bytes(self, pcm_bytes: bytes, sample_rate=16000):
        rec = KaldiRecognizer(self.model, sample_rate)
        rec.AcceptWaveform(pcm_bytes)
        res = rec.Result()
        logger.info("Offline Vosk result %s", res)
        return json.loads(res)["text"]


