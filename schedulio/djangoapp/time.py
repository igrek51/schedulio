from datetime import datetime, timezone

import pytz


def now() -> datetime:
    """Return current datetime with UTC timezone set"""
    return datetime.now(tz=pytz.UTC)


def datetime_to_timestamp(dt: datetime) -> int:
    """Convert datetime.datetime to integer timestamp in seconds"""
    return int(dt.timestamp())


def timestamp_to_datetime(timestamp: int) -> datetime:
    """Convert integer timestamp in seconds to datetime.datetime"""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)


def now_timestamp() -> int:
    return datetime_to_timestamp(now())


def today_timestamp() -> int:
    """Rounded timestamp of start of the today's day in seconds"""
    now_date = now()
    today_date = datetime(now_date.year, now_date.month, now_date.day)
    return datetime_to_timestamp(today_date)


def round_timestamp_to_day(timestamp: int) -> int:
    """Rounded timestamp of start of the day in seconds"""
    date = timestamp_to_datetime(timestamp)
    rounded_date = datetime(date.year, date.month, date.day)
    return datetime_to_timestamp(rounded_date)
