from fastapi import FastAPI

from schedulio.api.endpoint import schemas
from schedulio.api.endpoint.converters import schedule_model_to_schema
from schedulio.api.endpoint.database import create_new_schedule, find_schedule_by_id


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def get_status():
        return {'status': 'ok'}


    @app.post("/api/schedule", response_model=schemas.Schedule)
    def create_schedule(schedule: schemas.ScheduleCreate):
        model = create_new_schedule(schedule.title, schedule.description)
        return schedule_model_to_schema(model)

    @app.get("/api/schedule/{schedule_id}", response_model=schemas.Schedule)
    def get_schedule(schedule_id: str):
        model = find_schedule_by_id(schedule_id)
        return schedule_model_to_schema(model)
