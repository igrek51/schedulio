from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from schedulio.api.database import SessionLocal
from schedulio.api import crud
from schedulio.api import schemas


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def get_status():
        return {'status': 'ok'}


    @app.post("/schedule/", response_model=schemas.Schedule)
    def create_schedule(schedule: schemas.ScheduleCreate, db: Session = Depends(get_db)):
        return crud.create_schedule(db=db, schedule=schedule)

    @app.get("/schedule/{schedule_id}", response_model=schemas.Schedule)
    def read_schedule(schedule_id: str, db: Session = Depends(get_db)):
        db_model = crud.get_schedule(db, schedule_id=schedule_id)
        if db_model is None:
            raise HTTPException(status_code=404, detail="Schedule not found")
        return db_model
