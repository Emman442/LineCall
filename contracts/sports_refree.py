# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }

import genlayer as gl
from genlayer.types import *
import json
import typing


class SportsReferee(gl.contract.Contract):
    """
    Public replay desk.
    Creates a dispute with immutable rules + public URLs,
    fetches those sources at resolve time, and writes YES / NO / VOID
    once validators agree on the one-word verdict.
    """

    admin: str
    disputes_json: str
    dispute_counter: u256

    def __init__(self):
        self.admin = str(gl.message.sender_address)
        self.disputes_json = "{}"
        self.dispute_counter = u256(0)

    def _load(self) -> dict:
        try:
            data = json.loads(self.disputes_json or "{}")
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}

    def _save(self, data: dict) -> None:
        self.disputes_json = json.dumps(data)

    def _empty(self) -> dict:
        return {
            "creator": "",
            "sport": "",
            "league": "",
            "event_name": "",
            "play_timestamp": "",
            "claim": "",
            "rule_text": "",
            "mode": "call",
            "evidence_url": "",
            "evidence_url_fallback": "",
            "stats_url": "",
            "json_field_path": "",
            "comparison": "",
            "target_value": "",
            "status": "open",
            "verdict": "",
            "reasoning": "",
            "observed_value": "",
            "created_at": "",
            "resolved_at": "",
            "appeal_used": False,
            "appeal_context": "",
        }

    def _require_http(self, url: str, label: str) -> None:
        if not url.startswith("http://") and not url.startswith("https://"):
            raise gl.vm.UserError(label + " must be http(s)")

    def _compare(self, observed: float, target: float, op: str) -> bool:
        if op == ">":
            return observed > target
        if op == ">=":
            return observed >= target
        if op == "<":
            return observed < target
        if op == "<=":
            return observed <= target
        if op == "==":
            return observed == target
        raise gl.vm.UserError("invalid comparison")

    def _extract_path(self, data, path: str):
        node = data
        for part in path.split("."):
            if isinstance(node, dict) and part in node:
                node = node[part]
            else:
                raise KeyError(part)
        return float(node)

    def _fetch_text(self, url: str) -> str:
        try:
            return gl.nondet.web.render(url, mode="text")[:4000]
        except Exception:
            try:
                res = gl.nondet.web.get(url)
                body = res.body
                if isinstance(body, bytes):
                    return body.decode("utf-8", errors="ignore")[:4000]
                return str(body)[:4000]
            except Exception:
                return ""

    @gl.public.write
    def create_dispute(
        self,
        sport: str,
        league: str,
        event_name: str,
        play_timestamp: str,
        claim: str,
        rule_text: str,
        mode: str,
        evidence_url: str,
        evidence_url_fallback: str,
        stats_url: str,
        json_field_path: str,
        comparison: str,
        target_value: str,
    ) -> str:
        """
        mode:
          "data" — numeric / JSON field vs target (buzzer, score, clock)
          "call" — judgment from public page text (foul, offside, catch)

        claim must be a yes/no proposition, e.g.
        "The last Lakers field goal beat the buzzer."
        """
        if len(sport.strip()) < 2:
            raise gl.vm.UserError("sport required")
        if len(event_name.strip()) < 4:
            raise gl.vm.UserError("event_name too short")
        if len(claim.strip()) < 12:
            raise gl.vm.UserError("claim too short")
        if len(rule_text.strip()) < 20:
            raise gl.vm.UserError("rule_text too short — lock the standard now")
        if mode not in ["data", "call"]:
            raise gl.vm.UserError("mode must be data or call")

        self._require_http(evidence_url, "evidence_url")
        if evidence_url_fallback != "":
            self._require_http(evidence_url_fallback, "evidence_url_fallback")
        if stats_url != "":
            self._require_http(stats_url, "stats_url")

        if mode == "data":
            if len(json_field_path.strip()) < 1:
                raise gl.vm.UserError("json_field_path required for data mode")
            if comparison not in [">", ">=", "<", "<=", "=="]:
                raise gl.vm.UserError("comparison must be > >= < <= ==")
            try:
                float(target_value)
            except Exception:
                raise gl.vm.UserError("target_value must be numeric")

        self.dispute_counter = u256(int(self.dispute_counter) + 1)
        dispute_id = "dispute_" + str(int(self.dispute_counter))

        data = self._load()
        row = self._empty()
        row["creator"] = str(gl.message.sender_address)
        row["sport"] = sport.strip()
        row["league"] = league.strip()
        row["event_name"] = event_name.strip()
        row["play_timestamp"] = play_timestamp.strip()
        row["claim"] = claim.strip()
        row["rule_text"] = rule_text.strip()
        row["mode"] = mode
        row["evidence_url"] = evidence_url.strip()
        row["evidence_url_fallback"] = evidence_url_fallback.strip()
        row["stats_url"] = stats_url.strip()
        row["json_field_path"] = json_field_path.strip()
        row["comparison"] = comparison.strip()
        row["target_value"] = target_value.strip()
        row["created_at"] = gl.message.raw["datetime"]
        data[dispute_id] = row
        self._save(data)
        return dispute_id

    @gl.public.write
    def resolve(self, dispute_id: str) -> None:
        data = self._load()
        if dispute_id not in data:
            raise gl.vm.UserError("unknown dispute_id")
        row = data[dispute_id]
        if row.get("status") not in ["open"]:
            raise gl.vm.UserError("dispute is not open")

        mode = row["mode"]
        claim = row["claim"]
        rule_text = row["rule_text"]
        sport = row["sport"]
        event_name = row["event_name"]
        play_timestamp = row["play_timestamp"]
        primary = row["evidence_url"]
        fallback = row["evidence_url_fallback"]
        stats_url = row["stats_url"]
        field_path = row["json_field_path"]
        op = row["comparison"]
        target_str = row["target_value"]

        if mode == "data":
            def evaluate_data() -> str:
                urls = [primary]
                if fallback.startswith("http"):
                    urls.append(fallback)
                if stats_url.startswith("http"):
                    urls.append(stats_url)

                last_err = "no source"
                for url in urls:
                    raw = self._fetch_text(url)
                    if not raw:
                        last_err = "empty body"
                        continue
                    try:
                        parsed = json.loads(raw)
                        observed = self._extract_path(parsed, field_path)
                        target = float(target_str)
                        hit = self._compare(observed, target, op)
                        return json.dumps(
                            {
                                "verdict": "YES" if hit else "NO",
                                "observed": str(round(observed, 6)),
                            },
                            sort_keys=True,
                            separators=(",", ":"),
                        )
                    except Exception:
                        last_err = "parse_or_path"
                        continue

                return json.dumps(
                    {"verdict": "VOID", "observed": last_err},
                    sort_keys=True,
                    separators=(",", ":"),
                )

            packed = json.loads(gl.eq_principle.strict_eq(evaluate_data))
            verdict = str(packed.get("verdict", "VOID"))
            if verdict not in ["YES", "NO", "VOID"]:
                verdict = "VOID"
            observed = str(packed.get("observed", ""))
        else:
            def evaluate_call() -> str:
                urls = [primary]
                if fallback.startswith("http"):
                    urls.append(fallback)
                if stats_url.startswith("http"):
                    urls.append(stats_url)

                chunks = []
                for url in urls:
                    txt = self._fetch_text(url)
                    if txt:
                        chunks.append("SOURCE " + url + ":\n" + txt)

                if len(chunks) == 0:
                    return "VOID"

                evidence = "\n\n".join(chunks)[:6000]
                prompt = f"""You are an independent sports replay official.

Sport: {sport}
Event: {event_name}
Play time: {play_timestamp}

Claim to judge (true or false):
{claim}

Written rule / standard (immutable):
{rule_text}

Public evidence text:
{evidence}

Decide only from the evidence and the written rule.
Reply with ONE word:
YES — the claim is clearly supported
NO — the claim is clearly false
VOID — wrong clip, missing angle, paywalled, or too ambiguous

No other words.
"""
                raw = gl.nondet.exec_prompt(prompt).strip().upper()
                if raw.startswith("YES"):
                    return "YES"
                if raw.startswith("NO"):
                    return "NO"
                return "VOID"

            verdict = gl.eq_principle.strict_eq(evaluate_call)
            if verdict not in ["YES", "NO", "VOID"]:
                verdict = "VOID"
            observed = ""

        if verdict == "YES":
            reasoning = (
                "YES: public sources were judged to support the claim under the locked rule text."
            )
        elif verdict == "NO":
            reasoning = (
                "NO: public sources were judged not to support the claim under the locked rule text."
            )
        else:
            reasoning = (
                "VOID: evidence was missing, unreadable, or too ambiguous to settle the claim."
            )
        if observed:
            reasoning = reasoning + " Observed=" + observed + "."

        row["verdict"] = verdict
        row["reasoning"] = reasoning
        row["observed_value"] = observed
        row["resolved_at"] = gl.message.raw["datetime"]
        row["status"] = "void" if verdict == "VOID" else "resolved"
        data[dispute_id] = row
        self._save(data)

    @gl.public.write
    def appeal(self, dispute_id: str, appeal_context: str) -> None:
        """
        One appeal per dispute. Re-runs the same sources plus the
        appellant's note. Verdict is still one word under strict_eq.
        """
        data = self._load()
        if dispute_id not in data:
            raise gl.vm.UserError("unknown dispute_id")
        row = data[dispute_id]
        if row.get("status") not in ["resolved", "void"]:
            raise gl.vm.UserError("nothing to appeal")
        if row.get("appeal_used") is True:
            raise gl.vm.UserError("already appealed")
        if len(appeal_context.strip()) < 12:
            raise gl.vm.UserError("appeal_context too short")

        claim = row["claim"]
        rule_text = row["rule_text"]
        sport = row["sport"]
        event_name = row["event_name"]
        play_timestamp = row["play_timestamp"]
        primary = row["evidence_url"]
        fallback = row["evidence_url_fallback"]
        stats_url = row["stats_url"]
        original = row["verdict"]
        context = appeal_context.strip()

        def evaluate_appeal() -> str:
            urls = [primary]
            if fallback.startswith("http"):
                urls.append(fallback)
            if stats_url.startswith("http"):
                urls.append(stats_url)

            chunks = []
            for url in urls:
                txt = self._fetch_text(url)
                if txt:
                    chunks.append("SOURCE " + url + ":\n" + txt)
            evidence = "\n\n".join(chunks)[:6000] if chunks else "NO_EVIDENCE"

            prompt = f"""You are reviewing an appealed sports call.

Sport: {sport}
Event: {event_name}
Play time: {play_timestamp}
Claim: {claim}
Rule: {rule_text}
Original verdict: {original}
Appellant note: {context}

Evidence:
{evidence}

Uphold or overturn. Reply with ONE word only: YES, NO, or VOID.
"""
            raw = gl.nondet.exec_prompt(prompt).strip().upper()
            if raw.startswith("YES"):
                return "YES"
            if raw.startswith("NO"):
                return "NO"
            return "VOID"

        verdict = gl.eq_principle.strict_eq(evaluate_appeal)
        if verdict not in ["YES", "NO", "VOID"]:
            verdict = "VOID"

        if verdict == "YES":
            reasoning = "APPEAL YES: claim stands after re-review."
        elif verdict == "NO":
            reasoning = "APPEAL NO: claim does not stand after re-review."
        else:
            reasoning = "APPEAL VOID: still unresolvable after re-review."
        reasoning = reasoning + " Original was " + original + "."

        row["appeal_used"] = True
        row["appeal_context"] = context[:400]
        row["verdict"] = verdict
        row["reasoning"] = reasoning
        row["resolved_at"] = gl.message.raw["datetime"]
        row["status"] = "appealed" if verdict != "VOID" else "void"
        data[dispute_id] = row
        self._save(data)

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict[str, typing.Any]:
        data = self._load()
        if dispute_id not in data:
            return {"dispute_id": dispute_id, "found": False}
        row = data[dispute_id]
        row["dispute_id"] = dispute_id
        row["found"] = True
        row["admin"] = self.admin
        return row

    @gl.public.view
    def get_all_disputes(self) -> list:
        data = self._load()
        result = []
        for dispute_id in data.keys():
            row = data[dispute_id]
            row["dispute_id"] = dispute_id
            row["found"] = True
            result.append(row)
        return result

    @gl.public.view
    def list_dispute_ids(self) -> list:
        return list(self._load().keys())

    @gl.public.view
    def get_admin(self) -> str:
        return self.admin

    @gl.public.view
    def get_total_disputes(self) -> u256:
        return self.dispute_counter