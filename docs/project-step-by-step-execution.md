# Project Step-by-Step Execution Plan (AI Agent Playbook)

## Purpose
This file is the execution guide for building the Habit + Health SaaS in a strict sequence.
All AI agents must follow this order unless the user explicitly changes priority.

## How Agents Should Use This File
- Follow phases from top to bottom.
- Do not start a later phase until the previous phase is marked complete.
- Use the status markers exactly:
  - `[ ]` not started
  - `[-]` in progress
  - `[x]` completed
- Add your agent name and date when you update any task.

---

## Phase 0: Project Setup and Guardrails
Goal: Ensure all agents operate with shared rules.

- [x] Confirm source docs are read:
  - `MASTER_PROJECT_FILE.md`
  - `docs/prd-habit-health-saas.md`
  - `docs/mvp-scope-and-boundaries.md`
  - `docs/ai-food-enrichment-policy.md`
  - `docs/analytics-and-success-metrics-spec.md`
  - `docs/ui-design-spec.md`
  - `docs/react-bits-integration.md`
- [x] Confirm MVP-only scope in agent response.
- [x] Confirm low-token mode in agent response.
- [x] Confirm canonical analytics event naming usage.
- [x] Confirm AI unknown-food confidence + confirmation policy.

Owner tag: `@agent-setup`

---

## Phase 1: Core Frontend Foundation
Goal: Prepare stable app shell, routing, and shared UI primitives.

- [x] Initialize frontend app (`frontend/`) with Next.js app router.
- [x] Build shared layout primitives:
  - `AppShell`
  - `BottomNav`
  - `SectionHeader`
  - `PrimaryButton`
  - `Card` variants
- [x] Create shared theme tokens from `docs/ui-design-spec.md`.
- [x] Add responsive behavior for mobile-first + desktop adaptation.
- [x] Add reduced-motion guard for animations.

Owner tag: `@agent-frontend-core`

---

## Phase 2: Habit Tracker Module
Goal: Deliver complete habit flow for daily use.

- [x] Build habit list screen with category sections.
- [x] Implement habit creation form:
  - habit name
  - category
  - recurrence (`n_days` or `until_date`)
- [x] Implement daily completion toggle.
- [x] Implement streak logic and weekly grid visualization.
- [x] Track analytics events:
  - `habit_created`
  - `habit_recurrence_configured`
  - `habit_marked_complete`
  - `habit_marked_missed`
  - `habit_streak_milestone_reached`

Owner tag: `@agent-habits`

---

## Phase 3: Nutrition Module (Known Foods + AI Fallback)
Goal: Deliver food logging with full nutrient outputs and AI-safe enrichment.

- [x] Build food log input UI (natural language + portion).
- [x] Implement known-food lookup flow.
- [x] Show nutrient output fields:
  - calories, protein, carbs, fats
  - total sugars, natural sugars
  - fiber, sodium
- [x] Implement unknown-food AI fallback.
- [x] Apply confidence policy:
  - high `>= 0.85`
  - medium `>= 0.65 and < 0.85`
  - low `< 0.65` (no save)
- [x] Build confirmation modal actions:
  - Confirm and Save
  - Edit Values
  - Cancel
- [x] Persist provenance/audit metadata on AI-added food.
- [x] Track analytics events:
  - `food_log_created`
  - `food_lookup_known_match`
  - `food_lookup_unknown_triggered_ai`
  - `food_nutrients_rendered`
  - `ai_food_lookup_requested`
  - `ai_food_lookup_completed`
  - `ai_food_lookup_rejected_low_confidence`
  - `ai_food_profile_confirmed`
  - `ai_food_profile_edited_then_saved`
  - `ai_food_profile_save_cancelled`

Owner tag: `@agent-nutrition`

---

## Phase 4: Activity + Calories Burned Module
Goal: Convert activity text logs into calorie-burn insights.

- [x] Build activity log input UI.
- [x] Parse activity descriptions and durations.
- [x] Implement MET-based burn estimation.
- [x] Allow manual correction/edit per activity record.
- [x] Update daily burn totals and summaries.
- [x] Track analytics events:
  - `activity_log_created`
  - `activity_burn_estimated`
  - `activity_log_edited`

Owner tag: `@agent-activity`

---

## Phase 5: Daily Logs + Progress Analytics
Goal: Give users historical visibility and trend insights.

- [x] Build daily logs timeline with date filters.
- [x] Build progress dashboard cards:
  - goals completed
  - streak
  - success rate
  - top category
- [x] Build trend graphs:
  - habits
  - intake vs burn
  - score trend
- [x] Track analytics events:
  - `daily_log_viewed`
  - `history_filter_applied`
  - `graph_viewed`

Owner tag: `@agent-progress`

---

## Phase 6: AI Day Score and Recommendations
Goal: Generate and display daily AI coaching summary.

- [x] Create day score engine output (`0-100`).
- [x] Render score explanation and 2-3 actions for tomorrow.
- [x] Add safety non-medical disclaimer where needed.
- [x] Track analytics events:
  - `ai_daily_score_generated`
  - `ai_daily_score_viewed`

Owner tag: `@agent-ai-score`

---

## Phase 7: Auth + Onboarding
Goal: Complete identity and personalization baseline.

- [x] Email/password signup/login/reset flows.
- [x] Google OAuth flow.
- [x] Onboarding steps:
  - goal selection
  - baseline profile
  - optional diet preferences
- [x] Personalization outputs:
  - starter calorie target
  - starter habits
- [x] Track analytics events:
  - `signup_started`
  - `signup_completed`
  - `login_completed`
  - `auth_google_completed`
  - `auth_email_completed`
  - `onboarding_started`
  - `onboarding_goal_selected`
  - `onboarding_profile_completed`
  - `onboarding_completed`

Owner tag: `@agent-auth-onboarding`

---
for now skip phase8
## Phase 8: Freemium Controls and Limits
Goal: Enforce free-tier constraints and upgrade readiness.

- [ ] Add daily AI usage quotas for free users.
- [ ] Add soft limit UX when quota reached.
- [ ] Add upgrade CTA surfaces.
- [ ] Track analytics events:
  - `free_ai_quota_reached`
  - `upgrade_cta_viewed`
  - `upgrade_intent_clicked`

Owner tag: `@agent-freemium`

---

## Phase 9: QA, Hardening, and Launch Readiness
Goal: Prepare stable MVP release.

- [x] Verify all canonical events emit with required properties.
- [x] Validate AI policy edge cases and low-confidence paths.
- [x] Run lint, build, and critical smoke tests.
- [x] Validate responsive UI on mobile + desktop widths.
- [x] Validate accessibility basics (contrast, touch target size).
- [x] Confirm no out-of-scope features slipped in.
- [x] Prepare release notes and launch checklist.

Owner tag: `@agent-qa-release`

---

## Parallel Work Rules (Important)
- Allowed in parallel:
  - UI styling refinements
  - analytics wiring
  - component extraction/refactor
- Not allowed in parallel without sync:
  - data model changes
  - auth/session changes
  - AI food save policy logic

If two agents touch same file area:
- First agent marks task `[-]`.
- Second agent must wait or work on a different module.

---

## Agent Handoff Template
Copy this block at end of each agent run:

```md
### Agent Handoff
- Agent: <name>
- Phase: <phase number and title>
- Tasks moved to [x]:
  - <task 1>
  - <task 2>
- Files changed:
  - <path 1>
  - <path 2>
- Risks/Notes:
  - <short note>
- Next recommended task:
  - <next task>
```

---

## Definition of Done (MVP)
MVP is done only when all are true:
- All phase checkboxes up to Phase 9 are `[x]`.
- Build and lint pass in frontend and backend.
- AI unknown-food flow enforces confidence + confirmation.
- Daily logs, progress graphs, and AI score visible and functional.
- Auth + onboarding + freemium limits functional.

