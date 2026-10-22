export type SectionKind = 'immediate-context' | 'book-argument' | 'history-culture' | 'authorship-audience-purpose' | 'comparison' | 'interpretations';
export type SectionStatus = 'available' | 'insufficient-evidence';
export type Classification = 'documented-fact' | 'inference' | 'tradition' | 'hypothesis';
export type Permission = 'allowed' | 'pending' | 'denied';
export type Availability = 'available' | 'restricted' | 'missing';
export interface RightsSnapshot { readonly ingest: Permission; readonly store: Permission; readonly index: Permission; readonly display: Permission; readonly quote: Permission; readonly sendToAi: Permission }
export interface EvidenceProps {
  readonly excerptId: string; readonly sourceId: string; readonly locator: string; readonly quote: string; readonly textSha256: string;
  readonly attribution: string; readonly rightsStatement: string; readonly rightsUrl: string; readonly rightsSnapshot: RightsSnapshot;
}
export interface SectionProps { readonly kind: SectionKind; readonly status: SectionStatus; readonly text: string; readonly evidenceIds: readonly string[] }
export interface InterpretationProps { readonly classification: Classification; readonly text: string; readonly evidenceIds: readonly string[] }
export interface StudyReference { readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly fromVerse: number; readonly toVerse: number; readonly normalized: string }
export interface PassageText { readonly verses: readonly { readonly number: number; readonly text: string }[]; readonly attribution: string; readonly licenseUrl: string }
export interface StudyContent {
  readonly reference: StudyReference; readonly passage: PassageText; readonly sections: readonly SectionProps[];
  readonly evidence: readonly EvidenceProps[]; readonly interpretations: readonly InterpretationProps[]; readonly limitations: readonly string[];
}
export interface StudyProps { readonly id: string; readonly ownerId: string; readonly version: number; readonly createdAt: string; readonly content: StudyContent }
export interface EvidenceView extends Omit<EvidenceProps, 'quote'> { readonly quote: string | null; readonly availability: Availability }
export interface StudyView extends Omit<StudyContent, 'evidence'> { readonly id: string; readonly version: number; readonly createdAt: string; readonly evidence: readonly EvidenceView[] }
export class StudyDomainError extends Error {}

function requireValue(condition: boolean): asserts condition { if (!condition) throw new StudyDomainError('Invalid study value'); }
function text(value: string): void { requireValue(typeof value === 'string' && value.trim().length > 0); }
function identity(value: string): void { text(value); requireValue(value === value.trim() && /^[a-z0-9][a-z0-9-]*$/.test(value)); }
function positive(value: number): void { requireValue(Number.isSafeInteger(value) && value > 0); }
function webUrl(value: string): void { text(value); requireValue(URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol)); }
function evidenceIds(values: readonly string[]): readonly string[] {
  requireValue(Array.isArray(values)); values.forEach(identity);
  requireValue(new Set(values).size === values.length);
  return Object.freeze([...values]);
}

export class Evidence implements EvidenceProps {
  readonly excerptId: string; readonly sourceId: string; readonly locator: string; readonly quote: string; readonly textSha256: string;
  readonly attribution: string; readonly rightsStatement: string; readonly rightsUrl: string; readonly rightsSnapshot: RightsSnapshot;
  constructor(input: EvidenceProps) {
    identity(input.excerptId); identity(input.sourceId);
    [input.locator, input.quote, input.attribution, input.rightsStatement].forEach(text); webUrl(input.rightsUrl);
    requireValue(typeof input.textSha256 === 'string' && input.textSha256.length === 64 && /^[a-fA-F0-9]{64}$/.test(input.textSha256));
    const rights = input.rightsSnapshot;
    requireValue(rights !== null && typeof rights === 'object');
    for (const key of ['ingest', 'store', 'index', 'display', 'quote', 'sendToAi'] as const) requireValue(['allowed', 'pending', 'denied'].includes(rights[key]));
    requireValue(rights.store === 'allowed' && rights.display === 'allowed' && rights.quote === 'allowed');
    this.excerptId = input.excerptId; this.sourceId = input.sourceId; this.locator = input.locator; this.quote = input.quote; this.textSha256 = input.textSha256;
    this.attribution = input.attribution; this.rightsStatement = input.rightsStatement; this.rightsUrl = input.rightsUrl;
    this.rightsSnapshot = Object.freeze({ ingest: rights.ingest, store: rights.store, index: rights.index, display: rights.display, quote: rights.quote, sendToAi: rights.sendToAi });
    Object.freeze(this);
  }
}
export class StudySection implements SectionProps {
  readonly kind: SectionKind; readonly status: SectionStatus; readonly text: string; readonly evidenceIds: readonly string[];
  constructor(input: SectionProps) {
    requireValue(['immediate-context', 'book-argument', 'history-culture', 'authorship-audience-purpose', 'comparison', 'interpretations'].includes(input.kind));
    requireValue(['available', 'insufficient-evidence'].includes(input.status)); text(input.text);
    this.evidenceIds = evidenceIds(input.evidenceIds);
    requireValue(input.kind === 'immediate-context' || input.status !== 'available' || this.evidenceIds.length > 0);
    this.kind = input.kind; this.status = input.status; this.text = input.text;
    Object.freeze(this);
  }
}
export class Interpretation implements InterpretationProps {
  readonly classification: Classification; readonly text: string; readonly evidenceIds: readonly string[];
  constructor(input: InterpretationProps) {
    requireValue(['documented-fact', 'inference', 'tradition', 'hypothesis'].includes(input.classification)); text(input.text);
    this.evidenceIds = evidenceIds(input.evidenceIds);
    requireValue(input.classification !== 'documented-fact' || this.evidenceIds.length > 0);
    this.classification = input.classification; this.text = input.text;
    Object.freeze(this);
  }
}
export class Study implements StudyProps {
  readonly id: string; readonly ownerId: string; readonly version: number; readonly createdAt: string; readonly content: StudyContent;
  constructor(input: StudyProps) {
    text(input.id); requireValue(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.id) && input.id.length === 36);
    text(input.ownerId); requireValue(input.ownerId === input.ownerId.trim() && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(input.ownerId)); positive(input.version);
    text(input.createdAt); requireValue(Number.isFinite(Date.parse(input.createdAt)) && new Date(input.createdAt).toISOString() === input.createdAt);
    const content = input.content; const ref = content.reference;
    identity(ref.translationId); requireValue(typeof ref.bookCode === 'string' && ref.bookCode.length === 3 && /^[A-Z0-9]{3}$/.test(ref.bookCode));
    [ref.chapter, ref.fromVerse, ref.toVerse].forEach(positive); requireValue(ref.toVerse >= ref.fromVerse);
    const normalized = `${ref.bookCode} ${ref.chapter}:${ref.fromVerse}${ref.fromVerse === ref.toVerse ? '' : `-${ref.toVerse}`}`;
    requireValue(ref.normalized === normalized);
    const passage = content.passage; text(passage.attribution); webUrl(passage.licenseUrl);
    requireValue(Array.isArray(passage.verses) && passage.verses.length === ref.toVerse - ref.fromVerse + 1);
    const verses = passage.verses.map((verse, index) => { requireValue(verse.number === ref.fromVerse + index); text(verse.text); return Object.freeze({ number: verse.number, text: verse.text }); });
    requireValue(Array.isArray(content.evidence) && Array.isArray(content.sections) && Array.isArray(content.interpretations) && Array.isArray(content.limitations));
    const evidence = content.evidence.map(row => new Evidence(row)); const ids = new Set(evidence.map(row => row.excerptId));
    requireValue(ids.size === evidence.length);
    const sections = content.sections.map(row => new StudySection(row));
    requireValue(sections.length === 6 && new Set(sections.map(row => row.kind)).size === 6);
    const interpretations = content.interpretations.map(row => new Interpretation(row));
    for (const row of [...sections, ...interpretations]) requireValue(row.evidenceIds.every(id => ids.has(id)));
    content.limitations.forEach(text);
    this.id = input.id; this.ownerId = input.ownerId; this.version = input.version; this.createdAt = input.createdAt;
    this.content = Object.freeze({ reference: Object.freeze({ ...ref }), passage: Object.freeze({ verses: Object.freeze(verses), attribution: passage.attribution, licenseUrl: passage.licenseUrl }),
      sections: Object.freeze(sections), evidence: Object.freeze(evidence), interpretations: Object.freeze(interpretations), limitations: Object.freeze([...content.limitations]) });
    Object.freeze(this);
  }
  forDelivery(availability: Readonly<Record<string, Availability>>): StudyView {
    const hidden = new Set<string>();
    const evidence = this.content.evidence.map(row => {
      const state = availability[row.excerptId] ?? 'missing';
      requireValue(['available', 'restricted', 'missing'].includes(state));
      if (state !== 'available') hidden.add(row.excerptId);
      return Object.freeze({ ...row, quote: state === 'available' ? row.quote : null, availability: state });
    });
    const sections = this.content.sections.map(row => row.evidenceIds.some(id => hidden.has(id))
      ? new StudySection({ ...row, status: 'insufficient-evidence', text: 'Conteúdo indisponível devido às condições atuais da fonte.' }) : row);
    const interpretations = this.content.interpretations.filter(row => !row.evidenceIds.some(id => hidden.has(id)));
    const limitations = hidden.size > 0 ? [...this.content.limitations, 'Uma ou mais fontes estão indisponíveis nesta leitura.'] : [...this.content.limitations];
    return Object.freeze({ id: this.id, version: this.version, createdAt: this.createdAt, reference: this.content.reference, passage: this.content.passage,
      sections: Object.freeze(sections), evidence: Object.freeze(evidence), interpretations: Object.freeze(interpretations), limitations: Object.freeze(limitations) });
  }
}
