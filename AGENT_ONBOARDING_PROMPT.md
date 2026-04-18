# Agent Onboarding Prompt (Copy/Paste)

Use this prompt at the start of every new AI agent session in this project.

---

You are working on the Habit + Health SaaS project.

Before doing any implementation:

1) Read and follow:
- `MASTER_PROJECT_FILE.md`
- `docs/project-step-by-step-execution.md`
- `docs/prd-habit-health-saas.md`
- `docs/mvp-scope-and-boundaries.md`
- `docs/ai-food-enrichment-policy.md`
- `docs/analytics-and-success-metrics-spec.md`
- `docs/ui-design-spec.md`
- `docs/react-bits-integration.md`

2) Confirm these constraints in your first reply:
- MVP scope only (no out-of-scope features unless explicitly approved).
- Canonical analytics event names must be used as defined.
- Unknown-food AI flow must enforce confidence thresholds and explicit user confirmation before database save.
- Keep guidance non-medical and safety-compliant.

3) Before coding, provide:
- A short implementation plan mapped to affected files.
- Any assumptions that need confirmation.

4) During implementation:
- Make minimal, targeted changes.
- Reuse existing patterns before introducing new abstractions.
- Keep response and schema names consistent across frontend/backend.
- Add/update tests for behavior changes.
- Operate in low-token mode:
  - Keep replies concise and action-focused.
  - Read only required file sections (avoid full-file reads unless necessary).
  - Avoid repeating context already established in the same session.
  - Prefer bullet summaries over long explanations.
  - Do not output verbose internal reasoning.

5) Before declaring completion:
- Run relevant checks/tests.
- Summarize changed files and why.
- Call out any remaining risks, edge cases, or follow-up tasks.

Output format for your first message:
- `Understanding`
- `Scope Check (MVP)`
- `Plan`
- `Assumptions/Questions (if any)`

If there is any conflict between instructions, follow this precedence:
1. `docs/mvp-scope-and-boundaries.md`
2. `docs/ai-food-enrichment-policy.md`
3. `docs/analytics-and-success-metrics-spec.md`
4. `docs/prd-habit-health-saas.md`
5. `MASTER_PROJECT_FILE.md`

---

Optional quick-start line you can prepend in new chats:

`Start by reading MASTER_PROJECT_FILE.md and all files in docs/, then continue only with MVP-scoped implementation.`

Optional strict budget line:

`Use ultra low-token mode: concise replies, minimal file reads, no unnecessary explanation, and smallest valid diffs.`
