# React Bits Integration Guide (MVP UI)

## Goal
Use React Bits components to add polished interactive UI across Habit, Health, and Progress screens while staying within MVP scope.

Reference repository: [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)

## When To Use React Bits
- Hero headline animations on Home.
- Subtle background effects for section headers.
- Micro-interactions for cards, buttons, and list items.
- Progress reveal animations on completion states.

Do not use heavy effects that hurt readability or mobile performance.

## Suggested Component Categories
- Text animations: for opening heading and streak celebration.
- UI components: animated buttons, cards, counters, and chips.
- Backgrounds: soft, low-motion gradient/noise backgrounds.

## Integration Rules
- Keep motion minimal and functional.
- Respect low-end devices: prefer CSS transforms/opacity.
- Do not block core flows with animation delays.
- Maintain dark premium design from `docs/ui-design-spec.md`.
- Keep accessibility: reduced motion support required.

## Recommended Mapping (MVP)

### Home
- Animated hero text for motivation headline.
- Gentle background accent behind main card.

### Habits
- Check/uncheck micro-animation on habit completion.
- Streak milestone pulse animation (small, non-intrusive).

### Health
- Nutrient card entry fade/slide when logs update.
- Confidence badge transition for AI unknown-food results.

### Progress
- Progress bar and chart intro animation on first render.
- Day score card number-count animation (short duration).

## Performance Budget
- Keep total animation libs/components lightweight and tree-shaken.
- Avoid running more than 2 concurrent heavy animated surfaces per screen.
- Prefer static fallback for older devices or `prefers-reduced-motion`.

## Installation Workflow (when frontend exists)
1. Initialize React frontend if absent.
2. Add selected React Bits components only (not full library dump).
3. Wrap animations in reusable UI primitives.
4. Add motion toggle utility (`reducedMotion` guard).
5. Validate Lighthouse/perf before merging.

## Acceptance Criteria
- UI feels interactive and premium, not noisy.
- Core tasks (log habit/food/activity) remain fast.
- Animations preserve clarity and accessibility.
- Design remains consistent with `docs/ui-design-spec.md`.
