#!/usr/bin/env python3

import uvicorn
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Import after path setup
    import main
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
