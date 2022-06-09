from datetime import datetime, time
from typing import Callable, Dict, List, Optional
from pydantic import BaseModel

import pytz

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, get_day_name
from schedulio.api.schedule.options import ScheduleOptions
from schedulio.api.schedule.time_range import TimeRange, add_time, parse_time_range


def find_match_most_participants(
    min_date: datetime, max_date: datetime, 
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
    options: ScheduleOptions,
) -> Optional[schemas.BestMatch]:

    def _match_condition(match: schemas.BestMatch) -> bool:
        return match.max_guests >= options.min_guests

    def _match_score(match: schemas.BestMatch) -> float:
        return match.min_guests

    best_match = _find_best_match(
        min_date, max_date, guests, day_guest_vote_map,
        _match_condition, _match_score, 'most_participants', options,
    )
    return best_match


class TimeMatch(BaseModel):
    min_guests: int  # confirmed participants
    max_guests: int  # potential participants
    start_time: time
    end_time: time
    guest_votes_ordered: List[str] = []


def _find_best_match(
    min_date: datetime,
    max_date: datetime,
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
    match_condition: Callable[[schemas.BestMatch], bool],
    match_score: Callable[[schemas.BestMatch], float],
    algorithm: str,
    options: ScheduleOptions,
) -> Optional[schemas.BestMatch]:
    guest_ids = [guest.id for guest in guests]
    guest_names = [guest.name for guest in guests]

    best_match: Optional[schemas.BestMatch] = None
    best_score: float = 0

    for day_timestamp, day_date in days_range(min_date=min_date, max_date=max_date):

        guest_votes: Dict[str, str] = day_guest_vote_map.get(day_timestamp, {})
        time_match = _find_best_time_match(guest_votes, guest_ids, options)
        start_time = time_match.start_time.strftime("%H:%M")
        end_time = time_match.end_time.strftime("%H:%M")

        match = schemas.BestMatch(
            day_timestamp=day_timestamp,
            day_name=get_day_name(day_date),
            day_date=day_date,
            start_time=start_time,
            end_time=end_time,
            min_guests=time_match.min_guests,
            max_guests=time_match.max_guests,
            total_guests=len(guests),
            algorithm=algorithm,
            place=1,
            guest_votes=time_match.guest_votes_ordered,
            guest_names=guest_names,
        )

        if match_condition(match):
            score = match_score(match)
            if best_match is None or score > best_score:
                best_match = match
                best_score = score
    
    return best_match


def _find_best_time_match(
    guest_votes: Dict[str, str],
    guest_ids: List[str],
    options: ScheduleOptions,
) -> TimeMatch:
    certain_guests = 0
    uncertain_guests = 0
    rejected_guests = 0

    conditional_votes: List[TimeRange] = []

    for guest_id in guest_ids:
        answer = guest_votes.get(guest_id)
        if answer is None:
            answer = ''
            
        if answer == '':
            uncertain_guests += 1
        elif answer == 'maybe':
            uncertain_guests += 1
        elif answer == 'ok':
            certain_guests += 1
        elif answer == 'no':
            rejected_guests += 1
        else:
            time_range = parse_time_range(answer)
            conditional_votes.append(time_range)
        guest_votes[guest_id] = answer

    conditional_match = _count_conditional_votes(conditional_votes, options)
    min_guests = certain_guests + conditional_match.min_guests
    max_guests = certain_guests + uncertain_guests + conditional_match.max_guests

    return TimeMatch(
        min_guests=min_guests,
        max_guests=max_guests,
        start_time=conditional_match.start_time,
        end_time=conditional_match.end_time,
        guest_votes_ordered=[guest_votes[guest_id] for guest_id in guest_ids],
    )


def _count_conditional_votes(
    conditional_votes: List[TimeRange],
    options: ScheduleOptions,
) -> TimeMatch:

    if not conditional_votes:
        return TimeMatch(
            min_guests=0,
            max_guests=0,
            start_time=options.default_start_time,
            end_time=options.default_end_time,
        )
    
    if len(conditional_votes) == 1:
        start_time = conditional_votes[0].start_time
        end_time = conditional_votes[0].end_time
        guest_count = len(conditional_votes)
        return TimeMatch(
            min_guests=guest_count,
            max_guests=guest_count,
            start_time=start_time,
            end_time=end_time,
        )

    guest_count = 0
    start_time = time(hour=0, minute=0, tzinfo=pytz.UTC)
    end_time = time(hour=23, minute=59, tzinfo=pytz.UTC)

    conditional_votes = sorted(conditional_votes, key=lambda x: x.start_time)
    start_time_candidates = [vote_range.start_time for vote_range in conditional_votes]
    for start_time_candidate in start_time_candidates:

        end_time_candidate = add_time(start_time_candidate, options.min_duration_delta)

        matching = [vote for vote in conditional_votes if vote.is_within(start_time_candidate) and vote.is_within(end_time_candidate)]

        matching_count = len(matching)
        if matching_count > guest_count:
            guest_count = matching_count
            start_time = start_time_candidate

            end_times = [vote.end_time for vote in matching]
            end_time = min(end_times)

    return TimeMatch(
        min_guests=guest_count,
        max_guests=guest_count,
        start_time=start_time,
        end_time=end_time,
    )
