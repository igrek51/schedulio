import json
from datetime import time, timedelta

from pydantic import BaseModel

from schedulio.api.schedule.duration import Duration
from schedulio.api.schedule.time_range import parse_time


class ScheduleOptionsJson(BaseModel):
    min_guests: int = 1
    min_duration: str = '0h'
    default_start_time: str = '00:00'
    default_end_time: str = '23:59'


class ScheduleOptions(BaseModel):
    min_guests: int
    min_duration_delta: timedelta
    default_start_time: time
    default_end_time: time


def parse_schedule_options_json(options_json_str: str) -> ScheduleOptions:
    if options_json_str:
        options_dict = json.loads(options_json_str)
        options = ScheduleOptionsJson.parse_obj(options_dict)
    else:
        options = ScheduleOptionsJson()
    return _parse_schedule_options(options)


def _parse_schedule_options(options: ScheduleOptionsJson) -> ScheduleOptions:
    min_guests = options.min_guests
    assert min_guests >= 0, 'min_guests must be >= 0'

    min_duration = options.min_duration
    min_duration_delta = _parse_duration(min_duration)

    default_start_time_str = options.default_start_time
    default_start_time = parse_time(default_start_time_str)

    default_end_time_str = options.default_end_time
    default_end_time = parse_time(default_end_time_str)

    return ScheduleOptions(
        min_guests=min_guests,
        min_duration_delta=min_duration_delta,
        default_start_time=default_start_time,
        default_end_time=default_end_time,
    )


def default_schedule_options() -> ScheduleOptions:
    return _parse_schedule_options(ScheduleOptionsJson())


def _parse_duration(duration_str: str) -> timedelta:
    if not duration_str:
        return timedelta(seconds=0)

    duration = Duration(duration_str)
    return duration.tdelta
