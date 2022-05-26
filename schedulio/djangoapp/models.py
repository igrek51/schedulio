import uuid

from django.db import models

from .time import now


def new_uuid() -> str:
    return uuid.uuid4().hex


class Schedule(models.Model):

    id = models.CharField(max_length=36, primary_key=True, default=new_uuid)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=1024, null=True, blank=True)
    create_time = models.DateTimeField(default=now)

    def __str__(self):
        return self.id
