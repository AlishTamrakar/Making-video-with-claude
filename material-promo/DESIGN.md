# Material Management — promo design spec

Mode: **autonomous free creation** (video-shotcraft `references/pipeline.md`), chosen by the user.
Source: `source/material-management.html` (single-file React prototype, "PE Transformer ERP — Material Management").

## Stage 0 — Product brief

- **What it is:** a material master-data module for a power/distribution transformer manufacturer. Teams request
  new materials, every department completes its own "view" of the record, and the request is approved/activated.
- **Audience:** internal stakeholders and ERP buyers/reviewers seeing the prototype.
- **Core message:** one place to request, review and activate every material.
- **Features shown (must-have):**
  1. Material Creation Requests queue — priority, category, status and data-completion in one table.
  2. Create-new drawer — typed material name, code generated from the material group.
  3. Request detail — six department tasks (General, Planning, Purchasing, Warehouse, Quality, Accounting)
     with owners, due dates, overdue flags, feeding one material record.
- **Format:** 1920×1080, 30 fps, ~26 s, English, no voice-over.
- **Data:** all names/IDs in the prototype are placeholder demo data (confirmed by the user: "fake, keep them").
- **Audio:** no music specified → SFX from Freesound + optional BGM chosen in stage 6; deliver with-BGM and no-BGM cuts.

| Requirement | Decision |
|---|---|
| Show real product | Real Playwright captures of the prototype (3× list & drawer, 2× detail) — no hand-built replicas |
| Visual language | Product's own tokens (below); no separate "promo skin" |
| Length | ~26 s: short enough for a review/demo link |
| Data safety | Placeholder data only; nothing sensitive in the file |

## Stage 1 — Visual direction & motion tokens

Direction: **"Clean enterprise blue"** — white surfaces, slate ink, the product's #0C83DF primary as the only accent.
Styleframe skipped on purpose: the prototype itself is a strict design system (Inter, Tailwind slate palette, one
primary), so the product screens are the styleframe; the only non-UI frames (title cards, opener, outro) reuse those tokens.

| Token | Value (from computed styles) |
|---|---|
| Font | Inter 400/500/600/700 (embedded from the prototype) |
| Ink | #020617 · secondary #475569 · muted #64748B |
| Line | #E2E8F0 · surface #F8FAFC · bg #FFFFFF |
| Accent | #0C83DF (primary button) · logo #1E293B / #0C83DF / #64748B / #38BDF8 |
| Status | pending #B45309 · approved #15803D · overdue #DC2626 |
| Radius | 6 px controls, 12 px cards |

Motion personality: preset **"professional trust" (B2B)** — main moves ~21f, `bezier(0,0,0.2,1)`, no overshoot on
fades/pans; physical landings (row embed, logo bloom) keep the card-specified press/spring. Three words: *precise, calm, confident*.

## Stage 2 — Feature → shot mapping

| Feature | Card (style) | Why |
|---|---|---|
| Opening statement | `blur-slide` | Low-energy, professional default title reveal |
| Requests queue | `crane-rise-reveal` | Start on one real request row (M-RQ-00124, Critical), pull back to the whole queue: "this row is one of many" |
| Breathers | `paper-title-card` (re-skinned to white/Inter/blue) | Chapter signposts before each feature |
| Create request | `type-and-filter` (typing + click part) | Human-speed typing in the real drawer, then click Submit |
| Department tasks | `row-embed` | Six department rows drop and embed into the real detail card |
| Outro | `ui-to-brand-morph` · `icon-flip-bloom` | The sidebar "creation request" icon flips into the product's cube logo + wordmark |

Each motion is the hero exactly once.

## Stage 3 — Storyboard (30 fps, 981 frames ≈ 32.7 s)

| # | Frames | Shot | Key motion | Caption / copy |
|---|---|---|---|---|
| 1 | 0–120 | Opener | blur-slide title: "New materials, / approved *faster.*" + subtitle | "Request, review and activate every material in one place." |
| 2 | 120–285 | Requests queue | crane 3.4× on M-RQ-00124 → full queue window on stage; rows wash in as they enter | "Every material request in one queue" |
| 3 | 285–340 | Title card | "New material? Start with *one form.*" | — |
| 4 | 340–606 | Create request | zoom 2.0 on Material name, type "Copper Busbar 100×10mm" (3f/char) → click group Select → dissolve to the real group-picked state (Raw Materials › Conductors › Copper Wire, code MAT-RM-CU-CUW-····, ring on the code) → pull back, click Save as draft → flash cut to the queue with new row M-RQ-01046 · Draft | "Codes come from the group" · "Saved as a draft, straight into the queue" |
| 5 | 606–661 | Title card | "Every department, one *material record.*" | — |
| 6 | 661–791 | Department tasks | six rows drop & embed (cues 12/22/31/39/46/52), camera pans right + pushes in | "Overdue tasks surface before they block production" |
| 7 | 791–981 | Outro | request icon wobbles, flips thin, cube logo blooms, wordmark lands, ~2 s hold | "Material Management · PE Transformer ERP" |

Energy: low open → mid-high crane → breath → mid interaction → breath → mid embed → mid-high outro.

Deliberate deviations (aesthetic-rules says to record them):
- **Q8:** the outro uses `ui-to-brand-morph` instead of a group-photo launch; the product has three screens, and
  "the icon you click every day is the brand" fits better than a crowd shot.
- **crane-rise-reveal aftermath:** no status flip on the tracked row (it would show data the product doesn't have);
  the hold is kept alive by the caption instead.
- **paper-title-card:** the accent word is coloured but not italic (Inter italic isn't embedded; a synthetic italic looks worse).
- **crane-rise-reveal KPI counter:** dropped — the requests page has no headline number to count up.
- **row-embed overflow mask:** at 1920 px the prototype's task table spills a truncated "Owner c…" column past its card;
  that thin strip is masked white so it doesn't read as a broken layout.
- **Group picker skipped:** the create shot dissolves from the click on "Select" to the real state after a group
  was chosen in the prototype's three-column picker (Raw Materials › Conductors › Copper Wire); the picker itself isn't shown.
- **No sound effects (S1/S4 not met):** Freesound answered HTTP 403 to every request from the cloud session, so
  the cut has music only. Cue list for adding them later is in README.md.
- **No beat-sync:** the music was chosen by the agent, not the user, and librosa isn't available here; cuts aren't pinned to beats.
