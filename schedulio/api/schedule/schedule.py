from typing import Dict, List, Tuple
from collections import defaultdict

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, days_of_week_names
from schedulio.djangoapp import models
from schedulio.api.schedule.converters import (
    guest_model_to_schema, guests_model_to_schema, schedule_model_to_schema, 
    vote_model_to_schema, votes_model_to_schema,
)
from schedulio.api.schedule.database import (
    create_new_guest, create_new_schedule, create_or_update_vote, find_guest_by_id, 
    find_schedule_by_id, list_guests_by_schedule, list_votes_by_guest, 
    list_votes_by_schedule, trim_old_votes, update_guest, 
    update_guest_last_update, update_schedule,
)
from schedulio.djangoapp.time import datetime_to_timestamp, round_timestamp_to_day, timestamp_to_datetime, today_timestamp


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
    
    day_votes: List[schemas.DayVotes] = []
    for day_index, day_date in days_range(min_timestamp=today, max_timestamp=max_day):
        guest_votes: Dict[str, str] = {}
        for guest_id, vote_answer in day_to_guest_to_vote[day_index].items():
            guest_votes[guest_id] = vote_answer

        day_of_week = (day_date.weekday() + 1) % 7
        day_name = days_of_week_names[day_of_week] + day_date.strftime(' %Y-%m-%d')

        day_votes.append(schemas.DayVotes(
            day_index=day_index,
            day_name=day_name,
            day_of_week=day_of_week,
            guest_votes=guest_votes,
        ))
    
    return schemas.DayVotesBatch(day_votes=day_votes)


def send_guest_vote(guest_id: str, vote: schemas.Vote) -> schemas.Vote:
    guest_model = find_guest_by_id(guest_id)
    day_index = round_timestamp_to_day(vote.day)
    vote_model = create_or_update_vote(guest_model, day_index, vote.answer)
    update_guest_last_update(guest_model)
    return vote_model_to_schema(vote_model)


def send_multiple_guest_votes(guest_id: str, votes: List[schemas.Vote]):
    guest_model = find_guest_by_id(guest_id)
    day_index = round_timestamp_to_day(vote.day)
    for vote in votes:
        create_or_update_vote(guest_model, day_index, vote.answer)
    update_guest_last_update(guest_model)
