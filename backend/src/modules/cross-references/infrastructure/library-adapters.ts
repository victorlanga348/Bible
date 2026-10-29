import { createHash } from 'node:crypto';
import type { CanonLibrary } from '../../biblical-canon/application/canon-library';
import { CanonNotFoundError } from '../../biblical-canon/application/errors';
import { CanonDomainError } from '../../biblical-canon/domain/canon-domain-error';
import type { SourceLibrary } from '../../source-library/application/source-library';
import { SourceAccessError, SourceNotFoundError } from '../../source-library/application/errors';
import type { RelationCanonPort, RelationSourcesPort, RelationSpan, RelationEvidenceView } from '../application/ports';
import type { RelationPassage, RelationEvidence } from '../domain/relation';
import { RelationInputError } from '../domain/relation';
import { RelationNotFoundError, RelationEvidenceError, RelationUnavailableError } from '../application/errors';
export class RelationCanonAdapter implements RelationCanonPort {
  constructor(private readonly library: CanonLibrary) {}
  async resolve(translation: string, reference: string): Promise<RelationPassage> {
    try { const value = await this.library.resolve(translation, reference); return { translationId: value.translationId, bookCode: value.bookCode, chapter: value.chapter, fromVerse: value.fromVerse, toVerse: value.toVerse, normalized: value.toString() }; }
    catch (cause) { if (cause instanceof CanonNotFoundError) throw new RelationNotFoundError(); if (cause instanceof CanonDomainError) throw new RelationInputError(); throw new RelationUnavailableError('Canonical relation lookup failed', { cause }); }
  }
}
export class RelationSourcesAdapter implements RelationSourcesPort {
  constructor(private readonly library: SourceLibrary) {}
  private async current(id: string) {
    try {
      const current = await this.library.getExcerpt(id);
      if (current.source.permissions.store !== 'allowed') return 'restricted' as const;
      if (createHash('sha256').update(current.excerpt.text, 'utf8').digest('hex') !== current.excerpt.textSha256.toLowerCase()) throw new RelationUnavailableError('Source integrity failure');
      return current;
    } catch (cause) { if (cause instanceof SourceNotFoundError) return 'missing' as const; if (cause instanceof SourceAccessError) return 'restricted' as const; if (cause instanceof RelationUnavailableError) throw cause; throw new RelationUnavailableError('Relation source lookup failed', { cause }); }
  }
  private quote(text: string, span: RelationSpan): string {
    const points = Array.from(text);
    if (!Number.isSafeInteger(span.startOffset) || span.startOffset < 0 || !Number.isSafeInteger(span.endOffset) || span.endOffset <= span.startOffset || span.endOffset > points.length) throw new RelationEvidenceError();
    const quote = points.slice(span.startOffset, span.endOffset).join(''); if (new TextEncoder().encode(quote).byteLength > 1000) throw new RelationEvidenceError(); return quote;
  }
  async capture(spans: readonly RelationSpan[]): Promise<readonly RelationEvidence[]> {
    const result: RelationEvidence[] = [];
    for (const span of spans) {
      const current = await this.current(span.excerptId); if (typeof current === 'string') throw new RelationEvidenceError(); this.quote(current.excerpt.text, span);
      result.push({ sourceId: current.source.id, excerptId: current.excerpt.id, locator: current.excerpt.locator, textSha256: current.excerpt.textSha256.toLowerCase(), startOffset: span.startOffset, endOffset: span.endOffset });
    }
    return result;
  }
  async deliver(refs: readonly RelationEvidence[]): Promise<readonly RelationEvidenceView[]> {
    const result: RelationEvidenceView[] = [];
    for (const ref of refs) {
      const current = await this.current(ref.excerptId);
      const availability = typeof current === 'string' ? current : current.source.id !== ref.sourceId || current.excerpt.locator !== ref.locator || current.excerpt.textSha256.toLowerCase() !== ref.textSha256 ? 'missing' : 'available';
      if (availability !== 'available' || typeof current === 'string') { result.push({ ...ref, availability, quote: null, attribution: null, rightsStatement: null, rightsUrl: null }); continue; }
      let quote: string; try { quote = this.quote(current.excerpt.text, ref); } catch (cause) { throw new RelationUnavailableError('Stored relation evidence is incoherent', { cause }); }
      result.push({ ...ref, availability, quote, attribution: current.source.attribution, rightsStatement: current.source.rightsStatement, rightsUrl: current.source.rightsUrl });
    }
    return result;
  }
}
