from re import S
from typing import Union
from pydantic import BaseModel


class ScheduleCreate(BaseModel):
    title: str
    description: Union[str, None] = None


class Schedule(BaseModel):
    id: str
    title: str
    description: Union[str, None] = None
    create_time: int

    class Config:
        orm_mode = True
