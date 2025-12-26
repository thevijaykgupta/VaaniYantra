# Vaani_Yantra - Multilingual Classroom Speech Transcription & Translation

**CPU-first hybrid system** for realtime speech capture on a Raspberry Pi and transcription/translation on a Windows 11 machine (Intel i3-1115G4, 8 GB RAM, no CUDA).

## 📋 System Requirements

### Minimum Hardware
- **Server**: Intel i3-1115G4 or equivalent (8GB RAM minimum)
- **Client**: Raspberry Pi 4 or equivalent
- **Storage**: 10GB free space for models

### Software Prerequisites
- **Python**: 3.10+ (with pip)
- **Node.js**: 18+ (for frontend development)
- **Git**: For cloning repository

### Operating Systems
- **Server**: Windows 10/11, Linux, macOS
- **Client**: Raspberry Pi OS (64-bit recommended)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd vaani_yantra

# Run automated setup
python setup.py
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

#### Environment Setup
```bash
# Windows
setx MODEL_DIR "D:\AI_MODELS"

# Linux/Mac
export MODEL_DIR="/path/to/models"
```

## 🏗️ Repo Structure
```
backend/           FastAPI server, Faster-Whisper ASR, SQLite storage
frontend/          React UI with real-time transcription display
raspberry_pi/      Edge capture client with RNNoise + VAD
sample_audio/      Test audio files
docs/             Architecture documentation
tests/            Unit tests

📄 Documentation:
├── README.md          Main documentation
├── INSTALL.md         Detailed installation guide
├── requirements-full.txt  Complete dependency list

🛠️ Setup Scripts:
├── setup.py           Automated setup script
├── check_requirements.py  Requirements verification
└── docker-compose.yml Docker configuration
```

## 🎯 Running the Application

### Development Mode
```bash
# Terminal 1: Start Backend
cd backend
venv\Scripts\activate  # Windows
python run.py

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Backend (same as development)
cd backend
python run.py
```

### Docker (CPU-only)
```bash
docker compose up --build
```

## 🌐 Access Points
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

### Optional: Docker Compose (CPU)
```powershell
docker compose up --build
```

## Raspberry Pi Instructions
1. Copy `raspberry_pi/` to the Pi.
2. Edit `config.py` → `SERVER_IP` (default `172.20.10.3`).
3. Install prerequisites:
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-numpy portaudio19-dev ffmpeg
   pip3 install -r requirements_pi.txt
   ```
   (create `requirements_pi.txt` with `pyaudio`, `webrtcvad`, `rnnoise`, `websockets`, `vosk` as needed).
4. Run client:
   ```bash
   cd raspberry_pi
   python3 online_client.py
   ```

## Testing & Utilities
- Health check: `curl http://127.0.0.1:8000/health`
- Sample ASR test:
  ```python
  from backend.asr_whisper import WhisperASR
  asr = WhisperASR()
  print(asr.transcribe_file("sample_audio/sample_short.wav"))
  ```
- Simulate Pi streaming using `test.py` at `file:///D:/@VIJAY_All_data/MY WORKS/Multilingual_Transcription/Vaani_Yantra/test.py`.

## Must-Do Before Demo
1. `setx MODEL_DIR D:\AI_MODELS` and download whisper-small.
2. Launch backend (`uvicorn ...`), then frontend (`python -m http.server`).
3. Start Pi client or run `test.py` simulator.
4. Check `/health` endpoint and browser console for WebSocket traffic.
5. Close heavy applications to keep RAM below 4 GB.

## Upgrade to GPU / Cloud
- Replace Faster-Whisper compute_type with `"float16"` and `device="cuda"`.
- Increase model size (medium/large) and widen beam size for accuracy.
- Swap SQLite for PostgreSQL and front the backend with HTTPS/WSS.

## License
MIT – see `LICENSE`.

