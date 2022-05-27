import uuid

from django.db import models

from .time import now_timestamp


def new_uuid() -> str:
    return uuid.uuid4().hex


class Schedule(models.Model):

    id = models.CharField(max_length=36, primary_key=True, default=new_uuid)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=1024, null=True, blank=True)
    create_time = models.IntegerField(default=now_timestamp)
    options = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.title} ({self.id})'


class Guest(models.Model):

    id = models.CharField(max_length=36, primary_key=True, default=new_uuid)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    create_time = models.IntegerField(default=now_timestamp)
    last_update = models.IntegerField(default=now_timestamp)

    def __str__(self):
        return self.name


class Vote(models.Model):

    id = models.CharField(max_length=36, primary_key=True, default=new_uuid)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, db_index=True)
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, db_index=True)
    day = models.IntegerField(db_index=True)
    answer = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.day}: {self.guest.name}: {self.answer}'
