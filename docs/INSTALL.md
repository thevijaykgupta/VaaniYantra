# VAANIYANTRA Installation Guide

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, Ubuntu 20.04+, macOS 12+
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: 10GB free space
- **Network**: LAN connection between server and Raspberry Pi

### Software Dependencies

#### Python 3.10+
```bash
# Check version
python --version

# If not installed, download from python.org
# Windows: Use installer from python.org
# Linux: sudo apt install python3.10 python3-pip
```

#### Node.js 18+
```bash
# Check version
node --version

# If not installed:
# Windows: Download from nodejs.org
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
#        sudo apt-get install -y nodejs
```

#### Git
```bash
# Check version
git --version

# If not installed:
# Windows: Download from git-scm.com
# Linux: sudo apt install git
```

## 🚀 Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd vaani_yantra
```

### 2. Automated Setup (Recommended)
```bash
python setup.py
```
This will:
- Create virtual environments
- Install all dependencies
- Set environment variables
- Create necessary directories

### 3. Manual Setup (Alternative)

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

#### Environment Configuration
```bash
# Windows
setx MODEL_DIR "D:\AI_MODELS"

# Linux/Mac
export MODEL_DIR="/home/user/ai_models"

# Create directory
mkdir -p "$MODEL_DIR"
```

## 🔧 Configuration

### Model Directory
The system downloads Whisper models to this directory:
- **Default Windows**: `D:\AI_MODELS`
- **Default Linux**: `~/ai_models`

### Backend Configuration
Edit `backend/config.py` for custom settings:
- `MODEL_DIR`: Path to store AI models
- `WHISPER_MODEL`: Model size ("small", "medium", "large")
- `ROOM_ID`: Room identifier for multi-room support

## 🐳 Docker Setup (Alternative)

### Prerequisites
- Docker Desktop (Windows/Mac)
- Docker Engine (Linux)

### Quick Start
```bash
# Build and run
docker compose up --build

# Access
# Frontend: http://localhost:8080
# Backend: http://localhost:8000
```

## 🥧 Raspberry Pi Setup

### Hardware Requirements
- Raspberry Pi 4 (8GB RAM recommended)
- USB microphone or audio input
- Network connection

### Software Setup
```bash
# On Raspberry Pi
cd raspberry_pi

# Install system dependencies
sudo apt update
sudo apt install -y python3-pip python3-numpy portaudio19-dev ffmpeg

# Install Python dependencies
pip3 install -r requirements_pi.txt

# Configure server IP in config.py
nano config.py
# Set SERVER_IP to your server's IP address
```

### Running Pi Client
```bash
cd raspberry_pi
python3 online_client.py
```

## 🧪 Testing

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend accessibility
curl -I http://localhost:8080
```

### Sample Audio Test
```bash
cd backend
python -c "from asr_whisper import WhisperASR; asr = WhisperASR(); print(asr.transcribe_file('sample_audio/sample_short.wav'))"
```

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Verify virtual environment activation
- Check MODEL_DIR environment variable

#### Frontend build fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (need 18+)

#### Models not downloading
- Check internet connection
- Verify MODEL_DIR permissions
- Increase timeout in config.py

#### Raspberry Pi connection fails
- Verify IP addresses in config.py
- Check firewall settings
- Ensure both devices are on same network

### Performance Tuning

#### For better accuracy
- Change `WHISPER_MODEL` to "medium" or "large" in config.py
- Requires more RAM and processing time

#### For better speed
- Use GPU if available (NVIDIA with CUDA)
- Reduce `WHISPER_MODEL` to "tiny" or "base"

## 📞 Support

For issues:
1. Check this guide
2. Review logs in terminal output
3. Check GitHub issues
4. Create new issue with system info and error logs
