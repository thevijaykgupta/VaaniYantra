import logging
import config
import utils
from typing import Sequence
from pathlib import Path

logger = logging.getLogger("asr")

class WhisperASR:
    """
    CPU-optimized ASR wrapper using faster-whisper (int8) when available.
    Falls back to OpenAI Whisper if necessary (CPU-only mode).
    """
    def __init__(self, model_name=config.WHISPER_MODEL, compute_type=config.WHISPER_COMPUTE):
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
        return await utils.run_blocking(self._transcribe_sync, file_path)

    def _transcribe_sync(self, file_path: str, language=None):
        """Blocking transcription that returns (segments, info)."""
        if self.backend == "faster-whisper":
            segments, info = self.model.transcribe(file_path, beam_size=1, language=language)
            out = []
            for seg in segments:
                out.append({"start": seg.start, "end": seg.end, "text": seg.text})
            return out, info
        elif self.backend == "whisper":
            result = self.model.transcribe(file_path, language=language)
            # result["segments"] is a list of dicts with start, end, text
            segments = [{"start": s["start"], "end": s["end"], "text": s["text"]}
                       for s in result["segments"]]
            # Create a simple info object for compatibility
            info = type('Info', (), {'language': result.get('language')})()
            return segments, info
        else:
            raise RuntimeError("No ASR backend available")


def save_chunk(chunk: Sequence[int], folder: Path, idx: int) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    out_path = folder / f"chunk_{idx}.wav"
    wavfile.write(out_path, SAMPLE_RATE, np.array(chunk, dtype=np.int16))
    return out_path


