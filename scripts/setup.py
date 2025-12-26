#!/usr/bin/env python3
"""
VAANIYANTRA Setup Script
Comprehensive setup for the multilingual transcription system.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, shell=False):
    """Run a command and return success status."""
    try:
        result = subprocess.run(
            command if shell else command.split(),
            shell=shell,
            capture_output=True,
            text=True,
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python_version():
    """Check if Python version is compatible."""
    version = sys.version_info
    if version.major == 3 and version.minor >= 10:
        print("✅ Python version compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor} detected. Need Python 3.10+")
        return False

def setup_backend():
    """Setup backend dependencies."""
    print("\n🔧 Setting up backend...")

    # Check if virtual environment exists
    venv_path = Path("backend/venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        success, output = run_command("python -m venv backend/venv")
        if not success:
            print(f"Failed to create venv: {output}")
            return False

    # Activate venv and install dependencies
    activate_cmd = "backend\\venv\\Scripts\\activate" if platform.system() == "Windows" else "source backend/venv/bin/activate"
    pip_cmd = f"{activate_cmd} && pip install -r backend/requirements.txt"

    print("Installing backend dependencies...")
    success, output = run_command(pip_cmd, shell=True)
    if success:
        print("✅ Backend dependencies installed")
        return True
    else:
        print(f"❌ Backend setup failed: {output}")
        return False

def setup_frontend():
    """Setup frontend dependencies."""
    print("\n🎨 Setting up frontend...")

    if not Path("frontend/package.json").exists():
        print("❌ Frontend package.json not found")
        return False

    # Check if Node.js is installed
    success, output = run_command("node --version")
    if not success:
        print("❌ Node.js not found. Please install Node.js 18+")
        return False

    print("Installing frontend dependencies...")
    success, output = run_command("cd frontend && npm install")
    if success:
        print("✅ Frontend dependencies installed")
        return True
    else:
        print(f"❌ Frontend setup failed: {output}")
        return False

def setup_environment():
    """Setup environment variables."""
    print("\n🌍 Setting up environment...")

    # Set MODEL_DIR
    model_dir = "D:\\AI_MODELS" if platform.system() == "Windows" else os.path.expanduser("~/ai_models")

    if platform.system() == "Windows":
        success, output = run_command(f'setx MODEL_DIR "{model_dir}"')
        if success:
            print(f"✅ MODEL_DIR set to {model_dir}")
        else:
            print(f"⚠️  Could not set MODEL_DIR: {output}")
    else:
        print(f"Please set MODEL_DIR environment variable to: {model_dir}")

    # Create model directory
    Path(model_dir).mkdir(parents=True, exist_ok=True)
    print(f"✅ Model directory created: {model_dir}")

    return True

def main():
    """Main setup function."""
    print("🚀 VAANIYANTRA Setup")
    print("=" * 50)

    if not check_python_version():
        sys.exit(1)

    success = True

    if not setup_environment():
        success = False

    if not setup_backend():
        success = False

    if not setup_frontend():
        success = False

    if success:
        print("\n🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start backend: cd backend && venv\\Scripts\\activate && python run.py")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Open http://localhost:8080 in your browser")
        print("\n📚 For Raspberry Pi setup, see raspberry_pi/ directory")
    else:
        print("\n❌ Setup failed. Please check errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
