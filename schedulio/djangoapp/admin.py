from django.contrib import admin

from .models import *


class ScheduleAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'create_time',
    )

class GuestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'schedule',
        'last_update',
    )

class VoteAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'schedule',
        'guest',
        'day',
        'answer',
    )


admin.site.register(Schedule, ScheduleAdmin)
admin.site.register(Guest, GuestAdmin)
admin.site.register(Vote, VoteAdmin)
