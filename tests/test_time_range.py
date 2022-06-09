from datetime import time

import pytz

from schedulio.api.schedule.options import parse_duration
from schedulio.api.schedule.time_range import TimeRange, add_time


def test_add_time():
    t = time(hour=20, minute=56, tzinfo=pytz.UTC)
    delta = parse_duration('1h12m')
    t2 = add_time(t, delta)
    assert t2.hour == 22
    assert t2.minute == 8


def test_add_time_overflow():
    t = time(hour=23, minute=0, tzinfo=pytz.UTC)
    delta = parse_duration('2h')
    t2 = add_time(t, delta)
    assert t2.hour == 23
    assert t2.minute == 59


def test_duration():
    delta = TimeRange(
        start_time=time(hour=20, minute=56, tzinfo=pytz.UTC),
        end_time=time(hour=22, minute=8, tzinfo=pytz.UTC),
    )
    assert delta.duration == 4 + 60 + 8
