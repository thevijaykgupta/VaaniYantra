import asyncio, base64, json, wave
import websockets

async def send_audio():
    uri = "ws://172.20.10.3:8000/ws/audio/classroom1"
    async with websockets.connect(uri) as ws:

        with wave.open("sample_audio/sample_short.wav", "rb") as wf:
            chunk_size = int(16000 * 5) # 5-second chunks
            while True:
                data = wf.readframes(chunk_size)
                if not data:
                    break
                # Send audio chunk
                await ws.send(json.dumps({
                    "type": "audio",
                    "data": base64.b64encode(data).decode('utf-8')
                }))
                await asyncio.sleep(0.1)
            # Signal end of stream
            await ws.send(json.dumps({"type": "end"}))

if __name__ == "__main__":
    asyncio.run(send_audio())

