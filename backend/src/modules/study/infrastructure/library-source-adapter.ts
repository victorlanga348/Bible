import { createHash } from 'node:crypto';
import { SourceAccessError, SourceNotFoundError } from '../../source-library/application/errors';
import type { SourceLibrary } from '../../source-library/application/source-library';
import type { SourcePassageLinks } from '../../source-library/application/source-passage-links';
import type { StudySourcesPort, CollectedStudyEvidence } from '../application/ports';
import type { StudyReference, EvidenceProps, Availability } from '../domain/study';

export class LibrarySourceAdapter implements StudySourcesPort {
  constructor(private readonly library: SourceLibrary, private readonly links: SourcePassageLinks) {}
  private async readable(excerptId: string) {
    try {
      const current = await this.library.getExcerpt(excerptId);
      if (current.source.permissions.store !== 'allowed') return 'restricted' as const;
      const digest = createHash('sha256').update(current.excerpt.text, 'utf8').digest('hex');
      if (digest !== current.excerpt.textSha256.toLowerCase()) throw new Error('Source text integrity failure');
      return current;
    } catch (error) {
      if (error instanceof SourceNotFoundError) return 'missing' as const;
      if (error instanceof SourceAccessError) return 'restricted' as const;
      throw error;
    }
  }
  async collect(reference: StudyReference): Promise<CollectedStudyEvidence> {
    const links = await this.links.find(reference);
    const evidence = new Map<string, EvidenceProps>(); const comparison = new Set<string>(); const limitations = new Set<string>();
    if (links.length === 0) limitations.add('Não existe uma associação curada a fontes para esta passagem.');
    for (const link of links) {
      const current = await this.readable(link.excerptId);
      if (typeof current === 'string') { limitations.add('Uma ou mais fontes curadas estão indisponíveis.'); continue; }
      const { source, excerpt } = current;
      evidence.set(excerpt.id, { excerptId: excerpt.id, sourceId: source.id, locator: excerpt.locator, quote: excerpt.text, textSha256: excerpt.textSha256,
        attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl, rightsSnapshot: { ...source.permissions } });
      comparison.add(link.rationale); limitations.add(source.limitations);
    }
    return { evidence: [...evidence.values()], comparison: [...comparison].join('\n'), limitations: [...limitations] };
  }
  async availability(evidence: readonly EvidenceProps[]): Promise<Readonly<Record<string, Availability>>> {
    const states: [string, Availability][] = [];
    for (const historic of evidence) {
      const current = await this.readable(historic.excerptId);
      const state = typeof current === 'string' ? current
        : current.source.id === historic.sourceId && current.excerpt.textSha256.toLowerCase() === historic.textSha256.toLowerCase() ? 'available' : 'missing';
      states.push([historic.excerptId, state]);
    }
    return Object.fromEntries(states);
  }
}
