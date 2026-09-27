# SportsReferee

A GenLayer intelligent contract that acts as a public replay desk for sports
disputes. Anyone can open a dispute with an immutable claim, a written rule,
and public source URLs. When the dispute is resolved, validators independently
fetch those sources and reach consensus on a YES, NO, or VOID verdict.

## How it works

Every dispute is created with a `mode`:

- **`data`** — the claim is checked against a numeric field in a JSON API
  response, using a dot-notation field path and a comparison operator
  (`>`, `>=`, `<`, `<=`, `==`).
- **`call`** — the claim is judged by an LLM against fetched page text and the
  written rule, replying with a single word: YES, NO, or VOID.

Each dispute can be appealed exactly once, which re-runs the same sources plus
an appellant's note and can uphold or overturn the original verdict.

## Contract functions

| Function | Type | Description |
|---|---|---|
| `create_dispute(...)` | write | Opens a new dispute. Validates inputs and locks the rule text, claim, mode, and source URLs. |
| `resolve(dispute_id)` | write | Fetches sources and settles the dispute under validator consensus. |
| `appeal(dispute_id, appeal_context)` | write | One-time re-review of a resolved or void dispute. |
| `get_dispute(dispute_id)` | view | Returns a single dispute row, with a `found` flag. |
| `get_all_disputes()` | view | Returns every dispute, sorted by id. |
| `list_dispute_ids()` | view | Returns just the list of dispute ids. |
| `get_admin()` | view | Returns the deploying address. |
| `get_total_disputes()` | view | Returns the running dispute counter. |
| `debug_fetch(url, mode)` | write | Diagnostic. Confirms whether a URL can be fetched, without touching dispute logic. |
| `debug_eq_principle_options()` | view | Diagnostic. Lists what's available on `gl.eq_principle` in the deployed SDK build. |

## create_dispute parameters
sport e.g. "Basketball"
league e.g. "NBA"
event_name min 4 characters
play_timestamp free text, e.g. "2026-09-23 Q4"
claim min 12 characters, the statement being judged
rule_text min 20 characters, the immutable standard to judge against
mode "data" or "call"
evidence_url primary source, must be http(s)
evidence_url_fallback optional second source
stats_url optional third source
json_field_path required for "data" mode, dot notation, e.g. "leagues.0.season.year"
comparison required for "data" mode, one of > >= < <= ==
target_value required for "data" mode, must be numeric


## Example test disputes

**data mode**, against a stable public JSON endpoint
create_dispute(
sport="Test",
league="N/A",
event_name="Placeholder todo check",
play_timestamp="2026-09-27",
claim="Todo item 1 is marked completed",
rule_text="If the completed field on todo 1 is true, the claim is true. If the field is missing, VOID.",
mode="data",
evidence_url="https://jsonplaceholder.typicode.com/todos/1",
evidence_url_fallback="",
stats_url="",
json_field_path="completed",
comparison="==",
target_value="1"
)



**call mode**, against a plain HTML page

create_dispute(
sport="Basketball",
league="NBA",
event_name="Wikipedia NBA page check",
play_timestamp="2026-09-27",
claim="The Golden State Warriors are mentioned as an NBA franchise",
rule_text="If the source text names the Golden State Warriors as an NBA team, the claim is true.",
mode="call",
evidence_url="https://en.wikipedia.org/wiki/Golden_State_Warriors",
evidence_url_fallback="",
stats_url="",
json_field_path="",
comparison="",
target_value=""
)
