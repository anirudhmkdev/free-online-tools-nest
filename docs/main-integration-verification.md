# Main integration verification

The user authorized pushing the completed work to `main` on 2026-10-04. Integration combines current main `d20c1a7a3edfbd2f2859ee70c2329ab4fe3f1db1` with feature commit `21e7f0f512a8a229039bfcffc3e1355e520e43f3` in a separate checkout. The original checkout and its three pre-existing pending edits were preserved.

## Combined behavior

The 25 primary and 58 secondary discovery tiers, complete search coverage, accessible native disclosures and semantic telemetry remain intact. Main's newer grammar, restricted YAML, percentage, PDF rewriting, sentence-selection helpers and truthful quality copy were retained. Async PDF completion guards reject stale operations. SQL formatting preserves quoted values, identifiers, comments and dollar-quoted bodies before applying main's code-formatting helper; unterminated segments fail. Its registry and dossier describe that heuristic contract without promising dialect validation.

The main content-remediation approvals, original demand delta and every frozen fixture remain unchanged. `src/data/demand-main-integration-content-delta.json` separately records the reviewed composition of 23 protected page-content expectations and three source hashes. Content layers cannot override indexing or canonical fields. The original before/after approvals still require exact historical evidence; a merge-specific regression verifies layered content changes preserve publishing metadata.

## Executed checks

| Check | Result |
| --- | --- |
| Full Vitest suite | 30 files, 310 tests passed |
| ESLint | Passed; 14 existing unused-variable/import warnings |
| Astro/TypeScript | Passed; zero errors, 14 hints |
| Full `npm run build` and offline validator | Passed; 191 routes and 89 sitemap URLs |
| Advertising membership | Exactly the original 117 AdSense-loader pages |
| Frozen evidence and public publishing configuration | No changes from main; original demand delta also unchanged |
| Discovery browser checks | 25 passed, including keyboard, full search, localized subsets and no-JavaScript access |
| Default telemetry probes | All 83 English tools: zero default events and runtime errors |
| Representative telemetry operations | 18 passed, including failures, aborted PDF processing, deduplication, locale, payload privacy and unavailable analytics |
| Merged-tool browser flows | Six passed: SQL, YAML, Text Summarizer, Text Analyzer, Percentage and Grammar |
| Git whitespace and unresolved conflicts | Clean |

Browser checks used the final static local preview. Production-hostname requests were intercepted to localhost and every external request was blocked; no events were sent to production analytics. One operation-harness attempt stopped because its synthetic image fixture had not been copied; the fixture was supplied and all 18 operations passed on rerun. Detailed scripts, fixtures, results and logs remain under ignored `.private/`.

These results establish local integration. They do not establish a production deployment timestamp, production GA4 receipt or a production performance improvement. The main push uses the configured deployment integration; the 90-day observation window requires the actual production release timestamp and production event validation recorded separately.
