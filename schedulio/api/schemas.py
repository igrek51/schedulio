from typing import List, Union

from pydantic import BaseModel


class Schedule(BaseModel):
    id: str
    title: Union[str, None] = None
    description: Union[str, None] = None

    class Config:
        orm_mode = True


class ScheduleCreate(BaseModel):
    title: Union[str, None] = None
    description: Union[str, None] = None
