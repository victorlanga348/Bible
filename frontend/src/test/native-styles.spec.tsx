import { useState, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Button } from '../shared/ui/button';
import { Input } from '../shared/ui/input';
import { Badge, EpistemicBadge, type EpistemicClassification } from '../shared/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shared/ui/dialog';
import { ReadingPreferences, type FontSizeOption, type ReaderWidthOption } from '../features/canon/reading-preferences';
import { ReaderView } from '../features/canon/reader-view';
import { ContextPanel } from '../features/assistant/context-panel';
import { StudyView } from '../features/studies/study-view';
import { SourcesView } from '../features/sources/sources-view';
import { HistoryView } from '../features/workspace/history-view';
import { CrossRefPanel } from '../features/cross-ref/cross-ref-panel';
import { request } from '../shared/api/http-client';
import { api } from '../shared/api/services';
import { ToastProvider } from '../shared/ui/toast';
import { ThemeProvider } from '../shared/hooks/use-theme';
import { AccountAccessProvider, AppShell, type NavTab } from '../shared/ui/shell';
import { studyFixture } from './workflow-fixtures';
import { analysisFixture } from './evidence-fixtures';
import excerpts from './fixtures/josephus-pg2848/excerpts.json';

// React under test is instrumented by Stryker. Chrome receives that rendered HTML
// plus the actual production CSS, not a separate unmutated application build.
// No model/DB integration claim: HTTP/session are identified technical doubles.
vi.mock('../shared/api/http-client', async importOriginal => ({
  ...await importOriginal<object>(), request: vi.fn(async (url: string) => {
    if (url.endsWith('/books')) return { books: [{ code: 'GEN', name: 'Gênesis', chapterCount: 50, order: 1 }] };
    if (url.endsWith('/verses')) return { ...studyFixture().passage, bookCode: 'GEN', chapter: 1, previousChapter: null, nextChapter: null };
    return { items: [], nextCursor: null };
  }),
}));
vi.mock('../shared/hooks/use-session', () => ({ useSession: () => ({ isAuthenticated: true, status: 'authenticated', ownerId: 'technical-owner', version: 1, token: 'technical-token', clearSession: vi.fn(), setSession: vi.fn() }) }));
let browser: Browser, page: Page, css: string;
const baseRequest = vi.mocked(request).getMockImplementation()!;
const clients: QueryClient[] = [];
beforeAll(async () => {
  let directory = process.cwd();
  while (!fs.existsSync(path.join(directory, '.git'))) {
    const parent = path.dirname(directory); if (parent === directory) throw new Error('Cannot identify workspace for the current CSS build'); directory = parent;
  }
  const assets = path.join(directory, 'frontend/dist/assets');
  const files = fs.readdirSync(assets).filter(name => name.endsWith('.css'));
  if (!files.length) throw new Error('Run the current frontend build before testing native styles');
  css = files.map(name => fs.readFileSync(path.join(assets, name), 'utf8')).join('\n');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  if (process.env.BIBLE_STYLE_REPORT === '1') {
    const sha = (value: string) => createHash('sha256').update(value).digest('hex');
    const report = { browserVersion: browser.version(), cssSha256: sha(css),
      cssSourceSha256: sha(fs.readFileSync(path.join(directory, 'frontend/src/index.css'), 'utf8').replaceAll('\r\n', '\n')),
      harnessSha256: sha(fs.readFileSync(path.join(directory, 'frontend/src/test/native-styles.spec.tsx'), 'utf8').replaceAll('\r\n', '\n')) };
    fs.mkdirSync(path.join(directory, 'frontend/reports'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'frontend/reports/native-style-environment.json'), JSON.stringify(report, null, 2) + '\n');
  }
  page = await browser.newPage();
  page.setDefaultTimeout(3000);
  await page.route('**/*', route => route.abort()); // Static local HTML/CSS only; no external fonts or providers.
}, 30000);
beforeEach(() => { vi.mocked(request).mockImplementation(baseRequest); vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }))); });
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; vi.unstubAllGlobals(); vi.restoreAllMocks(); });
afterAll(async () => { await browser?.close(); });
function mount(child: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client);
  return render(<QueryClientProvider client={client}><ToastProvider>{child}</ToastProvider></QueryClientProvider>);
}
async function publish(html: string, theme = 'light', width = 1280, height = 900) {
  await page.setViewportSize({ width, height }); await page.mouse.move(0, 0);
  await page.setContent(`<!doctype html><html class="${theme === 'dark' ? 'dark' : ''}"><head><style>${css}</style></head><body>${html}</body></html>`, { waitUntil: 'domcontentloaded' });
}
async function measure(selector: string) {
  return page.locator(selector).first().evaluate(element => {
    const style = getComputedStyle(element), bounds = element.getBoundingClientRect();
    const rgba = (value: string): number[] => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d')!; ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    let background = [255, 255, 255];
    const ancestors: Element[] = []; for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node);
    for (const node of ancestors) { const color = rgba(getComputedStyle(node).backgroundColor), alpha = color[3] / 255; background = background.map((value, i) => value * (1 - alpha) + color[i] * alpha); }
    const foreground = rgba(style.color);
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(v => { const n = v / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const light = luminance(background), ink = luminance(foreground);
    return { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y, display: style.display, position: style.position,
      font: parseFloat(style.fontSize), weight: Number(style.fontWeight), padding: parseFloat(style.paddingLeft), opacity: Number(style.opacity),
      background, rawBackground: style.backgroundColor, foreground, border: parseFloat(style.borderTopWidth), borderColor: style.borderTopColor, borderStyle: style.borderTopStyle,
      radius: parseFloat(style.borderTopLeftRadius), contrast: (Math.max(light, ink) + 0.05) / (Math.min(light, ink) + 0.05),
      clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
  });
}

it.each(['light', 'dark'])('keeps action variants legible with usable and ordered sizes in %s theme', async theme => {
  const { container } = render(<div>{(['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const).map(variant => <Button key={variant} data-testid={variant} variant={variant}>{variant}</Button>)}
    {(['sm', 'md', 'lg', 'icon'] as const).map(size => <Button key={size} data-testid={size} size={size}>{size === 'icon' ? '+' : 'Action'}</Button>)}</div>);
  await publish(container.innerHTML, theme); const body = await measure('body');
  for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'destructive']) {
    const value = await measure(`[data-testid=${variant}]`);
    expect(value.contrast, `${theme}/${variant} text contrast`).toBeGreaterThanOrEqual(4.5);
    expect(value.height).toBeGreaterThanOrEqual(24); expect(value.weight).toBeGreaterThan(body.weight);
    if (['primary', 'secondary', 'destructive'].includes(variant)) expect(value.background).not.toEqual(body.background);
    if (variant === 'outline') expect(value.border).toBeGreaterThan(0);
  }
  const sm = await measure('[data-testid=sm]'), md = await measure('[data-testid=md]'), lg = await measure('[data-testid=lg]'), icon = await measure('[data-testid=icon]');
  expect(sm.height).toBeLessThan(md.height); expect(md.height).toBeLessThan(lg.height); expect(sm.padding).toBeGreaterThan(0);
  expect(sm.padding).toBeLessThan(md.padding); expect(md.padding).toBeLessThan(lg.padding);
  expect(icon.width).toBeCloseTo(icon.height, 0); expect(icon.height).toBeGreaterThanOrEqual(24);
  for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'destructive']) {
    const selector = `[data-testid=${variant}]`, before = await measure(selector); await page.locator(selector).hover(); await page.waitForTimeout(180);
    expect((await measure(selector)).background).not.toEqual(before.background); await page.mouse.move(0, 0);
  }
}, 15000);

it.each(['light', 'dark'])('keeps input errors readable, icons clear of text, and disabled state visible in %s theme', async theme => {
  const { container } = render(<div style={{ width: 480 }}><Input data-testid="plain" /><Input data-testid="icon" icon /><Input data-testid="error" error="Technical validation error" /><Input data-testid="disabled" disabled /></div>);
  await publish(container.innerHTML, theme);
  const plain = await measure('[data-testid=plain]'), icon = await measure('[data-testid=icon]'), error = await measure('[data-testid=error]'), disabled = await measure('[data-testid=disabled]');
  expect(plain.width).toBeCloseTo(480, 0); expect(plain.padding).toBeGreaterThan(0); expect(plain.contrast).toBeGreaterThanOrEqual(4.5);
  expect(icon.padding).toBeGreaterThan(plain.padding); expect(disabled.opacity).toBeLessThan(plain.opacity);
  expect(error.borderColor).not.toEqual(plain.borderColor);
  const caption = await measure('p'); expect(caption.font).toBeLessThan(error.font); expect(caption.contrast).toBeGreaterThanOrEqual(4.5);
  const symbol = await page.locator('svg').boundingBox(); expect(symbol!.y + symbol!.height / 2).toBeGreaterThan(icon.y); expect(symbol!.y + symbol!.height / 2).toBeLessThan(icon.y + icon.height);
  await page.locator('[data-testid=plain]').focus();
  await page.waitForFunction(before => getComputedStyle(document.querySelector('[data-testid=plain]')!).borderTopColor !== before, plain.borderColor);
  expect((await measure('[data-testid=plain]')).borderColor).not.toEqual(plain.borderColor);
});

it.each(['light', 'dark'])('preserves distinct readable epistemic categories including a non-colour insufficiency cue in %s theme', async theme => {
  const kinds: EpistemicClassification[] = ['documented-fact', 'inference', 'tradition', 'hypothesis', 'insufficient-evidence', 'neutral'];
  const { container } = render(<>{kinds.map(kind => <Badge key={kind} data-testid={kind} classification={kind}>{kind}</Badge>)}<EpistemicBadge classification="documented-fact" /></>);
  await publish(container.innerHTML, theme); const body = await measure('body'), backgrounds = [];
  for (const kind of kinds) {
    const value = await measure(`[data-testid="${kind}"]`); backgrounds.push(value.background.join(','));
    expect(value.contrast, `${theme}/${kind} contrast`).toBeGreaterThanOrEqual(4.5); expect(value.background).not.toEqual(body.background);
    expect(value.font).toBeLessThan(body.font); expect(value.border).toBeGreaterThan(0); expect(value.radius).toBeGreaterThanOrEqual(value.height / 2);
  }
  expect(new Set(backgrounds).size).toBe(kinds.length);
  expect((await measure('[data-testid=insufficient-evidence]')).borderStyle).toBe('dashed');
  expect(screen.getByText('Fato Documentado')).toBeInTheDocument();
});

it.each([375, 1366])('keeps long authentic source dialogs readable and closeable at width %i', async width => {
  render(<Dialog open><DialogContent><DialogHeader><DialogTitle>Admitted source</DialogTitle><DialogDescription>Controlled local source display.</DialogDescription></DialogHeader><blockquote>{excerpts[0].text}</blockquote><DialogFooter><Button data-testid="cancel">Cancel</Button><Button data-testid="confirm">Confirm</Button></DialogFooter></DialogContent></Dialog>);
  document.querySelector('[data-state="open"]:not([role])')?.setAttribute('data-css-probe', 'backdrop');
  await publish(document.body.innerHTML, 'light', width, 900);
  const modal = await measure('[role=dialog]'), backdrop = await measure('[data-css-probe=backdrop]');
  expect(modal.x).toBeGreaterThanOrEqual(0); expect(modal.y).toBeGreaterThanOrEqual(0); expect(modal.y + modal.height).toBeLessThanOrEqual(900);
  expect(modal.clientWidth + 1).toBeGreaterThanOrEqual(modal.scrollWidth); expect(modal.x + modal.width / 2).toBeCloseTo(width / 2, 0);
  expect(backdrop.position).toBe('fixed'); expect(backdrop.width).toBe(width); expect(backdrop.height).toBe(900);
  const descriptionId = await page.getByRole('dialog').getAttribute('aria-describedby');
  const title = await measure('[role=dialog] h2'), description = await measure(`[id="${descriptionId}"]`);
  expect(title.font).toBeGreaterThan(description.font); expect(title.weight).toBeGreaterThan(description.weight); expect(title.contrast).toBeGreaterThan(description.contrast);
  expect(description.y).toBeGreaterThan(title.y + title.height);
  const cancel = await measure('[data-testid=cancel]'), confirm = await measure('[data-testid=confirm]');
  if (width < 640) expect(cancel.y).toBeGreaterThan(confirm.y); else expect(cancel.x).toBeLessThan(confirm.x);
  const close = await page.getByRole('button', { name: 'Fechar', exact: true }).boundingBox();
  expect(close!.x).toBeGreaterThan(modal.x + modal.width / 2); expect(close!.y).toBeLessThan(modal.y + modal.height / 4);
}, 15000);

it('makes reading preferences visibly selected and changes actual reading type and line width', async () => {
  function Preferences() { const [font, setFont] = useState<FontSizeOption>('md'), [width, setWidth] = useState<ReaderWidthOption>('normal'); return <ReadingPreferences fontSize={font} onFontSizeChange={setFont} readerWidth={width} onReaderWidthChange={setWidth} isFocusMode={false} onToggleFocusMode={() => {}} />; }
  const controls = render(<Preferences />);
  for (const chosen of ['SM', 'MD', 'LG', 'XL', 'Estreito', 'Padrão', 'Amplo']) {
    fireEvent.click(screen.getByRole('button', { name: chosen })); await publish(controls.container.innerHTML);
    const active = await page.getByRole('button', { name: chosen, exact: true }).evaluate(element => { const s = getComputedStyle(element); return { weight: Number(s.fontWeight), color: s.color, background: s.backgroundColor }; });
    const sibling = chosen.length === 2 ? (chosen === 'MD' ? 'SM' : 'MD') : (chosen === 'Padrão' ? 'Amplo' : 'Padrão');
    const inactive = await page.getByRole('button', { name: sibling, exact: true }).evaluate(element => { const s = getComputedStyle(element); return { weight: Number(s.fontWeight), color: s.color, background: s.backgroundColor }; });
    expect(active.weight).toBeGreaterThan(inactive.weight); expect(active.color).not.toBe(inactive.color); expect(active.background).not.toBe(inactive.background);
  }
  cleanup(); const reader = mount(<ReaderView onToggleFocusMode={() => {}} />); await screen.findByText(studyFixture().passage.verses[0].text.trim());
  const sizes: number[] = [];
  for (const size of ['SM', 'MD', 'LG', 'XL']) { fireEvent.click(screen.getByRole('button', { name: size })); await publish(reader.container.innerHTML); sizes.push((await measure('[aria-label^="Versículo 1."]')).font); }
  expect(sizes[0]).toBeLessThan(sizes[1]); expect(sizes[1]).toBeLessThan(sizes[2]); expect(sizes[2]).toBeLessThan(sizes[3]);
  const body = await measure('body'); expect(sizes[0]).toBeLessThan(body.font); expect(sizes[1]).toBeGreaterThan(body.font);
  const widths: number[] = [];
  for (const option of ['Estreito', 'Padrão', 'Amplo']) { fireEvent.click(screen.getByRole('button', { name: option })); await publish(reader.container.innerHTML); widths.push((await measure('body > div:first-child')).width); }
  expect(widths[0]).toBeLessThan(widths[1]); expect(widths[1]).toBeLessThan(widths[2]); expect(widths[2]).toBeLessThan(1280 * 0.9);
  const verse = screen.getByRole('button', { name: /^Versículo 1\./ });
  await publish(reader.container.innerHTML); const initial = await measure('[aria-label^="Versículo 1."]');
  fireEvent.click(verse); await publish(reader.container.innerHTML); const selected = await measure('[aria-label^="Versículo 1."]');
  expect(selected.background).not.toEqual(initial.background); expect(selected.weight).toBeGreaterThan(initial.weight);
  fireEvent.click(verse); await publish(reader.container.innerHTML);
  await page.locator('[aria-label^="Versículo 1."]').hover(); await page.waitForTimeout(180);
  expect((await measure('[aria-label^="Versículo 1."]')).background).not.toEqual(initial.background);
}, 20000);

it('keeps contextual tabs visually distinct and the panel footer at the available bottom', async () => {
  const { container } = mount(<ContextPanel />);
  for (const name of ['Assistente IA', 'Anotações', 'Referências']) {
    fireEvent.click(screen.getByRole('tab', { name })); await publish(`<main style="height:812px;width:375px">${container.innerHTML}</main>`, 'light', 375, 812);
    expect(await page.locator('[role=tab][aria-selected=true]').count()).toBe(1);
    const active = await measure('[role=tab][aria-selected=true]'), inactive = await measure('[role=tab][aria-selected=false]');
    expect(active.background).not.toEqual(inactive.background); expect(active.foreground).not.toEqual(inactive.foreground);
    expect(active.weight).toBeGreaterThan(inactive.weight);
    const panel = await measure('main > div:first-child'); expect(panel.height).toBeCloseTo(812, 0); expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth + 1);
  }
}, 15000);

it.each(['light', 'dark'])('keeps study caveats readable in %s theme', async theme => {
  const original = vi.mocked(request).getMockImplementation()!;
  vi.mocked(request).mockImplementation(async (url, options) => url.startsWith('/studies/') ? studyFixture({ limitations: ['Controlled local study limitation.'] }) : original(url, options));
  const { container } = mount(<StudyView activeStudyId="10000000-0000-4000-8000-000000000001" />);
  (await screen.findByText('Controlled local study limitation.')).setAttribute('data-css-probe', 'caveat');
  screen.getByText('Limitações do Estudo').setAttribute('data-css-probe', 'caveat-label');
  await publish(container.innerHTML, theme);
  const text = await measure('[data-css-probe=caveat]'), label = await measure('[data-css-probe=caveat-label]'), body = await measure('body');
  expect(text.contrast).toBeGreaterThanOrEqual(4.5); expect(label.contrast).toBeGreaterThanOrEqual(4.5);
  expect(text.foreground).not.toEqual(body.foreground); expect(text.background).not.toEqual(body.background); expect(label.weight).toBeGreaterThan(text.weight);
});

it.each(['sources', 'cross-reference', 'workspace'] as const)('keeps %s failures readable instead of using dark-theme ink on pale surfaces', async view => {
  const message = 'Controlled dependency failure for visual verification.';
  vi.spyOn(api, 'sources').mockRejectedValue(new Error(message));
  const original = vi.mocked(request).getMockImplementation()!;
  vi.mocked(request).mockImplementation(async (url, options) => url === '/cross-references' || url === '/workspace/studies' ? Promise.reject(new Error(message)) : original(url, options));
  const { container } = mount(view === 'sources' ? <SourcesView /> : view === 'cross-reference' ? <CrossRefPanel reference="GEN 1:1" /> : <HistoryView />);
  (await screen.findByText(message)).setAttribute('data-css-probe', 'failure'); await publish(container.innerHTML);
  const failure = await measure('[data-css-probe=failure]'), body = await measure('body');
  expect(failure.contrast).toBeGreaterThanOrEqual(4.5); expect(failure.foreground).not.toEqual(body.foreground); expect(failure.background).not.toEqual(body.background);
});

it('keeps the active workspace tab visually identifiable across all three views', async () => {
  const { container } = mount(<HistoryView />);
  const labels = [/Estudos Recentes/, /Anotações Pessoais/, /Favoritos/];
  for (let chosen = 0; chosen < labels.length; chosen++) {
    const tabs = labels.map(name => screen.getByRole('button', { name }));
    tabs.forEach((tab, index) => tab.setAttribute('data-css-probe', `history-${index}`));
    fireEvent.click(tabs[chosen]); await publish(container.innerHTML); const active = await measure(`[data-css-probe=history-${chosen}]`);
    for (let index = 0; index < labels.length; index++) if (index !== chosen) {
      const inactive = await measure(`[data-css-probe=history-${index}]`);
      expect(active.background).not.toEqual(inactive.background); expect(active.foreground).not.toEqual(inactive.foreground); expect(active.weight).toBeGreaterThan(inactive.weight);
    }
  }
});

it.each(['supported', 'insufficient-evidence'] as const)('uses the matching epistemic style for a %s analysis without altering its label', async status => {
  const original = vi.mocked(request).getMockImplementation()!;
  vi.mocked(request).mockImplementation(async (url, options) => url.endsWith('/ai-analyses') ? analysisFixture({ status, evidence: status === 'supported' ? analysisFixture().evidence : [] }) : original(url, options));
  const classification = status === 'supported' ? 'documented-fact' : 'insufficient-evidence';
  const { container } = mount(<><ContextPanel activeStudyId="10000000-0000-4000-8000-000000000001" activeStudyVersion={3} /><Badge data-css-probe="reference" classification={classification}>Style reference</Badge></>);
  fireEvent.change(screen.getByLabelText('Pergunta investigativa'), { target: { value: 'Technical visual check' } }); fireEvent.click(screen.getByRole('button', { name: 'Enviar pergunta' }));
  (await screen.findByText(status === 'supported' ? 'Evidência Documentada' : 'Evidência Insuficiente')).setAttribute('data-css-probe', 'actual');
  await publish(container.innerHTML); const actual = await measure('[data-css-probe=actual]'), reference = await measure('[data-css-probe=reference]');
  expect(actual.rawBackground).toEqual(reference.rawBackground); expect(actual.foreground).toEqual(reference.foreground);
});

it('keeps section availability and its epistemic styling consistent', async () => {
  vi.mocked(request).mockResolvedValue(studyFixture({ sections: [
    { kind: 'immediate-context', status: 'available', text: 'Controlled presentation fixture.', evidenceIds: [] },
    { kind: 'comparison', status: 'insufficient-evidence', text: 'Controlled missing evidence fixture.', evidenceIds: [] },
  ] }));
  const { container } = mount(<><StudyView activeStudyId="10000000-0000-4000-8000-000000000001" /><Badge classification="documented-fact" data-css-probe="fact">Reference fact</Badge><Badge classification="insufficient-evidence" data-css-probe="insufficient">Reference insufficiency</Badge></>);
  (await screen.findByText('Evidência Documentada')).setAttribute('data-css-probe', 'available'); screen.getByText('Evidência Insuficiente').setAttribute('data-css-probe', 'unavailable');
  await publish(container.innerHTML);
  for (const [actual, reference] of [['available', 'fact'], ['unavailable', 'insufficient']]) {
    expect((await measure(`[data-css-probe=${actual}]`)).foreground).toEqual((await measure(`[data-css-probe=${reference}]`)).foreground);
    expect((await measure(`[data-css-probe=${actual}]`)).rawBackground).toEqual((await measure(`[data-css-probe=${reference}]`)).rawBackground);
  }
});

it.each([375, 900, 1366])('keeps navigation, contextual access and content scrolling reachable at width %i', async width => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('max-width') && width < 1024, addEventListener() {}, removeEventListener() {} })));
  function ShellStory() {
    const [tab, setTab] = useState<NavTab>('reader'), [focus, setFocus] = useState(false), [context, setContext] = useState(width >= 1024);
    return <ThemeProvider><AccountAccessProvider><AppShell activeTab={tab} onTabChange={setTab} isFocusMode={focus} onToggleFocusMode={() => setFocus(value => !value)} isContextOpen={context} onToggleContext={() => setContext(value => !value)} contextPanel={<p>Technical contextual content.</p>}><button onClick={() => setFocus(value => !value)}>Toggle fixture focus</button>{Array.from({ length: 24 }, (_, index) => <p key={index} style={{ height: 48 }}>Technical scroll row {index}</p>)}</AppShell></AccountAccessProvider></ThemeProvider>;
  }
  const { container } = mount(<ShellStory />); await publish(container.innerHTML, 'light', width, 900);
  if (width < 1024) expect(await page.getByRole('button', { name: 'Abrir Painel Contextual de IA' }).isVisible()).toBe(true);
  expect(await page.getByRole('navigation', { name: 'Navegação Principal' }).isVisible()).toBe(width >= 1024);
  expect(await page.locator('header').isVisible()).toBe(width < 1024);
  const main = await measure('#main-content'); expect(main.width).toBeGreaterThan(width * (width >= 1024 ? 0.4 : 0.6));
  expect(main.x + main.width).toBeLessThanOrEqual(width + 1);
  const scroll = await page.locator('#main-content').evaluate(element => { element.scrollTop = element.scrollHeight; return element.scrollTop; }); expect(scroll).toBeGreaterThan(0);
  if (width >= 1024) {
    const panel = await measure('[role=complementary]'); expect(panel.width).toBeGreaterThan(width * 0.25); expect(panel.width).toBeLessThan(width * 0.4);
    fireEvent.click(screen.getByRole('button', { name: 'Fontes Históricas' })); await publish(container.innerHTML, 'light', width, 900);
    const active = await measure('[aria-current=page]'), inactive = await measure('[role=navigation] button:not([aria-current]):first-of-type');
    expect(active.background).not.toEqual(inactive.background); expect(active.foreground).not.toEqual(inactive.foreground); expect(active.weight).toBeGreaterThan(inactive.weight);
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Menu' })); await publish(container.innerHTML, 'light', width, 900);
    expect(await page.getByRole('button', { name: 'Bíblia', exact: true }).isVisible()).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar Menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Painel Contextual de IA' })); await publish(document.body.innerHTML, 'light', width, 900);
    expect(await page.getByRole('dialog').isVisible()).toBe(true);
    expect(await page.getByText('Technical contextual content.', { exact: true }).isVisible()).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  }
  fireEvent.click(screen.getByRole('button', { name: 'Toggle fixture focus' })); await publish(container.innerHTML, 'light', width, 900);
  expect(await page.getByRole('navigation', { name: 'Navegação Principal' }).count()).toBe(0); expect(await page.getByRole('complementary').count()).toBe(0);
  expect((await measure('#main-content')).width).toBeCloseTo(width, 0);
}, 15000);
