from fastapi import WebSocket
import asyncio
import logging
import json

logger = logging.getLogger("ws_manager")


class ConnectionManager:
    def __init__(self):
        self.active = {}  # topic -> websocket
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket, topic="default"):
        await ws.accept()
        async with self.lock:
            if topic in self.active:
                try:
                    await self.active[topic].close(code=1000)
                except:
                    pass
            self.active[topic] = ws
        logger.info(f"WS connected topic={topic}")

    async def disconnect(self, ws: WebSocket, topic="default"):
        async with self.lock:
            if self.active.get(topic) is ws:
                del self.active[topic]
        logger.info(f"WS disconnected topic={topic}")

    def has_clients(self, topic="default"):
        return topic in self.active

    async def broadcast(self, message: dict, topic="default"):
        async with self.lock:
            ws = self.active.get(topic)

        if not ws:
            return  # ✅ NO SOCKET → NO SEND

        try:
            safe = json.dumps(message, default=str, ensure_ascii=False)
            await ws.send_text(safe)
        except Exception:
            await self.disconnect(ws, topic)