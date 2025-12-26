import logging
from .config import WHISPER_MODEL, WHISPER_COMPUTE
from .utils import run_blocking
from typing import Sequence
from pathlib import Path

logger = logging.getLogger("asr")

class WhisperASR:
    """
    CPU-optimized ASR wrapper using faster-whisper (int8) when available.
    Falls back to OpenAI Whisper if necessary (CPU-only mode).
    """
    def __init__(self, model_name=WHISPER_MODEL, compute_type=WHISPER_COMPUTE):
        self.model_name = model_name
        self.compute_type = compute_type
        self.model = None
        self.backend = None
        self._load()

    def _load(self):
        try:
            from faster_whisper import WhisperModel
            logger.info("Loading faster-whisper (CPU optimized)...")
            self.model = WhisperModel(self.model_name, device="cpu",
                                      compute_type=self.compute_type)
            self.backend = "faster-whisper"
            logger.info("faster-whisper loaded.")
        except Exception as e:
            logger.warning(f"faster-whisper not available, falling back to OpenAI Whisper: {e}")
            try:
                import whisper
                self.model = whisper.load_model(self.model_name, device="cpu")
                self.backend = "whisper"
                logger.info("OpenAI Whisper loaded.")
            except Exception as ex:
                logger.exception("Unable to load any Whisper backend")
                raise ex

    async def transcribe_file(self, file_path: str):
        """Transcribe an audio file asynchronously."""
        return await run_blocking(self._transcribe_sync, file_path)

    def _transcribe_sync(self, file_path: str):
        """Blocking transcription that returns a list of segments."""
        if self.backend == "faster-whisper":
            segments, _ = self.model.transcribe(file_path, beam_size=1)
            out = []
            for seg in segments:
                out.append({"start": seg.start, "end": seg.end, "text": seg.text})
            return out
        elif self.backend == "whisper":
            result = self.model.transcribe(file_path)
            # result["segments"] is a list of dicts with start, end, text
            return [{"start": s["start"], "end": s["end"], "text": s["text"]}
                    for s in result["segments"]]
        else:
            raise RuntimeError("No ASR backend available")


def save_chunk(chunk: Sequence[int], folder: Path, idx: int) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    out_path = folder / f"chunk_{idx}.wav"
    wavfile.write(out_path, SAMPLE_RATE, np.array(chunk, dtype=np.int16))
    return out_path


