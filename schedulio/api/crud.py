from typing import List
import uuid
from sqlalchemy.orm import Session

from . import models, schemas


def new_uuid() -> str:
    return uuid.uuid4().hex
    

def get_schedule(db: Session, schedule_id: int) -> models.Schedule:
    return db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()


def get_schedules(db: Session, skip: int = 0, limit: int = 100) -> List[models.Schedule]:
    return db.query(models.Schedule).offset(skip).limit(limit).all()


def create_schedule(db: Session, schedule: schemas.ScheduleCreate) -> models.Schedule:
    db_model = models.Schedule(
        id=new_uuid(),
        title=schedule.title,
        description=schedule.description,
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model
