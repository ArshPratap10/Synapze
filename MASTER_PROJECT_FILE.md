# MASTER PROJECT FILE

## Project Identity
- Project: Habit + Health SaaS
- Version focus: MVP (web + mobile-responsive web)
- Business model: Freemium (free-first with paid readiness)

This file is the single onboarding index for AI agents and human contributors. Read this first, then follow linked specs.

## Source of Truth Documents
- Product PRD: `docs/prd-habit-health-saas.md`
- MVP Scope/Boundaries: `docs/mvp-scope-and-boundaries.md`
- AI Food Policy: `docs/ai-food-enrichment-policy.md`
- Analytics/KPIs: `docs/analytics-and-success-metrics-spec.md`
- UI Design Spec: `docs/ui-design-spec.md`
- React Bits Integration: `docs/react-bits-integration.md`
- Step-by-Step Execution Plan: `docs/project-step-by-step-execution.md`

If any conflict appears:
1) `docs/mvp-scope-and-boundaries.md` defines what is in/out for launch.
2) `docs/ai-food-enrichment-policy.md` controls AI food write behavior.
3) `docs/analytics-and-success-metrics-spec.md` controls event naming and KPI definitions.
4) `docs/prd-habit-health-saas.md` provides broader product intent.

## Product Goal
Build a unified app where users can:
- Track recurring daily habits/goals.
- Log food naturally and get nutrient breakdown.
- Log activities and estimate calories burned.
- View daily logs and historical graphs.
- Receive an AI-generated daily score and practical next-day guidance.

## Core Product Sections

### 1) Habit Tracker / Goals Tracker
- Habit CRUD.
- Daily recurrence (N days or until date).
- Done/missed status per day.
- Streak and adherence metrics.

### 2) Health Tracking
- Food logs from natural language input.
- Nutrient output includes calories, macros, sugars (including natural sugars), fiber, sodium, and other available nutrients.
- Activity logs from natural language input with burn estimation.

### 3) Logs, Graphs, and AI Score
- Daily timeline and history by date.
- Trends for habits, intake, burn, and score.
- End-of-day AI score (0-100) with reasons and recommendations.

## Authentication and User Profile
- Google OAuth.
- Email/password auth with password reset and verification.
- Onboarding captures fitness goal and baseline profile to personalize recommendations.

## MVP Boundaries (Do/Do Not)

### Must Ship in MVP
- Auth + onboarding.
- Habit recurrence and completion tracking.
- Nutrition lookup with AI fallback for unknown foods.
- Activity calorie estimation.
- Daily logs and basic analytics graphs.
- AI day scoring.

### Explicitly Out of Scope for MVP
- Native mobile apps.
- Wearables integration.
- Barcode scanning.
- Community/coaching marketplace features.
- Advanced export/report modules.

## AI Food Enrichment Rules (Critical)
- Unknown food -> AI inference only after local lookup fails.
- Confidence thresholds:
  - High: >= 0.85
  - Medium: >= 0.65 and < 0.85
  - Low: < 0.65 (no direct save allowed)
- User confirmation is always required before DB write.
- Persist provenance fields (model_id, confidence_score, created_by, prompt_hash, review_status, timestamps).
- Enforce sanity checks for nutrient consistency and block invalid macros/calories combinations.

## Data Model (High-Level)
- User
- AuthIdentity
- UserGoalProfile
- HabitTemplate
- HabitInstance
- FoodLogEntry
- FoodNutrientProfile
- ActivityLogEntry
- DailySummary
- DailyAIScore

## Canonical Analytics Events

### Auth/Onboarding
- `signup_started`
- `signup_completed`
- `login_completed`
- `auth_google_completed`
- `auth_email_completed`
- `onboarding_started`
- `onboarding_goal_selected`
- `onboarding_profile_completed`
- `onboarding_completed`

### Habits
- `habit_created`
- `habit_recurrence_configured`
- `habit_marked_complete`
- `habit_marked_missed`
- `habit_streak_milestone_reached`

### Food + AI Enrichment
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

### Activity + Logs + Score
- `activity_log_created`
- `activity_burn_estimated`
- `activity_log_edited`
- `daily_log_viewed`
- `history_filter_applied`
- `graph_viewed`
- `ai_daily_score_generated`
- `ai_daily_score_viewed`

## KPI Definitions (MVP)
- Activation: onboarding complete + first habit + first food log + first activity log within 48h.
- Habit engagement: average `habit_marked_complete` per active user/week.
- Nutrition engagement: average `food_log_created` per active user/week.
- AI resolution: `ai_food_profile_confirmed / ai_food_lookup_requested`.
- Retention: D1/D7/D30 using core action events.

## Release Sequence
1. Auth + onboarding + habits.
2. Nutrition lookup + AI enrichment write flow.
3. Activity burn + logs + graphs.
4. AI score + freemium controls + polish.

## Build Guidance for Any AI Agent
- Do not invent new event names if a canonical one already exists.
- Do not bypass AI confirmation flow for unknown-food DB writes.
- Do not expand scope beyond MVP without explicit approval.
- Keep health guidance non-medical and safety-compliant.
- Keep all changes aligned with the four source documents listed above.

## Handoff Checklist for New Agent Sessions
- Read this file.
- Read all files under `docs/`.
- Confirm task is MVP in-scope before implementation.
- If implementing AI food flow, enforce confidence and confirmation rules.
- If implementing telemetry, use canonical event names and required properties.
