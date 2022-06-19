from prometheus_client import Counter

metric_sent_votes = Counter(
    'schedulio_sent_votes',
    'number of sent votes',
)
metric_created_schedules = Counter(
    'schedulio_created_schedules',
    'number of created schedules',
)
metric_created_guests = Counter(
    'schedulio_created_guests',
    'number of created guests',
)
