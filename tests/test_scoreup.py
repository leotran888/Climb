from scoreup import add_score, get_average, get_top_scorer


def test_add_score_creates_entry():
    scores = {}
    add_score(scores, "Alice", 10)
    assert scores["Alice"] == [10]


def test_get_average():
    scores = {}
    add_score(scores, "Alice", 10)
    add_score(scores, "Alice", 5)
    assert get_average(scores, "Alice") == 7.5


def test_get_average_missing_player():
    assert get_average({}, "Nobody") == 0


def test_get_top_scorer():
    scores = {}
    add_score(scores, "Alice", 10)
    add_score(scores, "Alice", 5)
    add_score(scores, "Bob", 8)
    assert get_top_scorer(scores) == "Alice"


def test_get_top_scorer_empty():
    assert get_top_scorer({}) is None
