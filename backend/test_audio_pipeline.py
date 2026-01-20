#!/usr/bin/env python3
"""
Test script to verify the audio processing pipeline
"""
import asyncio
import websockets
import json
import base64
import numpy as np
from pathlib import Path

async def test_audio_pipeline():
    uri = "ws://localhost:8000/ws/audio/test_room"

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to websocket")

            # Wait for connection confirmation
            response = await websocket.recv()
            data = json.loads(response)
            print(f"Connection response: {data}")

            # Generate enough test audio data to trigger processing (5+ seconds of 16kHz)
            sample_rate = 16000
            duration = 6  # seconds (need >5 seconds to trigger)
            samples = np.zeros(sample_rate * duration, dtype=np.int16)

            # Add some test audio (simple sine wave)
            t = np.linspace(0, duration, len(samples), False)
            frequency = 440  # A4 note
            samples = (np.sin(frequency * 2 * np.pi * t) * 10000).astype(np.int16)

            # Convert to base64
            audio_bytes = samples.tobytes()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')

            print(f"Sending {len(audio_bytes)} bytes of test audio")

            # Send audio data
            message = {
                "type": "audio",
                "data": base64_audio
            }

            await websocket.send(json.dumps(message))
            print("Audio chunk sent")

            # Wait for transcript response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                data = json.loads(response)
                print(f"Transcript response: {data}")

                if data.get("type") == "transcript":
                    print("Transcript received successfully!")
                    print(f"Text: {data['payload']['text']}")
                    print(f"Translation: {data['payload'].get('translation', 'None')}")
                else:
                    print(f"Unexpected response type: {data.get('type')}")

            except asyncio.TimeoutError:
                print("Timeout waiting for transcript response - checking database...")

                # Check if any transcripts were created in database
                import requests
                try:
                    resp = requests.get("http://localhost:8000/transcripts?room_id=test_room")
                    if resp.status_code == 200:
                        data = resp.json()
                        print(f"Database transcripts: {len(data['items'])} items")
                        for item in data['items']:
                            print(f"  - {item['text']} ({item['created_at']})")
                except Exception as e:
                    print(f"Could not check database: {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing audio processing pipeline...")
    asyncio.run(test_audio_pipeline())
