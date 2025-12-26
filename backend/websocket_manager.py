from fastapi import WebSocket
import asyncio, logging

logger = logging.getLogger("ws_manager")

class ConnectionManager:
    """Manages WebSocket connections grouped by topic/room."""
    def __init__(self):
        self.topics = {}
        self.lock = asyncio.Lock()

    async def connect(self, ws: WebSocket, topic="default"):
        await ws.accept()
        async with self.lock:
            self.topics.setdefault(topic, []).append(ws)
        logger.info(f"WS connected topic={topic}")

    async def disconnect(self, ws: WebSocket, topic="default"):
        async with self.lock:
            if topic in self.topics and ws in self.topics[topic]:
                self.topics[topic].remove(ws)
        logger.info(f"WS disconnected topic={topic}")

    async def broadcast(self, message: dict, topic="default"):
        """Send a JSON message to all clients in the given topic."""
        conns = self.topics.get(topic, [])[:]
        for c in conns:
            try:
                await c.send_json(message)
            except Exception:
                logger.exception("broadcast failed")


