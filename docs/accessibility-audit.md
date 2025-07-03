# Accessibility Audit

## Gradient Contrast
No gradient backgrounds with text were found in the `public` directory. All text is displayed on solid backgrounds, so WCAG AA contrast requirements are met.

## Icon Only Buttons
The close button in `user-dashboard.html` now includes `aria-label="Close"` for screen reader accessibility.

## Reduce Motion
A global "Reduce Motion" toggle was added across all HTML pages. When enabled, the `reduce-motion` class disables animations and transitions via `reduce-motion.css` and is persisted in `localStorage`.
