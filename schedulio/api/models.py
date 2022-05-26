from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
