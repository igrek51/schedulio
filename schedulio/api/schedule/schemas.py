from typing import Dict, List, Optional, Union
from pydantic import BaseModel


class ScheduleCreate(BaseModel):
    title: str
    path_id: Union[str, None] = None
    options: Union[str, None] = None
    description: Union[str, None] = None


class Schedule(BaseModel):
    id: str
    path_id: str
    title: str
    description: Union[str, None] = None
    create_time: int
    options: Union[str, None] = None


class ScheduleUpdate(BaseModel):
    path_id: Union[str, None] = None
    title: Union[str, None] = None
    description: Union[str, None] = None
    options: Union[str, None] = None


class GuestCreate(BaseModel):
    name: str


class Guest(BaseModel):
    id: str
    schedule_id: str
    name: str
    create_time: int
    last_update: int


class GuestUpdate(BaseModel):
    name: str


class Vote(BaseModel):
    day: int
    answer: str


class DayVotes(BaseModel):
    day_timestamp: int
    day_name: str
    day_of_week: int
    guest_votes: Dict[str, str]  # guest_id -> vote answer


class DayVotesBatch(BaseModel):
    day_votes: List[DayVotes]


class BestMatch(BaseModel):
    day_timestamp: int
    day_name: str
    start_time: Optional[str]
    end_time: Optional[str]
    min_guests: int  # confirmed participants
    max_guests: int  # potential participants
    total_guests: int
    guest_votes: List[str]
    all_guest_names: List[str]
    guest_results: List[str]
    algorithm: str
    place: Optional[int]


class ScheduleAllInOne(BaseModel):
    schedule: Schedule
    guests: List[Guest]
    day_votes: List[DayVotes]
    match_most_participants: BestMatch
    match_soonest_possible: BestMatch