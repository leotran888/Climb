# Climb

A tiny command-line score tracker. Keep track of player scores, look up
averages, and find out who's in the lead.

## Usage

```python
from climb import add_score, get_average, get_top_scorer

scores = {}
add_score(scores, "Alice", 10)
add_score(scores, "Alice", 5)
add_score(scores, "Bob", 8)

get_average(scores, "Alice")   # 7.5
get_top_scorer(scores)         # "Alice"
```

## Running tests

```bash
python -m pytest tests/
```
