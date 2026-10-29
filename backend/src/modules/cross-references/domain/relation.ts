export type RelationType = 'citation' | 'allusion' | 'thematic-parallel' | 'prophetic-relation';
export type RelationReading = 'textual' | 'historical' | 'messianic' | 'eschatological';
export interface RelationPassage { readonly translationId: string; readonly bookCode: string; readonly chapter: number; readonly fromVerse: number; readonly toVerse: number; readonly normalized: string }
export interface RelationEvidence { readonly sourceId: string; readonly excerptId: string; readonly locator: string; readonly textSha256: string; readonly startOffset: number; readonly endOffset: number }
export interface RelationProps { readonly schemaVersion: 1; readonly id: string; readonly ownerId: string; readonly from: RelationPassage; readonly to: RelationPassage; readonly type: RelationType; readonly reading: RelationReading; readonly rationale: string; readonly evidence: readonly RelationEvidence[]; readonly createdAt: string }
export interface RelationCursor { readonly createdAt: string; readonly id: string }
export interface RelationWindow { readonly limit: number; readonly cursor?: RelationCursor }
export class RelationInputError extends Error {}
function check(condition: boolean): asserts condition { if (!condition) throw new RelationInputError('Invalid cross-reference value'); }
export function relationOwner(value: string): void { check(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value)); }
export function relationId(value: string): void { check(typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)); }
export function relationDate(value: string): void { check(typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value); }
function text(value: string, maximum: number): void {
  check(typeof value === 'string' && value.length > 0 && value === value.trim() && !/[\uD800-\uDFFF]/u.test(value) && !/\p{Cc}/u.test(value.replace(/[\t\r\n]/g, '')) && new TextEncoder().encode(value).byteLength <= maximum);
}
function positive(value: number): void { check(Number.isSafeInteger(value) && value > 0); }
function passage(value: RelationPassage): RelationPassage {
  check(value !== null && typeof value === 'object');
  check(typeof value.translationId === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value.translationId));
  check(typeof value.bookCode === 'string' && /^[A-Z0-9]{3}$/.test(value.bookCode));
  positive(value.chapter); positive(value.fromVerse); positive(value.toVerse); check(value.fromVerse <= value.toVerse);
  check(value.normalized === `${value.bookCode} ${value.chapter}:${value.fromVerse}${value.fromVerse === value.toVerse ? '' : `-${value.toVerse}`}`);
  return Object.freeze({ translationId: value.translationId, bookCode: value.bookCode, chapter: value.chapter, fromVerse: value.fromVerse, toVerse: value.toVerse, normalized: value.normalized });
}
function evidence(value: RelationEvidence): RelationEvidence {
  check(value !== null && typeof value === 'object');
  for (const id of [value.sourceId, value.excerptId]) check(typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,199}$/.test(id));
  text(value.locator, 1000); check(typeof value.textSha256 === 'string' && /^[0-9a-f]{64}$/.test(value.textSha256));
  check(Number.isSafeInteger(value.startOffset) && value.startOffset >= 0); positive(value.endOffset); check(value.endOffset > value.startOffset);
  return Object.freeze({ sourceId: value.sourceId, excerptId: value.excerptId, locator: value.locator, textSha256: value.textSha256, startOffset: value.startOffset, endOffset: value.endOffset });
}
export class CrossReference implements RelationProps {
  readonly schemaVersion = 1; readonly id: string; readonly ownerId: string; readonly from: RelationPassage; readonly to: RelationPassage; readonly type: RelationType; readonly reading: RelationReading; readonly rationale: string; readonly evidence: readonly RelationEvidence[]; readonly createdAt: string;
  constructor(input: RelationProps) {
    check(input !== null && typeof input === 'object' && input.schemaVersion === 1);
    relationId(input.id); relationOwner(input.ownerId); relationDate(input.createdAt); text(input.rationale, 2000);
    this.from = passage(input.from); this.to = passage(input.to);
    check(this.from.translationId !== this.to.translationId || this.from.normalized !== this.to.normalized);
    check(['citation', 'allusion', 'thematic-parallel', 'prophetic-relation'].includes(input.type));
    check(input.type === 'prophetic-relation' ? ['historical', 'messianic', 'eschatological'].includes(input.reading) : input.reading === 'textual');
    check(Array.isArray(input.evidence) && input.evidence.length >= 1 && input.evidence.length <= 4);
    this.evidence = Object.freeze(input.evidence.map(evidence));
    check(new Set(this.evidence.map(row => `${row.excerptId}:${row.startOffset}:${row.endOffset}`)).size === this.evidence.length);
    this.id = input.id; this.ownerId = input.ownerId; this.type = input.type; this.reading = input.reading; this.rationale = input.rationale; this.createdAt = input.createdAt;
    Object.freeze(this);
  }
}
export function validateWindow(owner: string, query: RelationWindow): void {
  relationOwner(owner); check(query !== null && typeof query === 'object'); check(Number.isSafeInteger(query.limit) && query.limit >= 1 && query.limit <= 50);
  if (query.cursor !== undefined) { check(query.cursor !== null && typeof query.cursor === 'object'); relationId(query.cursor.id); relationDate(query.cursor.createdAt); }
}
