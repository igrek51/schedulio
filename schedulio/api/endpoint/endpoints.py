from fastapi import FastAPI
from asgiref.sync import sync_to_async
from django.forms.models import model_to_dict

from schedulio.api.endpoint import schemas
from schedulio.api.endpoint.database import create_new_schedule, find_schedule_by_id
from schedulio.djangoapp import models
from schedulio.djangoapp.time import datetime_to_timestamp


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def get_status():
        return {'status': 'ok'}


    @app.post("/api/schedule", response_model=schemas.Schedule)
    async def create_schedule(schedule: schemas.ScheduleCreate):
        return await _create_schedule(schedule)

    @app.get("/api/schedule/{id}", response_model=schemas.Schedule)
    async def get_schedule(id: str):
        return await _get_schedule(id)


@sync_to_async
def _create_schedule(schedule: schemas.ScheduleCreate):
    model = create_new_schedule(schedule.title, schedule.description)
    model_dict = model_to_dict(model)
    model_dict['create_time'] = datetime_to_timestamp(model_dict['create_time'])
    return model_dict


@sync_to_async
def _get_schedule(id: str) -> models.Schedule:
    return find_schedule_by_id(id)
