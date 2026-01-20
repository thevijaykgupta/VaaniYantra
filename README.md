# VaaniYantra - Multilingual Classroom Speech Transcription & Translation

*A cutting-edge, CPU-optimized hybrid system for real-time speech capture on Raspberry Pi and intelligent transcription/translation on Windows/Linux servers.*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## Overview

VaaniYantra is a sophisticated multilingual speech recognition and translation platform designed for educational environments. It combines edge computing on Raspberry Pi devices with powerful server-side processing to deliver real-time, accurate transcriptions and translations.

### Key Features

- **Real-time Processing**: Live speech-to-text with sub-second latency
- **Multilingual Support**: Automatic language detection with translation to multiple languages
- **CPU Optimized**: Runs efficiently on modest hardware without requiring GPU acceleration
- **Hybrid Architecture**: Edge capture + server processing for optimal performance
- **Modern UI**: Premium, responsive interface with cinematic design
- **Production Ready**: Docker support, comprehensive logging, and error handling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raspberry Pi  │    │   WebSocket     │    │   Windows/Linux │
│   Edge Capture  │───▶│   Streaming     │───▶│   Server        │
│                 │    │                 │    │                 │
│ • Audio Capture │    │ • Binary Audio  │    │ • ASR Engine    │
│ • VAD Filtering │    │ • Real-time     │    │ • Translation   │
│ • Noise Reduction│   │ • Compression   │    │ • Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
VaaniYantra/
├── backend/                          # FastAPI Server & ML Processing
│   ├── main.py                       # Main FastAPI application
│   ├── asr_whisper.py                # Whisper ASR integration
│   ├── translation_engine.py         # Marian MT translation
│   ├── websocket_manager.py          # WebSocket connection handling
│   ├── models.py                     # SQLAlchemy models & Pydantic schemas
│   ├── database.py                   # Database connection & utilities
│   ├── config.py                     # Configuration management
│   ├── requirements.txt              # Python dependencies
│   └── transcripts.db                # SQLite database (generated)
│
├── frontend/                         # React Web Application
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Header/              # Top navigation & branding
│   │   │   ├── Sidebar/             # Left navigation menu
│   │   │   ├── SessionBar/          # Session controls & subject selection
│   │   │   ├── Transcription/       # Live transcription display
│   │   │   ├── Status/              # Connection status & footer
│   │   │   ├── Chakra/              # Audio visualization
│   │   │   └── views/               # Main application views
│   │   ├── context/                 # React context providers
│   │   ├── services/                # API & WebSocket clients
│   │   ├── styles/                  # CSS variables & global styles
│   │   ├── hooks/                   # Custom React hooks
│   │   └── utils/                   # Utility functions
│   ├── public/                      # Static assets
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.js               # Vite configuration
│
├── raspberry_pi/                    # Edge Computing Client
│   ├── audio_capture.py             # Audio capture with PyAudio
│   ├── vad.py                       # Voice Activity Detection
│   ├── rnnoise_wrapper.py           # Noise reduction
│   ├── online_client.py             # WebSocket streaming client
│   ├── config.py                    # Pi-specific configuration
│   └── requirements_pi.txt          # Raspberry Pi dependencies
│
├── sample_audio/                    # Test Audio Files
│   └── sample_short.wav             # Sample audio for testing
│
├── docs/                           # Documentation
│   ├── README.md                   # Detailed setup guide
│   ├── INSTALL.md                  # Installation instructions
│   ├── architecture_diagrams.txt   # System architecture docs
│   ├── system_architecture.md      # Technical specifications
│   └── PROJECT_STRUCTURE.md        # This file
│
├── scripts/                        # Utility Scripts
│   ├── setup.py                    # Automated setup script
│   ├── check_requirements.py       # Dependency verification
│   └── test.py                     # Testing utilities
│
├── tests/                          # Test Suite
│   ├── test_backend.py             # Backend unit tests
│   └── test_audio_pipeline.py      # Audio processing tests
│
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Docker configuration
└── README.md                       # This file
```

## System Requirements

### Minimum Hardware
- **Server**: Intel i3-1115G4 or equivalent (8GB RAM)
- **Edge Device**: Raspberry Pi 4 or equivalent
- **Storage**: 10GB free space for ML models

### Software Prerequisites
- **Python**: 3.10+ with pip
- **Node.js**: 18+ for frontend development
- **Git**: For repository management

### Supported Platforms
- **Server**: Windows 10/11, Linux, macOS
- **Edge**: Raspberry Pi OS (64-bit recommended)

## Quick Start

### Automated Setup (Recommended)
```bash
# Clone repository
git clone <repository-url>
cd VaaniYantra

# Run automated setup
python scripts/setup.py
```

### Manual Setup

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
npm run dev
```

#### Environment Configuration
```bash
# Set model directory (Windows)
setx MODEL_DIR "D:\AI_MODELS"

# Linux/Mac
export MODEL_DIR="/path/to/models"
```

## Usage

### Development Mode
```bash
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
python run.py
```

### Docker Deployment
```bash
docker compose up --build
```

## Access Points

- **Frontend UI**: http://localhost:3004
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **WebSocket**: ws://localhost:8000/ws/audio/{room_id}

## Raspberry Pi Setup

1. **Transfer files** to Raspberry Pi:
   ```bash
   scp -r raspberry_pi/ pi@raspberrypi:~/vaaniyantra/
   ```

2. **Configure server IP** in `raspberry_pi/config.py`:
   ```python
   SERVER_IP = "192.168.1.100"  # Your server IP
   ```

3. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-numpy portaudio19-dev ffmpeg
   pip3 install -r requirements_pi.txt
   ```

4. **Start audio capture**:
   ```bash
   cd vaaniyantra
   python3 online_client.py
   ```

## Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Audio Pipeline Test
```python
from backend.asr_whisper import WhisperASR
asr = WhisperASR()
result = asr.transcribe_file("sample_audio/sample_short.wav")
print(result)
```

### WebSocket Test
```bash
python test_audio_pipeline.py
```

## Configuration

### Environment Variables
```bash
# Model settings
MODEL_DIR=/path/to/models
WHISPER_MODEL=small
WHISPER_COMPUTE=int8

# Translation
TRANSLATION_BACKEND=marian

# Server
HOST=0.0.0.0
PORT=8000
```

### Audio Settings
```python
# In config.py
SAMPLE_RATE = 16000      # Audio sample rate
WHISPER_CHUNK_SEC = 1    # Processing chunk size (seconds)
```

## API Reference

### WebSocket Endpoints
- `POST /ws/audio/{room_id}` - Audio streaming WebSocket
- `GET /health` - Health check endpoint
- `GET /transcripts` - Retrieve transcript history

### Message Formats
```json
// Audio data
{
  "type": "audio",
  "data": "base64_encoded_pcm"
}

// Transcript response
{
  "type": "transcript",
  "payload": {
    "text": "Hello world",
    "translation": "नमस्ते दुनिया",
    "language": "en"
  }
}
```

## Troubleshooting

### Common Issues

**1. Import Errors**
```bash
pip install --upgrade -r requirements.txt
```

**2. Model Download Issues**
```bash
export HF_HOME=/path/to/large/disk
python -c "from backend.asr_whisper import WhisperASR; print('Models ready')"
```

**3. WebSocket Connection Failed**
- Check if backend is running: `curl http://localhost:8000/health`
- Verify firewall settings
- Check browser console for connection errors

**4. Audio Quality Issues**
- Ensure microphone permissions are granted
- Check audio sample rate (must be 16kHz)
- Verify VAD settings in config

## Performance Optimization

### CPU Optimization
- Uses `faster-whisper` with `int8` quantization
- Optimized chunk processing (1-second chunks)
- Efficient memory management

### Scaling Up
```python
# For GPU acceleration
WHISPER_COMPUTE = "float16"
# device = "cuda"  # Requires CUDA installation

# For larger models
WHISPER_MODEL = "medium"  # or "large"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenAI Whisper** - Foundation ASR model
- **Faster-Whisper** - Optimized inference
- **Hugging Face** - Marian MT translation models
- **React & FastAPI** - Web framework ecosystem

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the troubleshooting section above

---

Built with care for seamless multilingual communication in education.