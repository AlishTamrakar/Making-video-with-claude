// Captures real UI textures + layout.json from the Material Management prototype.
// Usage: node scripts/capture.mjs  (run from material-promo/)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const URL = 'file://' + path.join(ROOT, 'source/material-management.html');
const OUT = path.join(ROOT, 'public/textures');
fs.mkdirSync(OUT, { recursive: true });
const VIEW = { width: 1920, height: 1080 };
const layout = {};

const settle = async (p, ms = 700) => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(ms); };
const box = async (loc) => { const b = await loc.boundingBox(); return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };

async function open(dsf) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: dsf });
  const p = await ctx.newPage();
  await p.goto(URL); await settle(p, 1200);
  return p;
}

const browser = await chromium.launch();

// 1) List page @3x (crane opens at 3x zoom)
{
  const p = await open(3);
  await p.screenshot({ path: `${OUT}/list@3x.png` });
  const rows = p.locator('tbody tr');
  const n = await rows.count();
  layout.list = { pageH: 1080, rows: [] };
  for (let i = 0; i < n; i++) {
    const r = rows.nth(i);
    layout.list.rows.push({ ...(await box(r)), text: (await r.innerText()).split('\n')[0] });
  }
  layout.list.table = await box(p.locator('table').first());
  layout.list.title = await box(p.getByText('Material Creation Requests', { exact: true }).last());
  layout.list.createBtn = await box(p.getByRole('button', { name: /Create new/ }));
  // design tokens from computed styles
  layout.tokens = await p.evaluate(() => {
    const cs = (el) => el && getComputedStyle(el);
    const btn = [...document.querySelectorAll('button')].find(b => /Create new/.test(b.innerText));
    const h1 = [...document.querySelectorAll('h1,h2')][0];
    return {
      font: cs(document.body).fontFamily,
      bodyBg: cs(document.body).backgroundColor,
      primary: cs(btn).backgroundColor,
      primaryRadius: cs(btn).borderRadius,
      ink: cs(h1).color, h1Size: cs(h1).fontSize, h1Weight: cs(h1).fontWeight,
      text: cs(document.querySelector('td')).color,
      border: cs(document.querySelector('td')).borderBottomColor,
    };
  });
  // logo + sidebar icon SVG for the outro
  layout.logoSvg = await p.evaluate(() => { const s = document.querySelector('aside svg, nav svg, svg'); return s ? s.outerHTML : null; });
  layout.reqIconSvg = await p.evaluate(() => {
    const a = [...document.querySelectorAll('aside a, aside button, nav a, nav button')].find(e => (e.getAttribute('aria-label') || e.title || '') === 'Material Creation Requests');
    return a && a.querySelector('svg') ? a.querySelector('svg').outerHTML : null;
  });
  await p.context().close();
}

// 2) Create-new drawer @3x (typing close-up runs at 2.4x zoom)
{
  const p = await open(3);
  await p.getByRole('button', { name: /Create new/ }).click(); await settle(p, 900);
  await p.screenshot({ path: `${OUT}/drawer@3x.png` });
  const name = p.getByPlaceholder(/CRGO Silicon Steel/).first();
  layout.drawer = {
    nameInput: await box(name),
    submit: await box(p.getByRole('button', { name: 'Submit' })),
    panel: await box(p.getByText('Add New Material').locator('xpath=ancestor::*[contains(@class,"fixed") or @role="dialog"][1]')).catch(() => null),
    title: await box(p.getByText('Add New Material')),
    placeholderColor: await name.evaluate(e => getComputedStyle(e, '::placeholder').color),
    inputColor: await name.evaluate(e => getComputedStyle(e).color),
    inputFont: await name.evaluate(e => { const c = getComputedStyle(e); return { size: c.fontSize, family: c.fontFamily, padL: c.paddingLeft, bg: c.backgroundColor }; }),
  };
  await p.context().close();
}

// 2b) Same drawer after picking a real group (Raw Materials > Conductors > Copper Wire) @3x,
//     then "Save as draft" and the queue it returns to @2x.
{
  const p = await open(3);
  await p.getByRole('button', { name: /Create new/ }).click(); await settle(p, 600);
  await p.getByPlaceholder(/CRGO Silicon Steel/).first().fill('Copper Busbar 100×10mm');
  await p.getByRole('button', { name: 'Select', exact: true }).first().click(); await settle(p, 500);
  const col = (i) => p.locator('.miller-col').nth(i);
  await col(0).getByText('Raw Materials', { exact: true }).click(); await p.waitForTimeout(300);
  await col(1).getByText('Conductors', { exact: true }).click(); await p.waitForTimeout(300);
  await col(2).getByText('Copper Wire', { exact: true }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Select Material Group' }).click(); await settle(p, 800);
  await p.mouse.move(5, 1075);
  await p.screenshot({ path: `${OUT}/drawer-filled@3x.png` });
  layout.drawer.groupSelect = await box(p.getByRole('button', { name: 'Select', exact: true }).first());
  layout.drawer.groupInput = await box(p.getByText('Raw Materials › Conductors › Copper Wire').first()).catch(() => null);
  layout.drawer.codeInput = await box(p.getByText('Material code').locator('xpath=following::input[1]'));
  layout.drawer.saveDraft = await box(p.getByRole('button', { name: 'Save as draft' }));
  await p.context().close();
}
{
  const p = await open(2);
  await p.getByRole('button', { name: /Create new/ }).click(); await settle(p, 600);
  await p.getByPlaceholder(/CRGO Silicon Steel/).first().fill('Copper Busbar 100×10mm');
  await p.getByRole('button', { name: 'Select', exact: true }).first().click(); await settle(p, 500);
  const col = (i) => p.locator('.miller-col').nth(i);
  await col(0).getByText('Raw Materials', { exact: true }).click(); await p.waitForTimeout(300);
  await col(1).getByText('Conductors', { exact: true }).click(); await p.waitForTimeout(300);
  await col(2).getByText('Copper Wire', { exact: true }).click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: 'Select Material Group' }).click(); await settle(p, 600);
  await p.getByRole('button', { name: 'Save as draft' }).click(); await settle(p, 900);
  await p.mouse.move(5, 1075);
  await p.screenshot({ path: `${OUT}/saved@2x.png` });
  layout.saved = { newRow: await box(p.locator('tbody tr').first()), toast: await box(p.getByText('Draft saved').locator('xpath=ancestor::*[contains(@class,"toast") or @role="status"][1]')).catch(() => null) };
  await p.context().close();
}

// 3) Request detail @2x (department tasks)
{
  const p = await open(2);
  await p.getByText('CRGO Silicon Steel').first().click(); await settle(p, 900);
  await p.screenshot({ path: `${OUT}/detail@2x.png` });
  const tasks = p.locator('.x-card').filter({ hasText: 'Department tasks' }).first().locator('tbody tr');
  const n = await tasks.count();
  layout.detail = { pageH: 1080, rows: [] };
  for (let i = 0; i < n; i++) layout.detail.rows.push({ ...(await box(tasks.nth(i))), text: (await tasks.nth(i).innerText()).split('\n')[0] });
  layout.detail.card = await box(p.locator('.x-card').filter({ hasText: 'Department tasks' }).first());
  layout.detail.activity = await box(p.getByText('Activity').first());
  await p.context().close();
}

await browser.close();
fs.writeFileSync(path.join(ROOT, 'public/layout.json'), JSON.stringify(layout, null, 2));
console.log(JSON.stringify({ ...layout, logoSvg: layout.logoSvg?.slice(0, 120), reqIconSvg: layout.reqIconSvg?.slice(0, 120) }, null, 1));
