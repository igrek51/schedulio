from datetime import datetime, time
import re
from typing import Callable, Dict, List, Optional
from pydantic import BaseModel
import pytz

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, get_day_name


def find_match_most_participants(
    min_date: datetime, max_date: datetime, 
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
) -> Optional[schemas.BestMatch]:

    def _match_condition(match: schemas.BestMatch) -> bool:
        return match.max_guests >= 1

    def _match_score(match: schemas.BestMatch) -> float:
        return match.min_guests

    best_match: schemas.BestMatch = _find_best_match(
        min_date, max_date, guests, day_guest_vote_map,
        _match_condition, _match_score, 'most_participants',
    )
    return best_match


class TimeMatch(BaseModel):
    min_guests: int  # confirmed participants
    max_guests: int  # potential participants
    start_time: time
    end_time: time
    guest_votes_ordered: List[str] = []


class TimeRange(BaseModel):
    start_time: time
    end_time: time

    def is_within(self, t: time) -> bool:
        return self.start_time <= t <= self.end_time


def _find_best_match(
    min_date: datetime,
    max_date: datetime,
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
    match_condition: Callable[[schemas.BestMatch], bool],
    match_score: Callable[[schemas.BestMatch], float],
    algorithm: str,
) -> Optional[schemas.BestMatch]:
    guest_ids = [guest.id for guest in guests]
    guest_names = [guest.name for guest in guests]

    best_match: schemas.BestMatch = None
    best_score = 0

    for day_timestamp, day_date in days_range(min_date=min_date, max_date=max_date):

        guest_votes: Dict[str, str] = day_guest_vote_map[day_timestamp]
        time_match = _find_best_time_match(guest_votes, guest_ids)
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
) -> TimeMatch:
    certain_guests = 0
    uncertain_guests = 0
    rejected_guests = 0

    conditional_votes: List[TimeRange] = []

    for guest_id in guest_ids:
        answer = guest_votes.get(guest_id)
        if answer is None or answer == '':
            answer = ''
            uncertain_guests += 1
        elif answer == 'ok':
            certain_guests += 1
        elif answer == 'no':
            rejected_guests += 1
        else:
            time_range = _parse_time_range(answer)
            conditional_votes.append(time_range)
        guest_votes[guest_id] = answer

    conditional_match = _count_conditional_votes(conditional_votes)
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
) -> TimeMatch:
    guest_count = 0
    start_time: time = time(hour=0, minute=0, tzinfo=pytz.UTC)
    end_time: time = time(hour=23, minute=59, tzinfo=pytz.UTC)

    if not conditional_votes:
        return TimeMatch(
            min_guests=guest_count,
            max_guests=guest_count,
            start_time=start_time,
            end_time=end_time,
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

    conditional_votes = sorted(conditional_votes, key=lambda x: x.start_time)
    start_time_candidates = [vote.start_time for vote in conditional_votes]
    for start_time_candidate in start_time_candidates:

        matching = [vote for vote in conditional_votes if vote.is_within(start_time_candidate)]
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


def _parse_time_range(string: str) -> TimeRange:
    string = string.strip()

    match = re.fullmatch(r'(\S+) *- *(\S+)', string)
    if match:
        start = match.group(1)
        end = match.group(2)
        start_time = _parse_time(start)
        end_time = _parse_time(end)
        return TimeRange(
            start_time=start_time,
            end_time=end_time,
        )

    match = re.fullmatch(r'(\S+) *(\+|\-)', string)
    if match:
        start = match.group(1)
        start_time = _parse_time(start)
        return TimeRange(
            start_time=start_time,
            end_time=time(hour=23, minute=59, tzinfo=pytz.UTC),
        )

    raise ValueError(f'Invalid time range format: {string}')


def _parse_time(stime: str) -> time:
    match = re.fullmatch(r'(\d+):(\d+)', stime)
    if match:
        hour = int(match.group(1))
        assert 0 <= hour <= 24, 'hour should be between 0-24'
        minute = int(match.group(2))
        assert 0 <= minute <= 59, 'hour should be between 0-59'
        if hour == 24:
            assert minute == 0, "can't be more than 24:00"
            hour = 23
            minute = 59
        return time(hour=hour, minute=minute, tzinfo=pytz.UTC)

    match = re.fullmatch(r'(\d+)', stime)
    if match:
        hour = int(match.group(1))
        assert 0 <= hour <= 24, 'hour should be between 0-24'
        minute = 0
        if hour == 24:
            hour = 23
            minute = 59
        return time(hour=hour, minute=minute, tzinfo=pytz.UTC)

    raise ValueError(f'Invalid time format: {stime}')
