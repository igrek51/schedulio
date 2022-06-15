from datetime import datetime, time
from typing import Callable, Dict, List, Optional
from pydantic import BaseModel

import pytz

from schedulio.api.schedule import schemas
from schedulio.api.schedule.calendar import days_range, get_day_name
from schedulio.api.schedule.options import ScheduleOptions
from schedulio.api.schedule.time_range import TimeRange, add_time, parse_time_range


class ConditionalVote(BaseModel):
    guest_id: str
    time_range: TimeRange


class TimeMatch(BaseModel):
    min_guests: int  # confirmed participants
    max_guests: int  # potential participants
    start_time: time
    end_time: time
    guest_votes_ordered: List[str] = []
    guest_results_map: Dict[str, str] = {}  # guest id -> final result


class StopFurtherSearch(Exception):
    pass


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
        min_date, max_date, guests, day_guest_vote_map, 'most_participants', options,
        _match_condition, _match_score,
    )
    return best_match


def find_match_soonest_possible(
    min_date: datetime, max_date: datetime, 
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
    options: ScheduleOptions,
) -> Optional[schemas.BestMatch]:

    def _match_condition(match: schemas.BestMatch) -> bool:
        min_guests = options.min_guests or 1
        return match.max_guests >= min_guests

    def _match_score(match: schemas.BestMatch) -> float:
        return 0

    def _on_best_found(match: schemas.BestMatch) -> float:
        raise StopFurtherSearch()

    best_match = _find_best_match(
        min_date, max_date, guests, day_guest_vote_map, 'soonest_possible', options,
        _match_condition, _match_score, _on_best_found,
    )
    return best_match


def _find_best_match(
    min_date: datetime,
    max_date: datetime,
    guests: List[schemas.Guest],
    day_guest_vote_map: Dict[int, Dict[str, str]],
    algorithm: str,
    options: ScheduleOptions,
    match_condition: Callable[[schemas.BestMatch], bool],
    match_score: Callable[[schemas.BestMatch], float],
    on_best_found: Callable[[schemas.BestMatch], float] = None,
) -> Optional[schemas.BestMatch]:
    guest_ids = [guest.id for guest in guests]
    all_guest_names = [guest.name for guest in guests]

    best_match: Optional[schemas.BestMatch] = None
    best_score: float = 0

    try:
        for day_timestamp, day_date in days_range(min_date=min_date, max_date=max_date):

            guest_votes: Dict[str, str] = day_guest_vote_map.get(day_timestamp, {})
            time_match = _find_best_time_match(guest_votes, guest_ids, options)
            start_time = time_match.start_time.strftime("%H:%M")
            end_time = time_match.end_time.strftime("%H:%M")
            guest_results = [time_match.guest_results_map.get(guest_id) for guest_id in guest_ids]

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
                all_guest_names=all_guest_names,
                guest_results=guest_results,
            )

            if match_condition(match):
                score = match_score(match)
                if best_match is None or score > best_score:
                    best_match = match
                    best_score = score
                    if on_best_found is not None:
                        on_best_found(match)

    except StopFurtherSearch:
        pass
    
    return best_match


def _find_best_time_match(
    guest_votes: Dict[str, str],
    guest_ids: List[str],
    options: ScheduleOptions,
) -> TimeMatch:
    certain_guests = 0
    uncertain_guests = 0
    rejected_guests = 0
    conditional_votes: List[ConditionalVote] = []
    guest_results_map: Dict[str, str] = {}

    for guest_id in guest_ids:
        answer = guest_votes.get(guest_id)
        if answer is None:
            answer = ''
            
        if answer == '':
            uncertain_guests += 1
            guest_results_map[guest_id] = 'maybe'
        elif answer == 'maybe':
            uncertain_guests += 1
            guest_results_map[guest_id] = 'maybe'
        elif answer == 'ok':
            certain_guests += 1
            guest_results_map[guest_id] = 'ok'
        elif answer == 'no':
            rejected_guests += 1
            guest_results_map[guest_id] = 'no'
        else:
            time_range = parse_time_range(answer)
            condition_vote = ConditionalVote(guest_id=guest_id, time_range=time_range)
            conditional_votes.append(condition_vote)

        guest_votes[guest_id] = answer

    conditional_match: TimeMatch = _count_conditional_votes(conditional_votes, options)
    min_guests = certain_guests + conditional_match.min_guests
    max_guests = certain_guests + uncertain_guests + conditional_match.max_guests
    guest_results_map.update(conditional_match.guest_results_map)

    return TimeMatch(
        min_guests=min_guests,
        max_guests=max_guests,
        start_time=conditional_match.start_time,
        end_time=conditional_match.end_time,
        guest_votes_ordered=[guest_votes[guest_id] for guest_id in guest_ids],
        guest_results_map=guest_results_map,
    )


def _count_conditional_votes(
    conditional_votes: List[ConditionalVote],
    options: ScheduleOptions,
) -> TimeMatch:

    if not conditional_votes:
        return TimeMatch(
            min_guests=0,
            max_guests=0,
            start_time=options.default_start_time,
            end_time=options.default_end_time,
        )

    guest_count = 0
    start_time = time(hour=0, minute=0, tzinfo=pytz.UTC)
    end_time = time(hour=23, minute=59, tzinfo=pytz.UTC)
    guest_results_map: Dict[str, str] = {}
    best_matching_votes: List[ConditionalVote] = []

    conditional_votes = sorted(conditional_votes, key=lambda v: v.time_range.duration)
    start_time_candidates = [vote.time_range.start_time for vote in conditional_votes]
    for start_time_candidate in start_time_candidates:

        end_time_candidate = add_time(start_time_candidate, options.min_duration_delta)

        matching_votes = [vote for vote in conditional_votes
                          if vote.time_range.is_within(start_time_candidate)
                          and vote.time_range.is_within(end_time_candidate)]

        if len(matching_votes) > guest_count:
            guest_count = len(matching_votes)
            best_matching_votes = matching_votes
            start_time = start_time_candidate

            end_times = [vote.time_range.end_time for vote in matching_votes]
            end_time = min(end_times)

    for vote in conditional_votes:
        if vote in best_matching_votes:
            guest_results_map[vote.guest_id] = 'ok'
        else:
            guest_results_map[vote.guest_id] = 'no'

    return TimeMatch(
        min_guests=guest_count,
        max_guests=guest_count,
        start_time=start_time,
        end_time=end_time,
        guest_results_map=guest_results_map,
    )
