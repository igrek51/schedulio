from typing import List
from fastapi import FastAPI

from schedulio.api.schedule import schemas
from schedulio.api.schedule.converters import (
    guest_model_to_schema, 
    guests_model_to_schema, 
    schedule_model_to_schema, 
)
from schedulio.api.schedule.database import (
    create_new_guest, 
    create_new_schedule, 
    delete_guest, 
    delete_schedule, 
    find_guest_by_id, 
    find_schedule_by_path_id, 
    list_guests_by_schedule, 
    update_guest, 
    update_schedule,
)
from schedulio.api.schedule.schedule import (
    find_schedule_match_soonest_possible,
    get_guest_votes, 
    get_schedule_schema, 
    get_schedule_votes, 
    send_guest_vote, 
    send_multiple_guest_votes, 
    find_schedule_match_most_participants,
)
from schedulio.api.metrics import (
    metric_created_schedules,
    metric_created_guests,
)
from schedulio.api.schedule.calendar import get_more_votes


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def _get_server_status():
        return {'status': 'ok'}


    @app.post("/api/schedule", response_model=schemas.Schedule)
    def _create_schedule(schedule: schemas.ScheduleCreate):
        schedule_model = create_new_schedule(schedule)
        metric_created_schedules.inc()
        return schedule_model_to_schema(schedule_model)

    @app.get("/api/schedule/{schedule_id}", response_model=schemas.Schedule)
    def _get_schedule(schedule_id: str):
        return get_schedule_schema(schedule_id)

    @app.put("/api/schedule/{schedule_id}", response_model=schemas.Schedule)
    def _update_schedule(schedule_id: str, update: schemas.ScheduleUpdate):
        schedule_model = find_schedule_by_path_id(schedule_id)
        update_schedule(schedule_model, update)
        return schedule_model_to_schema(schedule_model)

    @app.delete("/api/schedule/{schedule_id}")
    def _delete_schedule(schedule_id: str):
        schedule_model = find_schedule_by_path_id(schedule_id)
        delete_schedule(schedule_model)


    @app.get("/api/schedule/{schedule_id}/guest", response_model=List[schemas.Guest])
    def _list_schedule_guests(schedule_id: str):
        schedule_model = find_schedule_by_path_id(schedule_id)
        guest_models = list_guests_by_schedule(schedule_model)
        return guests_model_to_schema(guest_models)

    @app.post("/api/schedule/{schedule_id}/guest", response_model=schemas.Guest)
    def _create_guest(schedule_id: str, guest: schemas.GuestCreate):
        schedule_model = find_schedule_by_path_id(schedule_id)
        guest_model = create_new_guest(schedule_model, guest)
        metric_created_guests.inc()
        return guest_model_to_schema(guest_model)

    @app.get("/api/guest/{guest_id}", response_model=schemas.Guest)
    def _get_guest(guest_id: str):
        guest_model = find_guest_by_id(guest_id)
        return guest_model_to_schema(guest_model)

    @app.put("/api/guest/{guest_id}", response_model=schemas.Guest)
    def _update_guest(guest_id: str, guest: schemas.GuestUpdate):
        guest_model = find_guest_by_id(guest_id)
        update_guest(guest_model, guest.name)
        return guest_model_to_schema(guest_model)

    @app.delete("/api/guest/{guest_id}")
    def _delete_guest(guest_id: str):
        guest_model = find_guest_by_id(guest_id)
        delete_guest(guest_model)


    @app.get("/api/guest/{guest_id}/votes", response_model=List[schemas.Vote])
    def _get_guest_votes(guest_id: str):
        return get_guest_votes(guest_id)

    @app.post("/api/guest/{guest_id}/vote", response_model=schemas.Vote)
    def _send_guest_vote(guest_id: str, vote: schemas.Vote):
        return send_guest_vote(guest_id, vote)

    @app.post("/api/guest/{guest_id}/votes")
    def _send_multiple_guest_votes(guest_id: str, votes: List[schemas.Vote]):
        send_multiple_guest_votes(guest_id, votes)

    @app.get("/api/schedule/{schedule_id}/votes", response_model=schemas.DayVotesBatch)
    def _get_schedule_votes(schedule_id: str):
        return get_schedule_votes(schedule_id)

    @app.get("/api/schedule/{schedule_id}/votes/more/{after_day}", response_model=schemas.DayVotesBatch)
    def _get_more_schedule_votes(schedule_id: str, after_day: int):
        return get_more_votes(after_day)


    @app.get("/api/schedule/{schedule_id}/match/most_participants", response_model=schemas.BestMatch)
    def _find_best_match_most_participants(schedule_id: str):
        return find_schedule_match_most_participants(schedule_id)

    @app.get("/api/schedule/{schedule_id}/match/soonest_possible", response_model=schemas.BestMatch)
    def _find_best_match_soonest_possible(schedule_id: str):
        return find_schedule_match_soonest_possible(schedule_id)


    @app.get("/api/schedule/{schedule_id}/all", response_model=schemas.ScheduleAllInOne)
    def _get_all_schedule_data_at_once(schedule_id: str):
        schedule = get_schedule_schema(schedule_id)

        schedule_model = find_schedule_by_path_id(schedule_id)
        guest_models = list_guests_by_schedule(schedule_model)
        guests = guests_model_to_schema(guest_models)

        votes = get_schedule_votes(schedule_id)
        day_votes = votes.day_votes

        match_most_participants = find_schedule_match_most_participants(schedule_id)
        match_soonest_possible = find_schedule_match_soonest_possible(schedule_id)

        return schemas.ScheduleAllInOne(
            schedule=schedule,
            guests=guests,
            day_votes=day_votes,
            match_most_participants=match_most_participants,
            match_soonest_possible=match_soonest_possible,
        )
