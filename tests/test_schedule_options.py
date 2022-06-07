from schedulio.api.schedule.options import parse_schedule_options_json


def test_default_schedule_options():
    options = parse_schedule_options_json('')
    assert options.min_guests == 1
    assert options.min_duration_delta.total_seconds() == 0
    assert options.default_start_time.strftime("%H:%M") == '00:00'
    assert options.default_end_time.strftime("%H:%M") == '23:59'


def test_parse_schedule_options():
    options = parse_schedule_options_json('{"min_guests": 2, "min_duration": "2h 30m", "default_start_time": "20:00"}')
    assert options.min_guests == 2
    assert options.min_duration_delta.total_seconds() == (2 * 60 + 30) * 60
    assert options.default_start_time.strftime("%H:%M") == '20:00'
    assert options.default_end_time.strftime("%H:%M") == '23:59'
