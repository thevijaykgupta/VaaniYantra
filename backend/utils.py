import asyncio, logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)


def timestamp_now():
    """Current UTC time in ISO format."""
    return datetime.utcnow().isoformat() + "Z"


async def run_blocking(fn, *args, **kwargs):
    """Run a blocking function in a thread executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: fn(*args, **kwargs))


