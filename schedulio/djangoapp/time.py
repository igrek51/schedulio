from datetime import datetime

import pytz


def now() -> datetime:
    """Return current datetime with UTC timezone set"""
    return datetime.now(tz=pytz.UTC)
