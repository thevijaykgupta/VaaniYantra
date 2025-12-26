# System Architecture

```
[Raspberry Pi] --WebSocket--> [FastAPI Backend] --WebSocket--> [Frontend]
        |                           |                   |
   RNNoise + VAD                Faster-Whisper       Browser UI
        |                           |
   Chunked PCM Frames         SQLite + Translator
```

## Data Flow
1. Audio recorded on Raspberry Pi using `pyaudio`.
2. RNNoise denoises and WebRTC VAD filters frames.
3. Pi streams speech frames over WebSocket to `/ws/audio/{room}`.
4. Backend batches `5s` chunks, runs Faster-Whisper (int8) on CPU.
5. Transcripts stored in SQLite and broadcast to frontend clients.
6. Frontend displays original and translated text in dual columns.

## Key Constraints
- CPU-only server (Intel i3-1115G4) → quantized ASR, single worker.
- `MODEL_DIR` pinned to `D:\AI_MODELS`.
- Chunk length limited to 5 seconds to keep memory footprint small.
- LAN-only communication between Pi and server for low latency.

## Scaling Path
- Swap SQLite for PostgreSQL.
- Switch translation backend to M2M100 or cloud inference.
- Deploy backend Docker image to cloud GPU; same API surface.

