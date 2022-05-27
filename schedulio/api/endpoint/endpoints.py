from typing import List
from fastapi import FastAPI

from schedulio.api.endpoint import schemas
from schedulio.api.endpoint.converters import (
    guest_model_to_schema, guests_model_to_schema, schedule_model_to_schema, vote_model_to_schema, 
    votes_model_to_schema,
)
from schedulio.api.endpoint.database import (
    create_new_guest, create_new_schedule, create_or_update_vote, find_guest_by_id, find_schedule_by_id, 
    list_guests_by_schedule, list_votes_by_guest, update_guest, update_guest_last_update, update_schedule,
)


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def get_status():
        return {'status': 'ok'}


    @app.post("/api/schedule", response_model=schemas.Schedule)
    def create_schedule(schedule: schemas.ScheduleCreate):
        schedule_model = create_new_schedule(schedule)
        return schedule_model_to_schema(schedule_model)

    @app.get("/api/schedule/{schedule_id}", response_model=schemas.Schedule)
    def get_schedule(schedule_id: str):
        schedule_model = find_schedule_by_id(schedule_id)
        return schedule_model_to_schema(schedule_model)

    @app.put("/api/schedule/{schedule_id}", response_model=schemas.Schedule)
    def _update_schedule(schedule_id: str, schedule: schemas.Schedule):
        schedule_model = find_schedule_by_id(schedule_id)
        update_schedule(schedule_model, schedule.title, schedule.description, schedule.options)
        return schedule_model_to_schema(schedule_model)


    @app.get("/api/schedule/{schedule_id}/guest", response_model=List[schemas.Guest])
    def list_schedule_guests(schedule_id: str):
        guest_models = list_guests_by_schedule(schedule_id)
        return guests_model_to_schema(guest_models)

    @app.post("/api/schedule/{schedule_id}/guest", response_model=schemas.Guest)
    def create_guest(schedule_id: str, guest: schemas.GuestCreate):
        schedule_model = find_schedule_by_id(schedule_id)
        guest_model = create_new_guest(schedule_model, guest)
        return guest_model_to_schema(guest_model)

    @app.get("/api/guest/{guest_id}", response_model=schemas.Guest)
    def get_guest(guest_id: str):
        guest_model = find_guest_by_id(guest_id)
        return guest_model_to_schema(guest_model)

    @app.put("/api/guest/{guest_id}", response_model=schemas.Guest)
    def _update_guest(guest_id: str, guest: schemas.GuestUpdate):
        guest_model = find_guest_by_id(guest_id)
        update_guest(guest_model, guest.name)
        return guest_model_to_schema(guest_model)


    @app.get("/api/guest/{guest_id}/vote", response_model=List[schemas.Vote])
    def get_guest_votes(guest_id: str):
        guest_model = find_guest_by_id(guest_id)
        votes = list_votes_by_guest(guest_model)
        return votes_model_to_schema(votes)

    @app.post("/api/guest/{guest_id}/vote", response_model=schemas.Vote)
    def send_guest_vote(guest_id: str, vote: schemas.VoteUpdate):
        guest_model = find_guest_by_id(guest_id)
        vote_model = create_or_update_vote(guest_model, vote.day, vote.answer)
        update_guest_last_update(guest_model)
        return vote_model_to_schema(vote_model)

    @app.post("/api/guest/{guest_id}/votes")
    def send_guest_votes(guest_id: str, votes: List[schemas.VoteUpdate]):
        guest_model = find_guest_by_id(guest_id)
        for vote in votes:
            create_or_update_vote(guest_model, vote.day, vote.answer)
        update_guest_last_update(guest_model)
