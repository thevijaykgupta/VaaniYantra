#!/usr/bin/env python3

import uvicorn
import sys
import os

# Set up the path properly
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    # Import after path setup
    import main
    uvicorn.run(main.app, host="0.0.0.0", port=8000, reload=False)
