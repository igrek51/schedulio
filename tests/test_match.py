from typing import Dict
from schedulio.api.schedule import schemas
from schedulio.api.schedule.match import find_match_most_participants, find_match_soonest_possible
from schedulio.api.schedule.options import default_schedule_options, parse_schedule_options_json
from schedulio.api.schedule.time import timestamp_to_datetime

a_day = 24*3600


def test_best_match_most_participants():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='3', name='Charlie', schedule_id='1', create_time=0, last_update=0),
    ]
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
    options = default_schedule_options()

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp + 4 * a_day
    assert best_match.start_time == '19:00'
    assert best_match.end_time == '20:00'
    assert best_match.min_guests == 3
    assert best_match.max_guests == 3
    assert best_match.total_guests == 3
    assert best_match.guest_votes == ['ok', '19-20', '18 - 22']
    assert best_match.all_guest_names == ['Alice', 'Bob', 'Charlie']
    assert best_match.guest_results == ['ok', 'ok', 'ok']


def test_best_match_is_empty_day():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
    ]
    a_day = 24*3600
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'no',
            '2': 'no',
        },
        today_timestamp + 1 * a_day: {
            '1': 'no',
            '2': 'no',
        },
    }
    options = parse_schedule_options_json('{"min_guests": 2, "min_duration": "2h 30m", "default_start_time": "20:00", "default_end_time": "23:20"}')

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp + 2 * a_day
    assert best_match.start_time == '20:00'
    assert best_match.end_time == '23:20'
    assert best_match.min_guests == 0
    assert best_match.max_guests == 2
    assert best_match.total_guests == 2
    assert best_match.guest_votes == ['', '']
    assert best_match.all_guest_names == ['Alice', 'Bob']
    assert best_match.guest_results == ['maybe', 'maybe']


def test_no_match_because_insufficient_guests():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
    ]
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'ok',
            '2': 'ok',
        },
    }
    options = parse_schedule_options_json('{"min_guests": 3}')

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match is None


def test_insufficient_duration_means_no():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(today_timestamp) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
    ]
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'ok',
            '2': '15-16',
        },
    }
    options = parse_schedule_options_json('{"min_duration": "2h"}')

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp
    assert best_match.start_time == '00:00'
    assert best_match.end_time == '23:59'
    assert best_match.min_guests == 1
    assert best_match.max_guests == 1
    assert best_match.total_guests == 2
    assert best_match.all_guest_names == ['Alice', 'Bob']
    assert best_match.guest_results == ['ok', 'no']


def test_best_match_soonest_possible():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp) # Tue 2022-05-31
    max_date = timestamp_to_datetime(1654525001) # Mon 2022-06-06
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='3', name='Charlie', schedule_id='1', create_time=0, last_update=0),
    ]
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'ok',
            '2': 'no',
            '3': 'no',
        },
        today_timestamp + 1 * a_day: {
            '1': 'ok',
            '2': '',
            '3': 'no',
        },
        today_timestamp + 2 * a_day: {
            '1': 'ok',
            '2': 'ok',
            '3': 'ok',
        },
    }
    options = default_schedule_options()
    options.min_guests = 2

    best_match: schemas.BestMatch = find_match_soonest_possible(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp + 1 * a_day
    assert best_match.start_time == '00:00'
    assert best_match.end_time == '23:59'
    assert best_match.min_guests == 1
    assert best_match.max_guests == 2
    assert best_match.total_guests == 3
    assert best_match.guest_votes == ['ok', '', 'no']
    assert best_match.all_guest_names == ['Alice', 'Bob', 'Charlie']
    assert best_match.guest_results == ['ok', 'maybe', 'no']


def test_most_participants_maximizing_upper_bound():

    today_timestamp = 1654006601
    min_date = timestamp_to_datetime(today_timestamp)
    max_date = timestamp_to_datetime(today_timestamp + 3 * a_day)
    guests = [
        schemas.Guest(id='1', name='Alice', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='2', name='Bob', schedule_id='1', create_time=0, last_update=0),
        schemas.Guest(id='3', name='Charlie', schedule_id='1', create_time=0, last_update=0),
    ]
    day_guest_vote_map: Dict[int, Dict[str, str]] = {
        today_timestamp: {
            '1': 'ok',
            '2': '',
            '3': 'no',
        },
        today_timestamp + 1 * a_day: {
            '1': 'no',
            '2': '',
            '3': 'ok',
        },
        today_timestamp + 2 * a_day: {
            '1': 'maybe',
            '2': '',
            '3': 'ok',
        },
    }
    options = default_schedule_options()

    best_match: schemas.BestMatch = find_match_most_participants(
        min_date, max_date, guests, day_guest_vote_map, options,
    )

    assert best_match
    assert best_match.day_timestamp == today_timestamp + 2 * a_day
    assert best_match.min_guests == 1
    assert best_match.max_guests == 3
    assert best_match.total_guests == 3
    assert best_match.guest_results == ['maybe', 'maybe', 'ok']
