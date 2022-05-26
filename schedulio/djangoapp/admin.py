from django.contrib import admin

from .models import *


class ScheduleAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'create_time',
    )


admin.site.register(Schedule, ScheduleAdmin)
