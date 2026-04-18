# MVP Scope and Boundaries

## In Scope (Launch MVP)

### Product Areas
- Authentication (Google OAuth + email/password).
- Onboarding with goal capture and baseline profile.
- Habit tracker with daily recurrence and streaks.
- Food logging with nutrient computation.
- AI fallback for unknown foods with explicit user confirmation.
- Activity logging with calories burned estimates.
- Daily logs/history.
- Basic analytics graphs.
- AI-generated day score and next-day guidance.

### Supported Platforms
- Web app with mobile-responsive UI.

### Freemium Scope
- Free tier available from launch.
- Free tier includes core tracking features and limited AI usage.
- Billing and paid plan entitlements may be scaffolded but not required to gate launch if no payment flow is yet active.

## Out of Scope (Post-MVP)
- Native iOS/Android apps.
- Wearable integrations.
- Barcode scanning.
- Community/social or coaching marketplace features.
- Advanced report exports.
- Personalized meal plan generation.

## MVP Boundaries by Capability

### Habits
- Supports daily recurrence only.
- No complex weekly RRULE editor in v1.

### Nutrition
- Supports typed natural language input.
- Image-based meal recognition out of scope.
- AI-added food profile requires user confirmation before DB persistence.

### Activity
- Supports text input and estimated burn.
- Direct GPS/activity tracker integrations out of scope.

### AI
- Free assistant supports unknown-food enrichment and daily score explanations.
- No clinical diagnosis or treatment suggestions.

## Acceptance Gates (MVP Ready)
- New user can onboard and log first habit, meal, and activity in one session.
- Daily summary updates correctly after each entry type.
- Logs are queryable by date and render historical trend graphs.
- AI unknown-food flow can create a new food profile with audit trail.
- Rate limits and fallback handling prevent unbounded AI usage.
