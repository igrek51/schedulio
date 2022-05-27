from datetime import datetime, timedelta
from typing import Iterable, List, Tuple

from schedulio.api.schedule import schemas
from schedulio.api.schedule.time import datetime_to_timestamp, timestamp_to_datetime

days_of_week_names = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
}


def get_more_votes(after_day: int) -> schemas.DayVotesBatch:
    min_date = timestamp_to_datetime(after_day) + timedelta(days=1)
    max_date = min_date + timedelta(days=6)
    day_votes: List[schemas.DayVotes] = []
    for day_index, day_date in days_range(min_date=min_date, max_date=max_date):

        day_of_week = (day_date.weekday() + 1) % 7
        day_name = days_of_week_names[day_of_week] + day_date.strftime(' %Y-%m-%d')

        day_votes.append(schemas.DayVotes(
            day_index=day_index,
            day_name=day_name,
            day_of_week=day_of_week,
            guest_votes={},
        ))

    return schemas.DayVotesBatch(day_votes=day_votes)


def days_range(
    min_timestamp: int = None, 
    max_timestamp: int = None,
    min_date: datetime = None,
    max_date: datetime = None,
) -> Iterable[Tuple[int, datetime]]:
    if min_timestamp:
        current_date = timestamp_to_datetime(min_timestamp)
    else:
        current_date = min_date
    if max_timestamp:
        max_date = timestamp_to_datetime(max_timestamp)
    while current_date <= max_date:
        yield datetime_to_timestamp(current_date), current_date
        current_date += timedelta(days=1)
