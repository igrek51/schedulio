from django.forms.models import model_to_dict

from schedulio.api.endpoint import schemas
from schedulio.djangoapp import models


def schedule_model_to_schema(model: models.Schedule) -> schemas.Schedule:
    return schemas.Schedule(
        id=model.id,
        title=model.title,
        description=model.description,
        create_time=model.create_time,
        options=model.options,
    )


def guest_model_to_schema(model: models.Guest) -> schemas.Guest:
    return schemas.Guest(
        id=model.id,
        schedule_id=model.schedule.id,
        name=model.name,
        create_time=model.create_time,
        last_update=model.last_update,
    )


def vote_model_to_schema(model: models.Vote) -> schemas.Vote:
    return schemas.Vote(
        guest_id=model.guest.id,
        day=model.day,
        answer=model.answer,
    )
