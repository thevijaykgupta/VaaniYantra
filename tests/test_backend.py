from backend import config


def test_config_defaults():
    assert config.SAMPLE_RATE == 16000
    assert config.WHISPER_CHUNK_SEC > 0

