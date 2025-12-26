import os

# Directory for storing models (set via MODEL_DIR env, default to D:\AI_MODELS)
MODEL_DIR = os.getenv("MODEL_DIR", r"D:\AI_MODELS")
# Configure Hugging Face cache to use MODEL_DIR
os.environ["HF_HOME"] = MODEL_DIR
os.environ["TRANSFORMERS_CACHE"] = MODEL_DIR

# Whisper model configuration
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_COMPUTE = os.getenv("WHISPER_COMPUTE", "int8")

# Translation backend: "marian", "m2m100", or "cloud"
TRANSLATION_BACKEND = os.getenv("TRANSLATION_BACKEND", "marian")

# Database URL (SQLite for local storage)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///transcripts.db")

# Server host/port (0.0.0.0 to listen on LAN)
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# ASR chunk length in seconds
WHISPER_CHUNK_SEC = int(os.getenv("WHISPER_CHUNK_SEC", "5"))
# Audio sample rate
SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", "16000"))
ROOM_ID = "default"


