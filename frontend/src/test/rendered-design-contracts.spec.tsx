// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { chromium, type Browser, type Page } from '@playwright/test';
import { build } from 'vite';
import tailwind from '@tailwindcss/vite';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Badge, EpistemicBadge } from '../shared/ui/badge';
import { Button, type ButtonProps } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { AccountAccessProvider, AppShell, type NavTab } from '../shared/ui/shell';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shared/ui/dialog';
import { Skeleton } from '../shared/ui/skeleton';
import { ToastProvider, useToast, type ToastType } from '../shared/ui/toast';
import { AnalysisResult } from '../features/assistant/analysis-result';
import { StudyView } from '../features/studies/study-view';
import { analysisFixture, studyFixture } from './workflow-fixtures';

let authenticated = false;
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: authenticated,
  status: authenticated ? 'authenticated' : 'anonymous', clearSession: vi.fn(), setSession: vi.fn() }) }));

// Actual browser/CSS presentation contracts from S09/SPEC sections 1 and 3.
// React components execute in the Vitest process (including Stryker instrumentation).
// This is not application/API/database/model integration and does not assert class lists.
let browser: Browser | undefined, page: Page, css: string;
const sha = (value: string) => createHash('sha256').update(value).digest('hex');
function sources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected source link in CSS compilation');
    return entry.isDirectory() ? sources(file) : /\.(?:tsx?|css)$/.test(file) ? [file] : [];
  }).sort();
}
beforeAll(async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  const files = ['package-lock.json', 'index.html', ...sources('src')];
  const fingerprint = sha(process.version + files.map(file => file + '\0' + readFileSync(file, 'utf8').replaceAll('\r\n', '\n')).join('\0'));
  const directory = resolve('reports/rendering'); mkdirSync(directory, { recursive: true });
  // Compilation cache only: exact inputs and PID; never stores mutation statuses or assertions.
  const cache = join(directory, `css-${fingerprint}-${process.pid}.json`);
  if (existsSync(cache)) {
    const saved = JSON.parse(readFileSync(cache, 'utf8'));
    if (typeof saved.css !== 'string' || saved.fingerprint !== fingerprint || sha(saved.css) !== saved.sha256) throw new Error('Corrupt CSS compilation cache');
    css = saved.css;
  } else {
    const result = await build({ configFile: false, logLevel: 'warn', plugins: [tailwind()], build: {
      write: false, cssMinify: false, rollupOptions: { input: resolve('src/index.css') },
    } });
    css = (Array.isArray(result) ? result : [result]).flatMap(bundle => {
      if (!('output' in bundle)) throw new Error('CSS compilation must finish without watch mode');
      return bundle.output.flatMap(asset => asset.type === 'asset' && asset.fileName.endsWith('.css') ? [String(asset.source)] : []);
    }).join('\n');
    if (!css) throw new Error('Actual compiled stylesheet required');
    writeFileSync(cache, JSON.stringify({ fingerprint, sha256: sha(css), css }) + '\n');
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  page = await browser.newPage(); page.setDefaultTimeout(5000);
  writeFileSync(join(directory, `browser-${process.pid}.json`), JSON.stringify({ at: new Date().toISOString(),
    scope: 'SSR components and actual compiled CSS only; not application or model integration',
    engine: browser.version(), node: process.version, fingerprint, cssSha256: sha(css), sourceFiles: files.length }, null, 2) + '\n');
}, 60000);
afterEach(async () => { cleanup(); localStorage.clear(); document.documentElement.className = ''; authenticated = false;
  if (page) await page.setViewportSize({ width: 1280, height: 720 }); });
afterAll(async () => { try { await browser?.close(); } finally { vi.unstubAllGlobals(); } });

async function mount(node: ReactNode, dark = false) {
  await markup(renderToStaticMarkup(node), dark);
}
async function markup(body: string, dark = false) {
  await page.setContent(`<!doctype html><html class="${dark ? 'dark' : ''}"><head><style>${css}</style></head><body>${body}</body></html>`);
  // A parsed-but-ignored stylesheet must fail, even if actual/reference defaults happen to match.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase())).toBe(dark ? '#8db9a8' : '#315f58');
}
async function clientSnapshot() { await markup(document.body.innerHTML, document.documentElement.classList.contains('dark')); }
function shell(tab: NavTab = 'reader', open = true) {
  return <ThemeProvider><AccountAccessProvider><AppShell activeTab={tab} onTabChange={() => {}} isContextOpen={open} contextPanel={<p>Technical context content</p>}>
    <p>Technical main content</p></AppShell></AccountAccessProvider></ThemeProvider>;
}
async function presentation(selector: string) {
  return page.evaluate(selector => {
    const element = document.querySelector(selector); if (!element) return null;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { color: style.color, background: style.backgroundColor, border: style.borderColor, borderWidth: style.borderTopWidth,
      borderStyle: style.borderTopStyle, radius: style.borderRadius, display: style.display, opacity: style.opacity,
      position: style.position, flexDirection: style.flexDirection, justifyContent: style.justifyContent, overflowY: style.overflowY,
      fontWeight: style.fontWeight, animation: style.animationName, animationDuration: style.animationDuration,
      rect: { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      cursor: style.cursor, fontSize: parseFloat(style.fontSize), paddingLeft: parseFloat(style.paddingLeft), paddingTop: parseFloat(style.paddingTop),
      width: parseFloat(style.width), height: parseFloat(style.height), disabled: element.matches(':disabled'), text: element.textContent,
      icons: (element.tagName === 'INPUT' ? element.parentElement : element)?.querySelectorAll('svg').length };
  }, selector);
}
const classifications = [
  ['documented-fact', 'fact', 'Fato Documentado'], ['inference', 'inference', 'Inferência Hermenêutica'],
  ['tradition', 'tradition', 'Tradição Histórica'], ['hypothesis', 'hypothesis', 'Hipótese Debatida'],
  ['insufficient-evidence', 'insufficient', 'Evidência Insuficiente'], ['neutral', 'neutral', 'Geral'],
] as const;
it.each(classifications)('keeps the %s classification readable and visually distinct in both themes', async (classification, token, label) => {
  for (const dark of [false, true]) {
    const background = token === 'neutral' ? 'var(--surface-muted)' : `var(--epistemic-${token}-bg)`;
    const color = token === 'neutral' ? 'var(--foreground-muted)' : `var(--epistemic-${token}-text)`;
    const borderColor = token === 'neutral' ? 'var(--border)' : `var(--epistemic-${token}-border)`;
    await mount(<><div id="actual"><EpistemicBadge classification={classification} /></div><span id="reference" style={{ background, color, borderColor }} /></>, dark);
    const actual = await presentation('#actual > span'), reference = await presentation('#reference');
    expect(actual).toMatchObject({ text: label, background: reference?.background, color: reference?.color, border: reference?.border,
      display: 'inline-flex', borderWidth: '1px', borderStyle: classification === 'insufficient-evidence' ? 'dashed' : 'solid' });
  }
});
it('renders an unclassified badge neutrally and preserves a caller color override', async () => {
  await mount(<><Badge id="default">Technical neutral label</Badge><Badge id="override" className="text-[var(--accent)]">Technical override</Badge>
    <span id="reference" style={{ color: 'var(--foreground-muted)', background: 'var(--surface-muted)' }} /><span id="accent" style={{ color: 'var(--accent)' }} /></>);
  const normal = await presentation('#default'), reference = await presentation('#reference');
  expect(normal).toMatchObject({ color: reference?.color, background: reference?.background, text: 'Technical neutral label' });
  expect((await presentation('#override'))?.color).toBe((await presentation('#accent'))?.color);
});
it.each(['supported', 'insufficient-evidence', 'restricted'] as const)('maps the technical %s analysis DTO to the correct epistemic signal', async status => {
  // Rendering-only protocol case; this fixture explicitly disclaims real inference.
  const token = status === 'supported' ? 'fact' : 'insufficient';
  await mount(<><div id="analysis"><AnalysisResult analysis={{ ...analysisFixture(), status }} /></div>
    <span id="reference" style={{ color: `var(--epistemic-${token}-text)`, background: `var(--epistemic-${token}-bg)` }} /></>);
  expect(await presentation('#analysis article > span')).toMatchObject({ color: (await presentation('#reference'))?.color, background: (await presentation('#reference'))?.background });
});
it('distinguishes documented canonical context from an unsupported study section visually', async () => {
  authenticated = true;
  const study = studyFixture({ sections: [
    { kind: 'immediate-context', status: 'available', text: 'Technical presentation of the supplied canonical passage.', evidenceIds: [] },
    { kind: 'history-culture', status: 'insufficient-evidence', text: 'No historical assertion is made by this technical case.', evidenceIds: [] },
  ] });
  await mount(<ToastProvider><div id="study"><StudyView study={study} onGenerate={() => {}} /></div>
    <span id="documented" style={{ color: 'var(--epistemic-fact-text)' }} /><span id="insufficient" style={{ color: 'var(--epistemic-insufficient-text)' }} /></ToastProvider>);
  const sections = await page.locator('#study section').count(); expect(sections).toBe(2);
  expect((await presentation('#study section:nth-of-type(1) > div > span'))?.color).toBe((await presentation('#documented'))?.color);
  expect((await presentation('#study section:nth-of-type(2) > div > span'))?.color).toBe((await presentation('#insufficient'))?.color);
});
const variants: { variant: ButtonProps['variant']; background: string; color: string }[] = [
  { variant: undefined, background: 'var(--accent)', color: 'var(--accent-foreground)' },
  { variant: 'secondary', background: 'var(--surface-muted)', color: 'var(--foreground)' },
  { variant: 'outline', background: 'transparent', color: 'var(--foreground)' },
  { variant: 'ghost', background: 'transparent', color: 'var(--foreground-muted)' },
  { variant: 'destructive', background: 'color-mix(in oklab, var(--color-rose-900) 20%, transparent)', color: 'var(--color-rose-400)' },
];
it.each(variants)('keeps the $variant button action legible in its intended visual state', async ({ variant, background, color }) => {
  await mount(<><Button id="actual" variant={variant}>Ação técnica</Button><span id="reference" style={{ background, color }} /></>);
  const actual = await presentation('#actual'), reference = await presentation('#reference');
  expect(actual).toMatchObject({ text: 'Ação técnica', background: reference?.background, color: reference?.color, display: 'inline-flex', fontSize: 14, radius: '6px', disabled: false });
  if (variant === 'outline') expect(actual?.borderWidth).toBe('1px');
});
it.each([
  ['sm', 12.8, 12, 5.6], ['md', 14, 16, 8], ['lg', 16, 20, 10.4], ['icon', 16, 0, 0],
] as const)('preserves the %s action size and usable spacing', async (size, fontSize, paddingLeft, paddingTop) => {
  await mount(<Button id="actual" size={size} aria-label="Technical action">A</Button>);
  const actual = await presentation('#actual');
  expect(actual?.paddingLeft).toBeCloseTo(paddingLeft); expect(actual?.paddingTop).toBeCloseTo(paddingTop);
  if (size === 'icon') { expect(actual?.width).toBe(36); expect(actual?.height).toBe(36); }
  else expect(actual?.fontSize).toBeCloseTo(fontSize);
});
it.each([false, true])('shows a disabled action honestly when loading=%s', async loading => {
  await mount(<Button id="actual" disabled={!loading} loading={loading}>Technical pending action</Button>);
  expect(await presentation('#actual')).toMatchObject({ disabled: true, opacity: '0.5', cursor: 'not-allowed', icons: loading ? 1 : 0 });
});
it.each([false, true])('keeps input text clear of the optional search icon=%s', async icon => {
  await mount(<Input id="actual" icon={icon} aria-label="Technical search" />);
  expect(await presentation('#actual')).toMatchObject({ paddingLeft: icon ? 36 : 14, icons: icon ? 1 : 0, borderWidth: '1px', radius: '6px' });
});
it('presents invalid input with its linked error, preserves the danger border on focus and shows disabled affordance', async () => {
  await mount(<><Input id="actual" error="Technical validation error" /><span id="reference" style={{ color: 'color-mix(in oklab, var(--color-rose-500) 70%, transparent)' }} />
    <span id="focused" style={{ color: 'var(--color-rose-500)' }} /><Input id="disabled" disabled /></>);
  expect((await presentation('#actual'))?.border).toBe((await presentation('#reference'))?.color);
  expect(await page.locator('#actual').getAttribute('aria-invalid')).toBe('true');
  expect(await page.locator('#actual').getAttribute('aria-describedby')).toBe('actual-error');
  expect(await page.locator('#actual-error').textContent()).toBe('Technical validation error');
  await page.focus('#actual');
  // Sample the actual declared end state, independently of background-frame scheduling.
  await page.locator('#actual').evaluate(element => {
    getComputedStyle(element).getPropertyValue('border-color');
    for (const transition of element.getAnimations()) transition.finish();
  });
  expect((await presentation('#actual'))?.border).toBe((await presentation('#focused'))?.color);
  expect(await presentation('#disabled')).toMatchObject({ disabled: true, opacity: '0.5', cursor: 'not-allowed' });
});
it.each(['reader', 'study', 'sources', 'history'] as const)('visually identifies only the active %s destination', async tab => {
  localStorage.setItem('biblia-app-theme', 'light');
  render(<>{shell(tab)}<span id="reference" style={{ position: 'fixed', color: 'var(--foreground)', background: 'var(--surface-muted)' }} />
    <span id="accent" style={{ position: 'fixed', color: 'var(--accent)' }} /><span id="muted" style={{ position: 'fixed', color: 'var(--foreground-muted)' }} /></>);
  await clientSnapshot();
  const active = '[role="navigation"][aria-label="Navegação Principal"] button[aria-current="page"]';
  expect(await presentation(active)).toMatchObject({ color: (await presentation('#reference'))?.color,
    background: (await presentation('#reference'))?.background, fontWeight: '600', icons: 2 });
  expect((await presentation(`${active} svg`))?.color).toBe((await presentation('#accent'))?.color);
  expect(await presentation('[role="navigation"][aria-label="Navegação Principal"] button:not([aria-current])')).toMatchObject({
    color: (await presentation('#muted'))?.color, background: 'rgba(0, 0, 0, 0)', icons: 1 });
});
it.each(['light', 'dark'] as const)('retains an explicitly saved %s theme despite the opposite system preference', async theme => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(prefers-color-scheme: light)' && theme === 'dark' })));
  localStorage.setItem('biblia-app-theme', theme); render(shell());
  expect(document.documentElement.classList.contains('dark')).toBe(theme === 'dark'); await clientSnapshot();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase())).toBe(theme === 'dark' ? '#8db9a8' : '#315f58');
});
it.each([false, true])('uses the actual system preference when no valid theme is stored: light=%s', async light => {
  localStorage.setItem('biblia-app-theme', 'invalid-technical-preference');
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === '(prefers-color-scheme: light)' && light })));
  render(shell()); expect(document.documentElement.classList.contains('dark')).toBe(!light); await clientSnapshot();
});
it.each([false, true])('preserves desktop reading width with contextual panel open=%s', async open => {
  await page.setViewportSize({ width: 1280, height: 720 }); localStorage.setItem('biblia-app-theme', 'light');
  render(shell('reader', open)); await clientSnapshot();
  expect((await presentation('main'))?.width).toBe(open ? 608 : 1024);
  if (open) expect(await presentation('aside[aria-label="Painel de Investigação e IA"]')).toMatchObject({ display: 'flex', width: 416 });
  else expect(await presentation('aside[aria-label="Painel de Investigação e IA"]')).toBeNull();
});
it('opens mobile context in place of the reader and restores the entire reading width when closed', async () => {
  await page.setViewportSize({ width: 393, height: 851 }); localStorage.setItem('biblia-app-theme', 'light'); render(shell('reader', false));
  await clientSnapshot(); expect((await presentation('main'))?.width).toBe(393);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' })); await clientSnapshot();
  expect((await presentation('main'))?.display).toBe('none');
  expect(await presentation('aside[aria-label="Painel de Investigação e IA"]')).toMatchObject({ display: 'flex', width: 393 });
  fireEvent.click(screen.getByRole('button', { name: 'Fechar Painel Contextual de IA' })); await clientSnapshot();
  expect((await presentation('main'))?.width).toBe(393); expect(await presentation('aside[aria-label="Painel de Investigação e IA"]')).toBeNull();
  await page.setViewportSize({ width: 1280, height: 720 });
});
it.each([false, true])('communicates the technical session presentation honestly when active=%s', async active => {
  authenticated = active; localStorage.setItem('biblia-app-theme', 'light');
  render(<>{shell()}<span id="status-reference" style={{ position: 'fixed', background: `var(--color-${active ? 'emerald' : 'amber'}-400)` }} /></>);
  const label = screen.getByText(active ? 'Sessão Ativa' : 'Sem sessão'); label.previousElementSibling!.setAttribute('data-testid', 'session-signal');
  await clientSnapshot();
  expect((await presentation('[data-testid="session-signal"]'))?.background).toBe((await presentation('#status-reference'))?.background);
  const control = await page.locator(`button[aria-label="${active ? 'Gerir conta' : 'Entrar na conta'}"]`).getAttribute('title');
  expect(control).toBe(active ? 'Gerir conta' : 'Entrar na conta');
});
it.each([393, 1280])('keeps a long dialog and its close control within a %spx viewport', async width => {
  await page.setViewportSize({ width, height: 720 });
  render(<Dialog open><span id="overlay-reference" style={{ background: 'color-mix(in oklab, var(--color-black) 60%, transparent)' }} /><DialogContent><DialogHeader data-testid="modal-header"><DialogTitle>Technical modal title</DialogTitle>
    <DialogDescription>Technical modal description</DialogDescription></DialogHeader>
    <div>{Array.from({ length: 60 }, (_, index) => <p key={index}>Technical long-content row {index}</p>)}</div>
    <DialogFooter data-testid="modal-footer"><Button data-testid="cancel-action">Cancelar</Button><Button data-testid="confirm-action">Confirmar</Button></DialogFooter>
  </DialogContent></Dialog>);
  await clientSnapshot(); const modal = await presentation('[role="dialog"]'), close = await presentation('[role="dialog"] > button:last-child');
  expect(modal).toMatchObject({ position: 'fixed', display: 'grid', overflowY: 'auto', borderWidth: '1px', radius: '8px' });
  expect(await presentation('[data-state="open"]:not([role])')).toMatchObject({ position: 'fixed', width, height: 720, background: (await presentation('#overlay-reference'))?.background });
  expect(modal!.rect.width).toBeCloseTo(Math.min(width * 0.92, 576), 1); expect(modal!.rect.height).toBeLessThanOrEqual(688);
  expect(modal!.rect.x).toBeGreaterThanOrEqual(0); expect(modal!.rect.right).toBeLessThanOrEqual(width); expect(modal!.rect.y).toBeGreaterThanOrEqual(0);
  expect(close!.rect.y).toBeGreaterThanOrEqual(0); expect(close!.rect.right).toBeLessThanOrEqual(width);
  expect(await presentation('[data-testid="modal-header"]')).toMatchObject({ display: 'flex', flexDirection: 'column' });
  expect((await presentation('[role="dialog"] h2'))?.fontSize).toBe(20); expect((await presentation('[role="dialog"] p'))?.fontSize).toBe(14);
  expect(await presentation('[data-testid="modal-footer"]')).toMatchObject({ display: 'flex', flexDirection: width < 640 ? 'column-reverse' : 'row' });
  await page.setViewportSize({ width: 1280, height: 720 });
});
it('shows a visible, gently animated skeleton in the supplied loading footprint', async () => {
  await mount(<><Skeleton id="actual" className="w-[7rem] h-[1.25rem]" /><span id="reference" style={{ background: 'color-mix(in oklab, var(--surface-muted) 80%, transparent)' }} /></>);
  expect(await presentation('#actual')).toMatchObject({ width: 112, height: 20, background: (await presentation('#reference'))?.background,
    animation: 'pulse', animationDuration: '2s', radius: '4px' });
});
function ToastActions() {
  const { toast } = useToast();
  return <>{(['success', 'warning', 'error', 'info'] as ToastType[]).map(type => <button key={type} onClick={() => toast(`Technical ${type}`, { type, description: `Technical ${type} description` })}>{type}</button>)}</>;
}
it.each([['success', 'emerald'], ['warning', 'amber'], ['error', 'rose'], ['info', 'sky']] as const)('keeps the %s notification signal distinct and its description readable', async (type, color) => {
  render(<ToastProvider><ToastActions /><span id="signal-reference" style={{ color: `var(--color-${color}-400)` }} />
    <span id="description-reference" style={{ color: 'var(--foreground-muted)' }} /></ToastProvider>);
  fireEvent.click(screen.getByRole('button', { name: type })); const title = await screen.findByText(`Technical ${type}`);
  const root = title.closest('li')!; root.setAttribute('data-testid', 'current-toast');
  const description = screen.getByText(`Technical ${type} description`); description.setAttribute('data-testid', 'current-description');
  await clientSnapshot();
  expect((await presentation('[data-testid="current-toast"] > svg'))?.color).toBe((await presentation('#signal-reference'))?.color);
  expect(await presentation('[data-testid="current-toast"]')).toMatchObject({ display: 'flex', borderWidth: '1px', radius: '6px', paddingLeft: 16 });
  expect(await presentation('[data-testid="current-description"]')).toMatchObject({ color: (await presentation('#description-reference'))?.color, fontSize: 12.8 });
});
