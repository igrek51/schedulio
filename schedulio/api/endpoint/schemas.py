from typing import List, Union
from pydantic import BaseModel


class ScheduleCreate(BaseModel):
    title: str
    description: Union[str, None] = None


class Schedule(BaseModel):
    id: str
    title: str
    description: Union[str, None] = None
    create_time: int
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
    guest_id: str
    day: int
    answer: str


class VoteUpdate(BaseModel):
    day: int
    answer: str
