# Material Management — promo video

A ~27-second, 1920×1080 promo for the Material Management ERP prototype, made with the
`video-shotcraft` skill (autonomous mode) and [Remotion](https://www.remotion.dev).
The plan, storyboard and design tokens are in [DESIGN.md](DESIGN.md).

## Render

```bash
npm install
npx remotion render src/index.ts MaterialPromo out/promo.mp4
npx remotion render src/index.ts MaterialPromo out/promo-nobgm.mp4 --props=props-nobgm.json
```

Preview and tweak in the browser with `npx remotion studio src/index.ts`.
In a cloud session without a downloadable Chrome, add
`--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.

## Re-capture the product screens

The textures in `public/textures/` and the coordinates in `public/layout.json` come from
`source/material-management.html`. To update them after changing the prototype:

```bash
node scripts/capture.mjs
```

(If Playwright is installed globally, prefix the command with `PW=$(npm root -g)/playwright`.)

## Edit text

- Timeline, captions and title-card wording: `src/Main.tsx` (`SHOTS`, `CAPTIONS`, `TITLE_CARDS`).
- Opener headline: `src/scenes/Open.tsx`. Outro wordmark: `src/scenes/Outro.tsx`.
- Colours and font: `src/tokens.ts` (taken from the prototype's own styles).

## Audio

- Music: "House Vibez" by Lily J (Mixkit free license, commercial use, no credit required). See `public/audio/ATTRIBUTION.md`.
- Sound effects: none yet. Freesound refused downloads from the cloud session (HTTP 403). To add them, put
  CC0 files in `public/audio/sfx/` and list them in `SFX` in `src/Main.tsx` (`{ from, src, volume, note }`, with
  `from` written as `SHOTS.<shot>.from + offset`). Suggested cues: a soft swoosh on each title card, a slow whoosh
  on the crane rise (`SHOTS.queue.from + 24`), keyboard typing for the material name (`SHOTS.create.from + 10`, ~66
  frames), a mouse click on Submit (`SHOTS.create.from + 116`), and a swish plus soft impact on the logo flip
  (`SHOTS.outro.from + 34` / `+ 46`).

Remotion has its own license: free for individuals and small teams, while larger companies may need a paid licence.
