# Analytics and Success Metrics Spec (MVP)

## Objectives
Instrument core funnels so product team can answer:
- Are users activating in first session?
- Are users building habits and logging health consistently?
- Is AI enrichment useful and safe?
- Is retention improving?

## Event Design Principles
- One event per meaningful user action or system decision.
- Include `user_id`, `session_id`, `timestamp`, `platform`, and `plan_tier` in every event.
- Avoid sensitive free-text storage where possible (hash or categorize when feasible).

## Canonical Event List

### Acquisition and Auth
- `signup_started`
- `signup_completed`
- `login_completed`
- `auth_google_completed`
- `auth_email_completed`

### Onboarding
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

### Food and Nutrition
- `food_log_created`
- `food_lookup_known_match`
- `food_lookup_unknown_triggered_ai`
- `food_nutrients_rendered`
- `daily_nutrition_summary_viewed`

### AI Food Enrichment
- `ai_food_lookup_requested`
- `ai_food_lookup_completed`
- `ai_food_lookup_rejected_low_confidence`
- `ai_food_profile_confirmed`
- `ai_food_profile_edited_then_saved`
- `ai_food_profile_save_cancelled`

### Activity and Burn
- `activity_log_created`
- `activity_burn_estimated`
- `activity_log_edited`

### Logs, Graphs, and Score
- `daily_log_viewed`
- `history_filter_applied`
- `graph_viewed`
- `ai_daily_score_generated`
- `ai_daily_score_viewed`

### Limits and Monetization Readiness
- `free_ai_quota_reached`
- `upgrade_cta_viewed`
- `upgrade_intent_clicked`

## Event Properties (Selected)

### `habit_created`
- `habit_category`
- `repeat_type` (`n_days` or `until_date`)
- `repeat_value`

### `food_log_created`
- `meal_type`
- `input_mode` (`text`)
- `portion_unit`

### `ai_food_lookup_completed`
- `confidence_score`
- `latency_ms`
- `model_id`

### `activity_burn_estimated`
- `activity_count`
- `estimated_burn_kcal`

### `ai_daily_score_generated`
- `score_value`
- `score_band` (`low`, `medium`, `high`)

## KPI Definitions

### Activation
- Activation rate = users who complete onboarding and create at least:
  - 1 habit, 1 food log, and 1 activity log in first 48 hours / all new signups.

### Engagement
- Habit engagement = average `habit_marked_complete` events per active user per week.
- Nutrition engagement = average `food_log_created` events per active user per week.
- Activity engagement = average `activity_log_created` events per active user per week.

### AI Utility
- Unknown-food resolution rate =
  - `ai_food_profile_confirmed` / `ai_food_lookup_requested`.
- AI rejection rate =
  - `ai_food_lookup_rejected_low_confidence` / `ai_food_lookup_requested`.

### Retention
- D1, D7, D30 retention measured by returning active users with at least one core action event.

## Core Dashboards
- Growth funnel: signup -> onboarding -> first logs.
- Habit consistency dashboard: completion rate, streak distributions.
- Nutrition dashboard: meals/day, calories/day, macro trends.
- AI quality dashboard: confidence distribution, save/cancel rates, rejection reasons.
- Retention dashboard: cohort-based D1/D7/D30.

## Data Quality Checks
- Event volume anomaly alerts (daily baseline deviation).
- Required property completeness checks.
- Duplicate event suppression by idempotency key where needed.

## MVP Reporting Cadence
- Daily automated health report.
- Weekly product review with KPI changes and funnel drop-off analysis.
