# Security

## Reporting

This is a non-commercial portfolio prototype, run on demand — not an operated
service. If you find a security issue anywhere in this repo, please open a GitHub
issue on `sharanlabs/curbside-commons` (nothing here processes real user data, so
public disclosure is appropriate), or use GitHub's private vulnerability reporting
on the repo if you prefer.

## What the threat surface actually is

- **The website** is a static export of committed, labeled fixtures. It initiates
  no sends, makes no live calls, and holds no secrets. There is no server.
- **The verifier runtime** is deterministic TypeScript with no AI calls and no
  network calls — enforced by import-graph tests
  (`evals/crew/crew-import-walk.test.ts`), not by policy.
- **Secrets**: none are committed (RULES.md §11). Live-leg runs read keys from a
  gitignored `.env`; contact data in fixtures is fake by construction.

## MCP server threat posture

The repo ships an MCP server (`bin/mcp-server.mjs`) exposing the verifier through
the typed tool registry. Its posture, stated plainly:

1. **Stdio-only transport** — no network listener exists to attack; the server
   only talks to the local client that spawned it.
2. **Read-only, deterministic tools** — every advertised tool routes through the
   typed JSON-schema-validated registry (`lib/tools/registry.ts`) into the
   deterministic engine; there is no tool that sends, spends, mutates state, or
   touches the network (the same import-graph walk covers modules reachable from
   the registry).
3. **Tool-description integrity** — the schemas the server advertises are the
   committed registry schemas verbatim; a recorded transcript
   (`evals/mcp/`) pins what a real session sees, so silent tool-description drift
   (the classic MCP tool-poisoning vector) is test-visible.
4. **Content-as-data discipline** — fixture and feed content processed by the
   tools is treated as data to verify, never as instructions to follow; the crew's
   containment contract (steered-model blocking, human-gate forcing) is
   eval-locked (`evals/crew/`).
5. **What is NOT claimed**: no authentication layer (unnecessary for a local
   stdio prototype), no multi-tenant isolation, no production hardening — this is
   a demonstration server for a prototype, and a real deployment would need its
   own review. A signed-action approvals flow is designed as an offline simulator
   (plan E3) and is not a live capability.
6. **Rate limiting — documented exception to the MCP spec MUST.** The MCP spec
   directs servers to implement rate limiting; this server does not, by design.
   The exception is bounded: the transport is **stdio-only** (no network listener),
   the server talks to a **single local client that spawned it**, every tool is
   **read-only and deterministic** (no send, spend, mutation, or network — item 2),
   and this is a **prototype run on demand, not an operated service**. There is no
   remote caller to throttle and no billable or state-changing work to rate-limit.
   **Revisit trigger:** the moment any network transport is added or the server is
   hosted for multiple clients, this exception is void and rate limiting must be
   implemented before that change ships.

## Dependencies

What the continuous-integration workflow (`.github/workflows/ci.yml`) now produces on every run, as one downloadable artifact named `supply-chain-audit-and-sbom` (kept 14 days, runtime dependencies only):

- **`audit.json`** — the output of `npm audit --omit=dev --json`: known advisories against the packages the shipped code depends on. For now this step is **non-blocking**: it reports and never fails the build. Making it blocking is a recorded follow-up once the first run's advisories have been read.
- **`sbom.cdx.json`** — a CycloneDX software bill of materials from `npm sbom --sbom-format cyclonedx --omit=dev`: every runtime package and version, as a machine-readable list.

Read them from the run's page under **Actions**, in the **Artifacts** section at the bottom. Nothing here is a claim that the dependency tree is free of advisories; the audit file is what says so, run by run.

Runtime dependency licenses, read from the installed packages (2026-10-31):

| Dependency | Version | License |
| --- | --- | --- |
| @ai-sdk/google | 2.0.83 | Apache-2.0 |
| @ai-sdk/groq | 2.0.45 | Apache-2.0 |
| @modelcontextprotocol/sdk | 1.29.0 | MIT |
| @number-flow/react | 0.6.1 | MIT |
| ai | 5.0.217 | Apache-2.0 |
| ajv | 8.20.0 | MIT |
| ajv-formats | 3.0.1 | MIT |
| class-variance-authority | 0.7.1 | Apache-2.0 |
| clsx | 2.1.1 | MIT |
| lucide-react | 0.555.0 | ISC |
| next | 16.2.10 | MIT |
| react | 19.2.7 | MIT |
| react-dom | 19.2.7 | MIT |
| tailwind-merge | 3.6.0 | MIT |
| zod | 4.4.3 | MIT |

These are the direct runtime dependencies; the SBOM lists the transitive ones.
