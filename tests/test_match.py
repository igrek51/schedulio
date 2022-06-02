from typing import Dict
from schedulio.api.schedule import schemas
from schedulio.api.schedule.match import find_match_most_participants
from schedulio.api.schedule.time import timestamp_to_datetime, today_timestamp


def test_best_match_most_participants():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='3', name='Charlie', schedule_id='1', create_time=0, last_update=0),
    ]
    a_day = 24*3600
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'ok',
            '2': '',
            '3': '',
        },
        today_timestamp + 1 * a_day: {
            '1': 'no',
            '2': '',
            '3': '',
        },
        today_timestamp + 2 * a_day: {
            '1': '',
            '2': 'ok',
            '3': '12-20',
        },
        today_timestamp + 3 * a_day: {
            '1': 'no',
            '2': '',
            '3': 'ok',
        },
        today_timestamp + 4 * a_day: {
            '1': 'ok',
            '2': '19-20',
            '3': '18 - 22',
        },
        today_timestamp + 5 * a_day: {
            '1': 'ok',
            '2': 'ok',
            '3': 'ok',
        },
        today_timestamp + 6 * a_day: {
            '1': '12-24',
            '2': '15-24',
            '3': '14-16',
        },
    }

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp + 4 * a_day
    assert best_match.start_time == '19:00'
    assert best_match.end_time == '20:00'
    assert best_match.min_guests == 3
    assert best_match.max_guests == 3
    assert best_match.total_guests == 3
    assert best_match.guest_votes == ['ok', '19-20', '18 - 22']
    assert best_match.guest_names == ['Alice', 'Bob', 'Charlie']
