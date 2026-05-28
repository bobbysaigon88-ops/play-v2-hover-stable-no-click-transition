# Play V2 — Hover Stable (No Click Transition)

## Overview

Play V2 is a generative editorial layout system built in Webflow using:

* CMS-driven content
* runtime layout generation
* GSAP hover choreography
* responsive editorial typography
* deterministic placement logic

This version focuses on stabilizing:

* hover interactions
* render behavior
* responsive aspect ratios
* runtime interaction ownership

---

# Current Stable Features

## Layout Engine

* Deterministic seeded layout system
* 12-column editorial grid
* Dynamic span assignment
* Runtime-generated card positioning
* Collision detection / overlap prevention
* Y-band choreography system
* Responsive aspect ratio handling

---

## Card Sizes

| CMS Size | Grid Span |
| -------- | --------- |
| xsmall   | 2         |
| small    | 3         |
| medium   | 4         |
| large    | 6         |

---

## Supported Aspect Ratios

| Ratio     | Behavior                   |
| --------- | -------------------------- |
| landscape | primary/default            |
| square    | secondary                  |
| portrait  | editorial offset treatment |

Large cards currently restrict to:

* landscape only

---

# Hover Interaction System

## Interaction Pattern

Hover:

* overlay fades in
* title reveals upward
* CTA appears/rests at full opacity

Leave:

* title reverses
* overlay fades out
* CTA fades back

Navigation:

* native Webflow link behavior preserved

---

# Architecture

## play-v2-render.css

Owns:

* visual rendering
* spacing
* typography
* overlays
* portrait treatments
* CTA styling
* responsive normalization

---

## play-v2-engine.js

Owns:

* render lifecycle
* placement engine
* seeded randomness
* ratio logic
* collision detection
* runtime card generation
* hover lifecycle
* GSAP choreography
* date formatting

---

# Governance Rules

## CSS

Use for:

* persistent visual states
* layout styling
* typography
* responsive normalization

Examples:

* opacity resting states
* spacing
* card styling
* hover-ready visuals

---

## GSAP

Use for:

* choreography
* sequencing
* stagger reveals
* timeline-based interactions

Examples:

* title reveal
* overlay timing
* synchronized motion systems

---

## Webflow Designer Interactions

Use ONLY for:

* stable platform-owned DOM
* simple authored interactions

Avoid for:

* runtime-generated systems
* cloned DOM nodes
* JS-generated overlays

---

# Key Learnings

## Interaction ownership follows lifecycle dependency

Not visual complexity.

Even simple interactions should remain inside runtime ownership if:

* tied to generated DOM
* dependent on runtime overlays
* participating in shared hover choreography

---

## Avoid nested hover hierarchies

Rejected pattern:
Card Hover → CTA Hover → CTA Click

Accepted pattern:
Card Hover → Unified Interaction State

CTA acts as:

* affordance
* informational cue
* not secondary interaction owner

---

## Webflow base styles can destabilize runtime systems

Critical debugging insight:
Some AR failures were caused by inherited Designer layout behavior, not render logic.

Always inspect:

* positioning
* flex inheritance
* width/height ownership
* stacking context

before modifying runtime code.

---

# Future Exploration

Potential future systems:

* click-transition overlays
* article transition choreography
* annual thought-pattern visualizations
* editorial cadence analytics
* theme clustering
* metadata-driven visualization layers

---

# Current Stable Version

play-v2-hover-stable-no-click-transition

Status:
Production-stable sandbox checkpoint
