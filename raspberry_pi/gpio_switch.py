import logging
import threading
import time

try:
    import RPi.GPIO as GPIO
except ImportError:  # pragma: no cover - not available on dev machine
    GPIO = None

logger = logging.getLogger("gpio_switch")

PIN = 18


def monitor(callback):
    if GPIO is None:
        logger.warning("GPIO not available, skipping hardware switch")
        return
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def loop():
        logger.info("GPIO switch monitor running")
        while True:
            if GPIO.input(PIN) == GPIO.LOW:
                callback()
                time.sleep(2)
            time.sleep(0.1)

    thread = threading.Thread(target=loop, daemon=True)
    thread.start()


