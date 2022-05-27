from schedulio.api.schedule.calendar import get_more_votes
from schedulio.api.schedule import schemas


def test_get_more_empty_votes():
    votes_batch = get_more_votes(after_day=1653920201)
    assert len(votes_batch.day_votes) == 7

    assert votes_batch.day_votes[0] == schemas.DayVotes(
            day_index=1654006601,
            day_name="Tue 2022-05-31",
            day_of_week=2,
            guest_votes={},
        )
    assert votes_batch.day_votes[6] == schemas.DayVotes(
            day_index=1654525001,
            day_name="Mon 2022-06-06",
            day_of_week=1,
            guest_votes={},
        )