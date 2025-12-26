import asyncio

from .audio_capture import PiAudioClient


def run():
    client = PiAudioClient()
    client.open()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(client.send_loop())


if __name__ == "__main__":
    run()


