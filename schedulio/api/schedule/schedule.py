from datetime import timedelta
from typing import Dict, List
from collections import defaultdict

from nuclear.sublog import log

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, days_of_week_names, get_day_name
from schedulio.djangoapp import models
from schedulio.api.schedule.converters import (
    schedule_model_to_schema, vote_model_to_schema, votes_model_to_schema,
)
from schedulio.api.schedule.database import (
    create_or_update_vote, find_guest_by_id, 
    find_schedule_by_id, list_guests_by_schedule, list_votes_by_guest, 
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
    for day_timestamp, day_date in days_range(min_timestamp=today, max_date=max_date):
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


def find_best_match_most_participants(schedule_id: str) -> schemas.BestMatch:
    today = today_timestamp()
    trim_old_votes(today)

    schedule_model = find_schedule_by_id(schedule_id)
    guest_models: List[models.Guest] = list_guests_by_schedule(schedule_id)
    guest_ids = [guest.id for guest in guest_models]
    guest_names = [guest.name for guest in guest_models]
    votes: List[models.Vote] = list_votes_by_schedule(schedule_model)

    day_to_guest_to_vote = defaultdict(dict)
    max_day: int = today
    for vote in votes:
        day_timestamp = vote.day
        guest_id = vote.guest.id
        vote_answer = vote.answer
        if day_timestamp > max_day:
            max_day = day_timestamp
        day_to_guest_to_vote[day_timestamp][guest_id] = vote_answer
    max_date = timestamp_to_datetime(max_day) + timedelta(days=1)

    best_day: schemas.BestMatch = None
    current_max = 0
    required_guests = 1
    total_guests = len(guest_models)

    for day_timestamp, day_date in days_range(min_timestamp=today, max_date=max_date):

        confirmed_guests = 0
        potential_guests = 0

        guest_votes: Dict[str, str] = {}

        for guest_id in guest_ids:
            answer = day_to_guest_to_vote[day_timestamp].get(guest_id)
            if answer is None or answer == '':
                answer = ''
                potential_guests += 1
            elif answer == 'ok':
                confirmed_guests += 1
                potential_guests += 1
            elif answer == 'no':
                pass
            else:
                pass
                # todo parse hours
            guest_votes[guest_id] = answer

        guest_votes_ordered = [guest_votes[guest_id] for guest_id in guest_ids]

        if potential_guests >= required_guests:
            if best_day is None or confirmed_guests > current_max:
                current_max = confirmed_guests
                best_day = schemas.BestMatch(
                    day_timestamp=day_timestamp,
                    day_name=get_day_name(day_date),
                    start_time=None,
                    end_time=None,
                    min_guests=confirmed_guests,
                    max_guests=potential_guests,
                    total_guests=total_guests,
                    algorithm='most_participants',
                    place=1,
                    guest_votes=guest_votes_ordered,
                    guest_names=guest_names,
                )
    
    return best_day
