from datetime import datetime

import pytz
from schedulio.api.schedule.time import datetime_to_str, local_today_timestamp, now_timestamp, timestamp_to_datetime


def test_local_today_timestamp():
    assert local_today_timestamp() < now_timestamp()

    def now_provider():
        return datetime(2022, 6, 3, hour=22, minute=30, tzinfo=pytz.UTC)

    local_day_timestamp = local_today_timestamp(now_provider)
    assert local_day_timestamp == 1654300800  # Saturday, June 4, 2022 12:00:00 AM
    assert datetime_to_str(timestamp_to_datetime(local_day_timestamp)) == '2022-06-04T00:00:00+0000'


    def now_provider():
        return datetime(2022, 6, 5, hour=0, minute=30, tzinfo=pytz.UTC)

    local_day_timestamp = local_today_timestamp(now_provider)
    assert local_day_timestamp == 1654387200
    assert datetime_to_str(timestamp_to_datetime(local_day_timestamp)) == '2022-06-05T00:00:00+0000'
