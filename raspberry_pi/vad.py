import webrtcvad


class VAD:
    def __init__(self, sample_rate=16000, mode=2):
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(mode)

    def is_speech(self, frame_bytes: bytes) -> bool:
        try:
            return self.vad.is_speech(frame_bytes, self.sample_rate)
        except Exception:
            return False


