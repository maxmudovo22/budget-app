# Product

## Register

product

## Users

Individuals in Uzbekistan tracking personal income and expenses, entirely
inside Telegram — no separate app install. Two entry points, one task:
- **Bot chat**: fastest path, mid-conversation, on the move. Type an amount
  and a word (`15000 такси`), get a confirmation and a running total.
- **Mini App**: opened from the bot's button when the user wants to review,
  browse history, or see where the money actually went this month.

Currency is сум (whole units, no decimals). Users are not accountants —
they want the friction of logging a purchase to be lower than the friction
of not bothering, and they want to trust the numbers without double-checking
them.

## Product Purpose

A lightweight personal budget tracker that removes every reason not to log
a transaction: no signup screen, no separate app, works from a chat message.
Success is a user who logs consistently for weeks, not someone who tries it
once. The balance and category breakdown are the payoff for that habit —
they need to read as immediately trustworthy, not just "a number."

## Brand Personality

Calm, precise, grounded. The reference is claude.com's execution quality —
confident restraint, editorial typography doing the work instead of
decoration, generous breathing room — recolored into a green-teal, natural
palette (already present in the codebase: `--primary:#1a5e44`,
`--accent:#5fb898`) rather than claude.com's own warm clay tones. Numbers
get the serif/display treatment (the balance is the hero); everything
operational (buttons, labels, form controls) stays a plain, quiet sans.

## Anti-references

- Generic SaaS dashboard cliché: gradient hero-metric cards, tiny uppercase
  tracked eyebrows, icon-in-a-box feature grids.
- Anything that reads as childish or cartoonish — the current hero
  illustration (a bright cartoon mountain-layers SVG) is the flagged
  example; soften or replace it with something more editorial.
- Decoration for its own sake: gradient text, glassmorphism, side-stripe
  accent borders.

## Design Principles

1. **Typography carries hierarchy, not color or boxes.** The serif/sans
   pairing already exists — lean on weight, size, and the Playfair/DM Sans
   contrast before reaching for a new visual device.
2. **The balance is the one moment of drama.** Every other number (stats,
   history rows, category bars) stays quiet so the balance keeps its
   weight — restraint everywhere else is what makes the hero number read
   as premium instead of just big.
3. **Every entry state is a state, not a placeholder.** Loading, empty,
   and error states get the same craft as the happy path — this is a
   product surface (habit-forming tool), not a brand page skimmed once.
4. **Trust through precision.** Tabular figures, consistent currency
   formatting (сум, not ₽ — a live bug today), no ambiguous rounding.
5. **Warmth comes from color and voice, not illustration.** The nature
   green-teal palette and the Telegram-native conversational copy carry
   the personality; drop literal cartoon scenery in favor of restrained
   abstract/geometric or photographic treatment if imagery is used at all.

## Accessibility & Inclusion

Standard WCAG AA: body text ≥4.5:1 contrast, large text/numerals ≥3:1,
visible focus states on all inputs and buttons, `prefers-reduced-motion`
respected (already partially handled in the existing CSS — extend the
pattern to any new motion). No additional stated accessibility
requirements beyond this.
