import logging

import numpy as np

try:
    import rnnoise
except ImportError:  # pragma: no cover - fallback without rnnoise
    rnnoise = None

logger = logging.getLogger("rnnoise")


class RNNoiseProc:
    def __init__(self):
        if rnnoise is None:
            logger.warning("rnnoise package not available, pass-through mode")
        else:
            self.instance = rnnoise.RNNoise()

    def denoise(self, pcm_bytes: bytes) -> bytes:
        if rnnoise is None:
            return pcm_bytes
        pcm = np.frombuffer(pcm_bytes, dtype=np.int16)
        denoised = self.instance.process_frame(pcm.astype(np.float32) / 32768.0)
        out = (denoised * 32768.0).astype(np.int16).tobytes()
        return out


