from schedulio.api.errors import EntityNotFound
from schedulio.djangoapp import models


def find_schedule_by_id(id: str) -> models.Schedule:
    try:
        return models.Schedule.objects.get(id=id)
    except models.Schedule.DoesNotExist:
        raise EntityNotFound(f'Schedule with id {id} was not found')


def create_new_schedule(title: str, description: str) -> models.Schedule:
    new_model = models.Schedule(
        title=title,
        description=description,
    )
    new_model.save()
    return new_model
