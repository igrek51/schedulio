from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, get_day_name
from schedulio.api.schedule.match import (
    parse_time_range,
    find_match_most_participants,
    find_match_soonest_possible,
)
from schedulio.api.schedule.options import parse_schedule_options_json
from schedulio.djangoapp import models
from schedulio.api.schedule.converters import (
    guests_model_to_schema, 
    schedule_model_to_schema, 
    vote_model_to_schema, 
    votes_model_to_schema,
)
from schedulio.api.schedule.database import (
    create_or_update_vote,
    find_guest_by_id,
    find_schedule_by_path_id,
    list_guests_by_schedule,
    list_votes_by_guest,
    list_votes_by_schedule,
    trim_old_votes_today,
    update_guest_last_update,
)
from schedulio.api.schedule.time import (
    local_today_timestamp,
    round_timestamp_to_day,
    timestamp_to_datetime,
)
from schedulio.api.metrics import (
    metric_sent_votes,
)

spare_schedule_days_num = 14


def get_schedule_schema(schedule_id: str):
    schedule_model = find_schedule_by_path_id(schedule_id)
    return schedule_model_to_schema(schedule_model)


def get_guest_votes(guest_id: str) -> List[schemas.Vote]:
    trim_old_votes_today()

    guest_model = find_guest_by_id(guest_id)
    votes = list_votes_by_guest(guest_model)
    return votes_model_to_schema(votes)


def get_schedule_votes(schedule_id: str) -> schemas.DayVotesBatch:
    trim_old_votes_today()

    schedule_model = find_schedule_by_path_id(schedule_id)
    votes: List[models.Vote] = list_votes_by_schedule(schedule_model)

    day_to_guest_to_vote: Dict[int, Dict[str, str]] = defaultdict(dict)

    min_timestamp: int = local_today_timestamp()
    max_timestamp: int = min_timestamp
    for vote in votes:
        day = vote.day
        guest_id = vote.guest.id
        vote_answer = vote.answer
        if day > max_timestamp:
            max_timestamp = day
        day_to_guest_to_vote[day][guest_id] = vote_answer
    max_date = timestamp_to_datetime(max_timestamp) + timedelta(days=spare_schedule_days_num)
    
    day_votes: List[schemas.DayVotes] = []
    for day_timestamp, day_date in days_range(min_timestamp=min_timestamp, max_date=max_date):
        guest_votes: Dict[str, str] = {}
        for guest_id, vote_answer in day_to_guest_to_vote[day_timestamp].items():
            guest_votes[guest_id] = vote_answer

        day_of_week = (day_date.weekday() + 1) % 7
        day_name = get_day_name(day_date)

        day_votes.append(schemas.DayVotes(
            day_timestamp=day_timestamp,
            day_name=day_name,
            day_of_week=day_of_week,
            guest_votes=guest_votes,
        ))
    
    return schemas.DayVotesBatch(day_votes=day_votes)


def send_guest_vote(guest_id: str, vote: schemas.Vote) -> Optional[schemas.Vote]:
    validate_answer(vote.answer)
    guest_model = find_guest_by_id(guest_id)
    day_timestamp = round_timestamp_to_day(vote.day)
    vote_model = create_or_update_vote(guest_model, day_timestamp, vote.answer)
    update_guest_last_update(guest_model)
    if vote_model is None:
        return None
    metric_sent_votes.inc()
    return vote_model_to_schema(vote_model)


def send_multiple_guest_votes(guest_id: str, votes: List[schemas.Vote]):
    for vote in votes:
        validate_answer(vote.answer)
    guest_model = find_guest_by_id(guest_id)
    for vote in votes:
        day_timestamp = round_timestamp_to_day(vote.day)
        create_or_update_vote(guest_model, day_timestamp, vote.answer)
    update_guest_last_update(guest_model)
    metric_sent_votes.inc(len(votes))


def validate_answer(answer: str):
    if answer in ('ok', 'no', 'maybe', ''):
        return
    try:
        parse_time_range(answer)
    except Exception as e:
        raise ValueError(f'Invalid answer: {e}') from e


def find_schedule_match_most_participants(schedule_id: str) -> Optional[schemas.BestMatch]:
    trim_old_votes_today()
    today: int = local_today_timestamp()

    schedule_model = find_schedule_by_path_id(schedule_id)
    votes: List[models.Vote] = list_votes_by_schedule(schedule_model)
    guests: List[schemas.Guest] = guests_model_to_schema(list_guests_by_schedule(schedule_model))
    options = parse_schedule_options_json(schedule_model.options)

    day_guest_vote_map, max_date = group_votes(votes, today)
    max_date = max_date + timedelta(days=1)
    min_date = timestamp_to_datetime(today)

    return find_match_most_participants(min_date, max_date, guests, day_guest_vote_map, options)


def find_schedule_match_soonest_possible(schedule_id: str) -> Optional[schemas.BestMatch]:
    trim_old_votes_today()
    today: int = local_today_timestamp()

    schedule_model = find_schedule_by_path_id(schedule_id)
    votes: List[models.Vote] = list_votes_by_schedule(schedule_model)
    guests: List[schemas.Guest] = guests_model_to_schema(list_guests_by_schedule(schedule_model))
    options = parse_schedule_options_json(schedule_model.options)

    day_guest_vote_map, max_date = group_votes(votes, today)
    max_date = max_date + timedelta(days=1)
    min_date = timestamp_to_datetime(today)

    return find_match_soonest_possible(min_date, max_date, guests, day_guest_vote_map, options)


def group_votes(votes: List[models.Vote], today: int) -> Tuple[Dict[int, Dict[str, str]], datetime]:
    day_guest_vote_map: Dict[int, Dict[str, str]] = defaultdict(dict)
    max_timestamp: int = today
    for vote in votes:
        day_timestamp = vote.day
        guest_id = vote.guest.id
        vote_answer = vote.answer
        if day_timestamp > max_timestamp:
            max_timestamp = day_timestamp
        day_guest_vote_map[day_timestamp][guest_id] = vote_answer
    max_date = timestamp_to_datetime(max_timestamp)
    return day_guest_vote_map, max_date
