from django.forms.models import model_to_dict

from schedulio.api.endpoint import schemas
from schedulio.djangoapp import models
from schedulio.djangoapp.time import datetime_to_timestamp


def schedule_model_to_schema(model: models.Schedule) -> schemas.Schedule:
    model_dict = model_to_dict(model)
    model_dict['create_time'] = datetime_to_timestamp(model_dict['create_time'])
    return schemas.Schedule.parse_obj(model_dict)
