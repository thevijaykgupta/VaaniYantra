#!/usr/bin/env python3
"""
VAANIYANTRA Requirements Checker
Verifies that all system requirements are met before installation.
"""

import sys
import platform
import subprocess
import os
from pathlib import Path

def check_python():
    """Check Python version and availability."""
    print("Checking Python...")
    try:
        version = sys.version_info
        if version.major == 3 and version.minor >= 10:
            print(f"[OK] Python {version.major}.{version.minor}.{version.micro}")
            return True
        else:
            print(f"[FAIL] Python {version.major}.{version.minor}.{version.micro} - Need Python 3.10+")
            return False
    except:
        print("[FAIL] Python not found")
        return False

def check_node():
    """Check Node.js version."""
    print("Checking Node.js...")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip().lstrip('v')
            major = int(version.split('.')[0])
            if major >= 18:
                print(f"[OK] Node.js {version}")
                return True
            else:
                print(f"[FAIL] Node.js {version} - Need Node.js 18+")
                return False
        else:
            print("[FAIL] Node.js not found")
            return False
    except FileNotFoundError:
        print("[FAIL] Node.js not found")
        return False

def check_git():
    """Check Git availability."""
    print("Checking Git...")
    try:
        result = subprocess.run(["git", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip().split()[-1]
            print(f"[OK] Git {version}")
            return True
        else:
            print("[FAIL] Git not found")
            return False
    except FileNotFoundError:
        print("[FAIL] Git not found")
        return False

def check_disk_space():
    """Check available disk space."""
    print("Checking disk space...")
    try:
        # Check current directory space
        stat = os.statvfs('.')
        free_gb = (stat.f_bavail * stat.f_frsize) / (1024**3)
        if free_gb >= 10:
            print(f"[OK] Disk space: {free_gb:.1f}GB free")
            return True
        else:
            print(f"[FAIL] Disk space: {free_gb:.1f}GB free - Need 10GB+")
            return False
    except:
        print("[WARN] Could not check disk space")
        return True

def check_ram():
    """Check available RAM."""
    print("Checking RAM...")
    try:
        if platform.system() == "Windows":
            # Windows memory check
            import psutil
            ram_gb = psutil.virtual_memory().total / (1024**3)
        else:
            # Linux/Unix memory check
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    if line.startswith('MemTotal:'):
                        ram_kb = int(line.split()[1])
                        ram_gb = ram_kb / (1024**2)
                        break

        if ram_gb >= 8:
            print(f"[OK] RAM: {ram_gb:.1f}GB")
            return True
        else:
            print(f"[FAIL] RAM: {ram_gb:.1f}GB - Need 8GB+")
            return False
    except:
        print("[WARN] Could not check RAM")
        return True

def check_model_dir():
    """Check if model directory exists and is writable."""
    print("Checking model directory...")
    model_dir = os.getenv('MODEL_DIR', 'D:\\AI_MODELS' if platform.system() == 'Windows' else os.path.expanduser('~/ai_models'))

    try:
        path = Path(model_dir)
        path.mkdir(parents=True, exist_ok=True)

        # Test write access
        test_file = path / 'test_write.tmp'
        test_file.write_text('test')
        test_file.unlink()

        print(f"[OK] Model directory: {model_dir}")
        return True
    except Exception as e:
        print(f"[FAIL] Model directory issue: {model_dir} - {e}")
        return False

def main():
    """Main check function."""
    print("VAANIYANTRA Requirements Check")
    print("=" * 50)

    checks = [
        check_python,
        check_node,
        check_git,
        check_disk_space,
        check_ram,
        check_model_dir,
    ]

    results = []
    for check in checks:
        results.append(check())
        print()

    passed = sum(results)
    total = len(results)

    print("=" * 50)
    print(f"Results: {passed}/{total} checks passed")

    if passed == total:
        print("All requirements met! Ready to install.")
        print("\nRun: python setup.py")
        return True
    else:
        print("Some requirements not met. Please fix issues above.")
        print("\nSee INSTALL.md for detailed setup instructions.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
