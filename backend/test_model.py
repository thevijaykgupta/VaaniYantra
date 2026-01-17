#!/usr/bin/env python3
"""
Standalone test script for VaaniYantra model functionality
Tests the complete audio → whisper → translation pipeline
"""

import sys
import os
import logging

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_model():
    """Test the complete ASR + Translation pipeline"""

    print("Testing VaaniYantra Model Functionality")
    print("=" * 50)

    try:
        # Import required modules
        from faster_whisper import WhisperModel
        from translation_engine import Translator

        print("Imports successful")

        # Initialize models
        print("Loading models...")
        whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        translator = Translator()

        print("Models loaded successfully")

        # Check for test audio file
        test_audio_path = "test.wav"
        if not os.path.exists(test_audio_path):
            print(f"Test audio file '{test_audio_path}' not found")
            return False

        file_size = os.path.getsize(test_audio_path)
        print(f"Test audio file found: {file_size} bytes")

        # Transcribe audio
        print("Starting transcription...")
        segments, info = whisper_model.transcribe(
            test_audio_path,
            language="en",
            beam_size=5,
            patience=1,
        )

        # Process results
        results = []
        for segment in segments:
            text = segment.text.strip()
            if text:
                print(f"Segment: {text}")

                # Translate
                translation = translator.translate(text)
                print(f"Translation: {translation}")

                results.append({
                    "original_text": text,
                    "translated_text": translation,
                    "start_time": segment.start,
                    "end_time": segment.end,
                    "confidence": getattr(segment, 'confidence', 0.8)
                })

        print("\n" + "=" * 50)
        print("MODEL TEST COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print(f"Total segments detected: {len(list(segments))}")
        print(f"Successfully transcribed: {len(results)}")
        print(f"Detected language: {info.language}")
        print(f"Processing time: {info.transcription_time:.2f}s")

        if results:
            print("\nDETAILED RESULTS:")
            for i, result in enumerate(results, 1):
                print(f"\n--- Segment {i} ---")
                print(f"Original: {result['original_text']}")
                print(f"Translated: {result['translated_text']}")
                print(f"Time: {result['start_time']:.2f}s - {result['end_time']:.2f}s")
                print(f"Confidence: {result['confidence']:.1%}")

        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure to run: pip install faster-whisper")
        return False

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model()
    sys.exit(0 if success else 1)
