#!/usr/bin/env python3

import os
import sys

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Set environment variable for model directory
os.environ.setdefault('MODEL_DIR', r'D:\AI_MODELS')

# Import and run the app
from main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
