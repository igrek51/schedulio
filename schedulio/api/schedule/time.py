from datetime import datetime, timezone
import os

import pytz

local_timezone_name = os.environ.get('TIME_ZONE', 'Europe/Warsaw')
local_tz = pytz.timezone(local_timezone_name)


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


def datetime_to_str(dt: datetime) -> str:
    """Convert datetime to ISO 8601 format"""
    return dt.strftime('%Y-%m-%dT%H:%M:%S%z')


def utc_today_timestamp() -> int:
    """Rounded timestamp of start of the today's day in seconds"""
    utc_now_time = now()
    today_date = datetime(utc_now_time.year, utc_now_time.month, utc_now_time.day, tzinfo=pytz.UTC)
    return datetime_to_timestamp(today_date)


def local_today_timestamp(now_provider = now) -> int:
    now_utc = now_provider()
    now_local = now_utc.astimezone(tz=local_tz)
    local_today_date = datetime(now_local.year, now_local.month, now_local.day, tzinfo=pytz.UTC)
    return datetime_to_timestamp(local_today_date)


def round_timestamp_to_day(timestamp: int) -> int:
    """Rounded timestamp of start of the day in seconds"""
    date = timestamp_to_datetime(timestamp)
    rounded_date = datetime(date.year, date.month, date.day, tzinfo=pytz.UTC)
    return datetime_to_timestamp(rounded_date)
