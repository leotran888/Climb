"""A tiny score tracker for keeping tabs on players' points."""


def add_score(scores, name, points):
    """Record `points` for `name`, creating their entry if needed."""
    scores.setdefault(name, []).append(points)


def get_average(scores, name):
    """Return the average of all points recorded for `name`."""
    entries = scores.get(name, [])
    if not entries:
        return 0
    return sum(entries) / len(entries)


def get_top_scorer(scores):
    """Return the name with the highest total points, or None if empty."""
    if not scores:
        return None
    return max(scores, key=lambda name: sum(scores[name]))
