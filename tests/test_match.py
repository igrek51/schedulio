from typing import Dict
from schedulio.api.schedule import schemas
from schedulio.api.schedule.match import find_match_most_participants
from schedulio.api.schedule.time import timestamp_to_datetime


def test_best_match_most_participants():

    min_date = timestamp_to_datetime(1654006601) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice'),
        schemas.Guest(id='2', name='Bob'),
        schemas.Guest(id='3', name='Charlie'),
    ]
    a_day = 24*3600
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        min_date: {
            '1': 'ok',
            '2': '',
            '3': '',
        },
        min_date + 1 * a_day: {
            '1': 'no',
            '2': '',
            '3': '',
        },
        min_date + 2 * a_day: {
            '1': '',
            '2': 'ok',
            '3': '12-20',
        },
        min_date + 3 * a_day: {
            '1': 'no',
            '2': '',
            '3': 'ok',
        },
        min_date + 4 * a_day: {
            '1': 'ok',
            '2': '19-20',
            '3': '18 - 22',
        },
        min_date + 5 * a_day: {
            '1': 'ok',
            '2': 'ok',
            '3': 'ok',
        },
    }

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map,
    )

    assert best_match
    assert best_match.day_timestamp == min_date + 4 * a_day
    assert best_match.start_time == '19'
    assert best_match.end_time == '20'
    assert best_match.min_guests == 3
    assert best_match.max_guests == 3
    assert best_match.total_guests == 3
    assert best_match.guest_votes == ['ok', '19-20', '18 - 22']
    assert best_match.guest_names == ['Alice', 'Bob', 'Charlie']
