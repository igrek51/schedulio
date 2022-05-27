from typing import List
from schedulio.api.schedule import schemas
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
        day=model.day,
        answer=model.answer,
    )


def guests_model_to_schema(models: List[models.Guest]) -> List[schemas.Guest]:
    return [guest_model_to_schema(model) for model in models]


def votes_model_to_schema(models: List[models.Vote]) -> List[schemas.Vote]:
    return [vote_model_to_schema(model) for model in models]
