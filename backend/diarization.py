"""Placeholder diarization utilities."""

from __future__ import annotations

import itertools
from typing import Iterator


def speaker_id_sequence(prefix: str = "speaker") -> Iterator[str]:
    for idx in itertools.cycle(range(1, 5)):
        yield f"{prefix}_{idx}"


speaker_iter = speaker_id_sequence()


def next_speaker() -> str:
    return next(speaker_iter)


