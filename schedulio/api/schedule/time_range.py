from datetime import time, timedelta
import re

import pytz

from pydantic import BaseModel


class TimeRange(BaseModel):
    start_time: time
    end_time: time

    def is_within(self, t: time) -> bool:
        return self.start_time <= t <= self.end_time


def parse_time_range(string: str) -> TimeRange:
    string = string.strip()

    match = re.fullmatch(r'(\S+) *- *(\S+)', string)
    if match:
        start = match.group(1)
        end = match.group(2)
        start_time = parse_time(start)
        end_time = parse_time(end)
        return TimeRange(
            start_time=start_time,
            end_time=end_time,
        )

    match = re.fullmatch(r'(\S+) *(\+)', string)
    if match:
        start = match.group(1)
        start_time = parse_time(start)
        return TimeRange(
            start_time=start_time,
            end_time=time(hour=23, minute=59, tzinfo=pytz.UTC),
        )

    raise ValueError(f'Invalid time range format: "{string}"')


def parse_time(stime: str) -> time:
    match = re.fullmatch(r'(\d{1,2}):(\d{1,2})', stime)
    if match:
        hour = int(match.group(1))
        assert 0 <= hour <= 24, 'hour should be between 0-24'
        minute = int(match.group(2))
        assert 0 <= minute <= 59, 'hour should be between 0-59'
        if hour == 24:
            assert minute == 0, "can't be more than 24:00"
            hour = 23
            minute = 59
        return time(hour=hour, minute=minute, tzinfo=pytz.UTC)

    match = re.fullmatch(r'(\d{1,2})', stime)
    if match:
        hour = int(match.group(1))
        assert 0 <= hour <= 24, 'hour should be between 0-24'
        minute = 0
        if hour == 24:
            hour = 23
            minute = 59
        return time(hour=hour, minute=minute, tzinfo=pytz.UTC)

    raise ValueError(f'Invalid time format: {stime}')


def add_time(t: time, dt: timedelta) -> time:
    hours = t.hour + dt.seconds // 3600
    minutes = t.minute + (dt.seconds // 60) % 60
    hours += minutes // 60
    minutes = minutes % 60
    if hours >= 24:
        hours = 23
        minutes = 59
    return time(hour=int(hours), minute=int(minutes), tzinfo=pytz.UTC)
