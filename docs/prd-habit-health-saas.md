# Product Requirements Document: Habit + Health SaaS

## 1. Product Vision
Build a unified web product (desktop + mobile responsive) where users can:
- Track repeatable daily habits and goals.
- Log food in natural language and get nutrition breakdown.
- Describe activities and estimate calories burned.
- Review history, trends, and performance graphs.
- Receive an AI-generated daily score with actionable insights.

## 2. Target Users
- Users starting fitness routines who need guidance and simplicity.
- Busy users who prefer natural language logging over manual forms.
- Goal-driven users tracking consistency and body composition outcomes.

## 3. Platform and Business Model
- Platform: Web app with responsive mobile experience (v1).
- Model: Freemium.
- Free tier: core tracking + limited AI usage + basic analytics.
- Paid tier (post-v1 enablement): higher limits, deeper analytics, coaching.

## 4. Product Sections

### 4.1 Habit Tracker / Goals Tracker
Users can:
- Create daily habits/tasks.
- Set repeat duration (N days or end date).
- Mark done/missed for each day.
- Add optional notes.

System behavior:
- Recurrence engine generates per-day instances.
- Streaks and adherence tracked per habit.

### 4.2 Health Tracking
Users can:
- Log what they ate and portion size in plain language.
- Log activities performed today in plain language.

System behavior:
- Returns nutrition profile: calories, protein, carbs, fat, sugars, natural sugars, fiber, sodium, and other available nutrients.
- Returns calories burned estimates from parsed activities.

## 5. Authentication
- Google OAuth sign-in.
- Email/password authentication.
- Password reset and verification for email auth.

## 6. Onboarding
Collect:
- Primary goal (fit, lose weight, gain weight, gain muscle).
- Basic profile (age, height, weight, baseline activity).
- Optional dietary preferences.

Personalize:
- Suggested daily calorie target.
- Starter habit suggestions.
- AI scoring weights.

## 7. Core User Stories (MVP)
- User can create recurring daily habits for custom duration.
- User can mark daily completion and view streak.
- User can enter food + portion and get nutrient output.
- User can request AI assistance for unknown foods.
- User can enter daily activities and get burn estimates.
- User can view daily logs and historical trends.
- User can see AI day score and practical guidance.

## 8. Functional Requirements (MVP)

### Habit Engine
- Habit CRUD.
- Daily recurrence for fixed day-count or until date.
- Daily completion status.
- Streak and completion percentage calculations.

### Nutrition Engine
- Food search with fuzzy matching.
- Portion normalization (g/ml/common servings).
- Nutrient calculation by entry and day totals.
- AI fallback for unknown food, requiring explicit user confirmation before saving.

### Activity Engine
- Natural language parser for activity descriptions.
- MET-based burn calculation with profile-aware estimate.
- Manual edit/override support.

### AI Assistant
- Free-tier request quotas.
- Unknown-food nutrient estimation.
- Daily score generation and short coaching output.
- Safety disclaimer indicating non-medical advice.

### Logs and Analytics
- Daily timeline with drill-down.
- Weekly and monthly graphs for habits, intake, burn, and score.

## 9. Non-Functional Requirements
- Mobile-responsive and desktop-friendly UI.
- Fast known-food lookups (<500ms target for cached lookups).
- Input validation and rate limits.
- Auditability of AI-generated nutrition records.
- Privacy-focused health data handling.

## 10. Data Model (High-Level Entities)
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

## 11. Success Metrics (MVP)
- D1/D7 retention.
- Habits completed per active user per week.
- Food logs per active user per week.
- Unknown-food resolution rate.
- Percentage of days with generated AI score.
- Free-to-paid conversion readiness (once paid is enabled).

## 12. Risks and Mitigations
- Nutrition accuracy: display confidence and require confirmation for AI-added foods.
- Hallucination risk: provenance fields + moderation + edit workflows.
- Engagement drop: reminders, streak nudges, and low-friction daily check-in.
- Safety/legal: non-medical disclaimer and harmful-content safeguards.

## 13. Release Phases
- Phase 1: Auth + onboarding + habit tracking.
- Phase 2: Nutrition lookup + AI fallback + food profile enrichment.
- Phase 3: Activity burn + logs + graphs.
- Phase 4: AI day score + freemium limits + refinement.
