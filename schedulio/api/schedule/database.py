from typing import List, Optional

from nuclear.sublog import log

from schedulio.api.errors import EntityNotFound
from schedulio.api.schedule import schemas
from schedulio.djangoapp import models
from schedulio.api.schedule.time import now_timestamp


def find_schedule_by_id(id: str) -> models.Schedule:
    try:
        return models.Schedule.objects.get(id=id)
    except models.Schedule.DoesNotExist:
        raise EntityNotFound(f'Schedule with id {id} was not found')


def create_new_schedule(schedule: schemas.ScheduleCreate) -> models.Schedule:
    new_model = models.Schedule(
        title=schedule.title,
        description=schedule.description,
    )
    new_model.save()
    return new_model


def update_schedule(
    schedule: models.Schedule, 
    title: str,
    description: Optional[str],
    options: Optional[str],
):
    schedule.title = title
    schedule.description = description
    schedule.options = options
    schedule.save()


def list_guests_by_schedule(schedule: models.Schedule) -> List[models.Guest]:
    return list(models.Guest.objects.filter(schedule=schedule))


def find_guest_by_id(id: str) -> models.Guest:
    try:
        return models.Guest.objects.get(id=id)
    except models.Guest.DoesNotExist:
        raise EntityNotFound(f'Guest with id {id} was not found')


def create_new_guest(schedule: models.Schedule, guest: schemas.GuestCreate) -> models.Guest:
    new_model = models.Guest(
        schedule=schedule,
        name=guest.name,
    )
    new_model.save()
    return new_model


def update_guest(guest: models.Guest, name: str):
    guest.name = name
    guest.save()


def update_guest_last_update(guest: models.Guest):
    guest.last_update = now_timestamp()
    guest.save()


def find_vote_by_id(id: str) -> models.Vote:
    try:
        return models.Vote.objects.get(id=id)
    except models.Vote.DoesNotExist:
        raise EntityNotFound(f'Vote with id {id} was not found')


def list_votes_by_schedule(schedule: models.Schedule) -> List[models.Vote]:
    return list(models.Vote.objects.filter(schedule=schedule))


def list_votes_by_guest(guest: models.Guest) -> List[models.Vote]:
    return list(models.Vote.objects.filter(guest=guest))


def get_guest_vote_by_day(guest: models.Guest, day: int) -> models.Vote:
    try:
        return models.Vote.objects.get(guest=guest, day=day)
    except models.Vote.DoesNotExist:
        raise EntityNotFound(f'Vote for guest {guest}, day {day} was not found')


def create_or_update_vote(guest: models.Guest, day: int, answer: str) -> models.Vote:
    try:
        vote = models.Vote.objects.get(guest=guest, day=day)
        vote.answer = answer
        vote.save()
        return vote
    except models.Vote.DoesNotExist:
        new_vote = models.Vote(
            guest=guest,
            schedule=guest.schedule,
            day=day,
            answer=answer,
        )
        new_vote.save()
        return new_vote


def trim_old_votes(older_than: int) -> models.Vote:
    queryset = models.Vote.objects.filter(day__lt=older_than)
    deleted_rows = queryset.delete()[0]
    if deleted_rows:
        log.debug(f'Old votes trimmed', deleted_rows=deleted_rows, today_timestamp=older_than)
