# Engineering Rules & Architectural Principles — DUBORA

---

## 1. Zero Simulated Operations
- **Rule**: Never use fake progress bars, hardcoded successful jobs, placeholder download URLs, or simulated AI responses in production code.
- **Enforcement**: If provider credentials or API credits are absent, the system must return an explicit, actionable error message with the required environment variables. Every completed job must correspond to a verified, decodable file in private storage.

## 2. Strict Security & Secret Hygiene
- **Rule**: Never expose provider API keys (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) or database service-role secrets to browser bundles or client responses.
- **Enforcement**:
  - Keys are loaded exclusively on the server runtime.
  - Media URLs must use short-lived signed requests or authenticated session streaming endpoints (`/api/media/stream`).
  - Tenant data access is enforced at the PostgreSQL layer using Row-Level Security (RLS) policies based on workspace membership.

## 3. Media Processing Decoupling
- **Rule**: Never perform long-running video transcoding or speech synthesis directly within an HTTP request/response cycle.
- **Enforcement**:
  - Web requests must validate input parameters, create an initial durable job record, and return `HTTP 202 Accepted` immediately.
  - Heavy video operations (FFprobe inspection, audio separation, neural synthesis, FFmpeg remuxing) run asynchronously in dedicated worker processes.

## 4. Preservation of Source Media Quality
- **Rule**: Never degrade original video quality during localization passes.
- **Enforcement**:
  - Use FFmpeg stream copying (`-c:v copy`) whenever remuxing dubbed audio tracks into the original container.
  - Re-encoding video is strictly restricted to cases where resolution scaling or container format transformation is explicitly requested by the user.

## 5. Strict TypeScript & Module Boundaries
- **Rule**: All source code must adhere to strict TypeScript checks with no implicit `any` types.
- **Enforcement**: Shared data schemas are validated using Zod at all API ingress and egress boundaries.

## 6. Financial & Quota Integrity
- **Rule**: Never double-bill users for retried or failed jobs.
- **Enforcement**:
  - Usage minutes are deducted only upon successful verification of the rendered export.
  - Every billable event requires an idempotency key tied to the job ID.
