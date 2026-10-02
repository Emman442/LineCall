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
    once validators agree on the verdict.
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
        self.disputes_json = json.dumps(data, sort_keys=True)

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
            elif isinstance(node, list):
                idx = int(part)
                node = node[idx]
            else:
                raise KeyError(part)
        return float(node)

    def _get_webpage(self, url: str, mode: str):
        """
        Different GenVM/SDK builds expose the web-fetch call under
        different names. Newer builds moved nondeterministic ops
        under gl.nondet.*, so gl.get_webpage became
        gl.nondet.web.render. Try both instead of hardcoding one and
        silently failing on whichever build doesn't have it.
        """
        if hasattr(gl, "nondet") and hasattr(gl.nondet, "web") and hasattr(gl.nondet.web, "render"):
            return gl.nondet.web.render(url, mode=mode)
        if hasattr(gl, "get_webpage"):
            return gl.get_webpage(url, mode=mode)
        raise AttributeError("no web fetch function found on gl or gl.nondet.web")

    def _run_prompt(self, prompt: str) -> str:
        """
        Same story as _get_webpage. Some builds expose exec_prompt
        directly on gl, newer ones moved it to gl.nondet.exec_prompt.
        """
        if hasattr(gl, "nondet") and hasattr(gl.nondet, "exec_prompt"):
            return gl.nondet.exec_prompt(prompt)
        if hasattr(gl, "exec_prompt"):
            return gl.exec_prompt(prompt)
        raise AttributeError("no exec_prompt function found on gl or gl.nondet")

    def _fetch_text(self, url: str) -> str:
        if not url or not url.startswith("http"):
            return ""
        try:
            page_content = self._get_webpage(url, "text")
            return str(page_content)[:4000]
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
        if len(sport.strip()) < 2:
            raise gl.vm.UserError("sport required")
        if len(event_name.strip()) < 4:
            raise gl.vm.UserError("event_name too short")
        if len(claim.strip()) < 12:
            raise gl.vm.UserError("claim too short")
        if len(rule_text.strip()) < 20:
            raise gl.vm.UserError("rule_text too short, lock the standard now")
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
                fetch_report = []
                for url in urls:
                    txt = self._fetch_text(url)
                    fetch_report.append(url + "=" + ("FETCHED" if len(txt) > 20 else "EMPTY"))
                    if txt:
                        chunks.append("SOURCE " + url + ":\n" + txt)

                if len(chunks) == 0:
                    return json.dumps(
                        {"verdict": "VOID", "report": " | ".join(fetch_report)},
                        sort_keys=True,
                        separators=(",", ":"),
                    )

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
YES, the claim is clearly supported
NO, the claim is clearly false
VOID, wrong clip, missing angle, paywalled, or too ambiguous

No other words.
"""
                raw = self._run_prompt(prompt).strip().upper()
                if raw.startswith("YES"):
                    verdict_word = "YES"
                elif raw.startswith("NO"):
                    verdict_word = "NO"
                else:
                    verdict_word = "VOID"
                return json.dumps(
                    {"verdict": verdict_word, "report": " | ".join(fetch_report)},
                    sort_keys=True,
                    separators=(",", ":"),
                )

            packed_call = json.loads(gl.eq_principle.strict_eq(evaluate_call))
            verdict = str(packed_call.get("verdict", "VOID"))
            if verdict not in ["YES", "NO", "VOID"]:
                verdict = "VOID"
            observed = str(packed_call.get("report", ""))

        if verdict == "YES":
            reasoning = "YES, public sources were judged to support the claim under the locked rule text."
        elif verdict == "NO":
            reasoning = "NO, public sources were judged not to support the claim under the locked rule text."
        else:
            reasoning = "VOID, evidence was missing, unreadable, or too ambiguous to settle the claim."
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
        caller = str(gl.message.sender_address)
        data = self._load()
        if dispute_id not in data:
            raise gl.vm.UserError("unknown dispute_id")
        row = data[dispute_id]
        if caller != row["creator"] and caller != self.admin:
            raise gl.vm.UserError("Only the dispute creator or admin can appeal")
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
            raw = self._run_prompt(prompt).strip().upper()
            if raw.startswith("YES"):
                return "YES"
            if raw.startswith("NO"):
                return "NO"
            return "VOID"

        verdict = gl.eq_principle.strict_eq(evaluate_appeal)
        if verdict not in ["YES", "NO", "VOID"]:
            verdict = "VOID"

        if verdict == "YES":
            reasoning = "APPEAL YES, claim stands after re-review."
        elif verdict == "NO":
            reasoning = "APPEAL NO, claim does not stand after re-review."
        else:
            reasoning = "APPEAL VOID, still unresolvable after re-review."
        reasoning = reasoning + " Original was " + original + "."

        row["appeal_used"] = True
        row["appeal_context"] = context[:400]
        row["verdict"] = verdict
        row["reasoning"] = reasoning
        row["resolved_at"] = gl.message.raw["datetime"]
        row["status"] = "appealed" if verdict != "VOID" else "void"
        data[dispute_id] = row
        self._save(data)

    @gl.public.write
    def debug_fetch(self, url: str, mode: str) -> str:
        """
        Test-only helper. Tries _get_webpage's adaptive lookup first.
        If that still fails, dumps the real attribute names available
        on gl and gl.nondet so we can see exactly what this SDK build
        actually calls its web-fetch function, instead of guessing
        again.
        """
        def do_fetch() -> str:
            try:
                content = self._get_webpage(url, mode)
                content_str = str(content)
                length_bucket = (len(content_str) // 500) * 500
                status = "FETCH_OK" if len(content_str) > 20 else "FETCH_EMPTY"
                return status + " approx_len=" + str(length_bucket)
            except Exception as e:
                gl_attrs = ",".join(sorted(a for a in dir(gl) if not a.startswith("_")))
                nondet_attrs = ""
                if hasattr(gl, "nondet"):
                    nondet_attrs = ",".join(sorted(a for a in dir(gl.nondet) if not a.startswith("_")))
                return (
                    "ERROR " + type(e).__name__ + ": " + str(e)[:200]
                    + " | gl_attrs=" + gl_attrs[:400]
                    + " | nondet_attrs=" + nondet_attrs[:400]
                )

        return gl.eq_principle.strict_eq(do_fetch)

    @gl.public.view
    def debug_eq_principle_options(self) -> str:
        """
        Lists what's actually available on gl.eq_principle in this
        SDK build. strict_eq requires byte-identical output across
        every validator, which live scraped web content will
        sometimes fail even when the underlying facts agree. If that
        starts happening on real disputes, this tells us whether a
        more tolerant comparison method exists here before we guess
        at a name.
        """
        return ",".join(sorted(a for a in dir(gl.eq_principle) if not a.startswith("_")))

    @gl.public.view
    def get_dispute(self, dispute_id: str) -> dict:
        data = self._load()
        if dispute_id not in data:
            row = self._empty()
            row["dispute_id"] = dispute_id
            row["found"] = False
            return row
        row = data[dispute_id]
        row["dispute_id"] = dispute_id
        row["found"] = True
        return row

    @gl.public.view
    def get_all_disputes(self) -> list:
        data = self._load()
        result = []
        for dispute_id in sorted(data.keys()):
            row = data[dispute_id]
            row["dispute_id"] = dispute_id
            row["found"] = True
            result.append(row)
        return result

    @gl.public.view
    def list_dispute_ids(self) -> list:
        return sorted(list(self._load().keys()))

    @gl.public.view
    def get_admin(self) -> str:
        return self.admin

    @gl.public.view
    def get_total_disputes(self) -> u256:
        return self.dispute_counter