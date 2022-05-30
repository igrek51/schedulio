from datetime import timedelta
from typing import Dict, List
from collections import defaultdict

from nuclear.sublog import log

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, days_of_week_names
from schedulio.djangoapp import models
from schedulio.api.schedule.converters import (
    schedule_model_to_schema, vote_model_to_schema, votes_model_to_schema,
)
from schedulio.api.schedule.database import (
    create_or_update_vote, find_guest_by_id, 
    find_schedule_by_id, list_votes_by_guest, 
    list_votes_by_schedule, trim_old_votes, 
    update_guest_last_update,
)
from schedulio.api.schedule.time import round_timestamp_to_day, timestamp_to_datetime, today_timestamp

spare_schedule_days_num = 14


def get_schedule_schema(schedule_id: str):
    schedule_model = find_schedule_by_id(schedule_id)
    return schedule_model_to_schema(schedule_model)


def get_guest_votes(guest_id: str) -> List[schemas.Vote]:
    today = today_timestamp()
    trim_old_votes(today)

    guest_model = find_guest_by_id(guest_id)
    votes = list_votes_by_guest(guest_model)
    return votes_model_to_schema(votes)


def get_schedule_votes(schedule_id: str) -> schemas.DayVotesBatch:
    today = today_timestamp()
    trim_old_votes(today)

    schedule_model = find_schedule_by_id(schedule_id)
    votes: List[models.Vote] = list_votes_by_schedule(schedule_model)

    day_to_guest_to_vote = defaultdict(dict)

    max_day: int = today
    for vote in votes:
        day = vote.day
        guest_id = vote.guest.id
        vote_answer = vote.answer
        if day > max_day:
            max_day = day
        day_to_guest_to_vote[day][guest_id] = vote_answer
    max_date = timestamp_to_datetime(max_day) + timedelta(days=spare_schedule_days_num)
    
    day_votes: List[schemas.DayVotes] = []
    log.debug('today', today=today)
    for day_timestamp, day_date in days_range(min_timestamp=today, max_date=max_date):
        guest_votes: Dict[str, str] = {}
        for guest_id, vote_answer in day_to_guest_to_vote[day_timestamp].items():
            guest_votes[guest_id] = vote_answer

        day_of_week = (day_date.weekday() + 1) % 7
        day_name = days_of_week_names[day_of_week] + day_date.strftime(' %Y-%m-%d')

        day_votes.append(schemas.DayVotes(
            day_timestamp=day_timestamp,
            day_name=day_name,
            day_of_week=day_of_week,
            guest_votes=guest_votes,
        ))
    
    return schemas.DayVotesBatch(day_votes=day_votes)


def send_guest_vote(guest_id: str, vote: schemas.Vote) -> schemas.Vote:
    guest_model = find_guest_by_id(guest_id)
    day_timestamp = round_timestamp_to_day(vote.day)
    vote_model = create_or_update_vote(guest_model, day_timestamp, vote.answer)
    update_guest_last_update(guest_model)
    return vote_model_to_schema(vote_model)


def send_multiple_guest_votes(guest_id: str, votes: List[schemas.Vote]):
    guest_model = find_guest_by_id(guest_id)
    for vote in votes:
        day_timestamp = round_timestamp_to_day(vote.day)
        create_or_update_vote(guest_model, day_timestamp, vote.answer)
    update_guest_last_update(guest_model)
