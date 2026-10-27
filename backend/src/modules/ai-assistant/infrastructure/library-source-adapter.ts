import type { SourceLibrary } from '../../source-library/application/source-library';
import type { AdmittedAiExcerpt, AiSourcesPort, AiTextHashPort, EligibleAiSourceRef } from '../application/analysis-ports';
import type { AiSourcePolicy } from './source-policy';
import { isDeepStrictEqual } from 'node:util';
import { SourceAccessError, SourceNotFoundError } from '../../source-library/application/errors';
import { AiSourceIntegrityError } from '../application/errors';

export class LibraryAiSourcesAdapter implements AiSourcesPort {
  constructor(private readonly library: SourceLibrary, private readonly policy: AiSourcePolicy, private readonly hash: AiTextHashPort) {}
  listAdmitted(): readonly EligibleAiSourceRef[] {
    return Object.freeze(this.policy.excerpts.map(row => Object.freeze({ sourceId: row.sourceId, excerptId: row.excerptId, textSha256: row.textSha256 })));
  }
  async read(excerptId: string): Promise<AdmittedAiExcerpt | null> {
    const expected = this.policy.excerpts.find(row => row.excerptId === excerptId);
    if (!expected) return null;
    try {
      const { source, excerpt } = await this.library.getExcerpt(excerptId);
      const { permissions, ...metadata } = source;
      if ((['store', 'index', 'display', 'quote', 'sendToAi'] as const).some(right => permissions[right] !== 'allowed')) return null;
      if (this.hash.sha256(excerpt.text) !== excerpt.textSha256) throw new AiSourceIntegrityError();
      if (!isDeepStrictEqual(metadata, this.policy.source) || excerpt.id !== expected.excerptId || excerpt.sourceId !== expected.sourceId || excerpt.textSha256 !== expected.textSha256 || excerpt.locator !== expected.locator || excerpt.order !== expected.paragraph) return null;
      return Object.freeze({ ...expected, text: excerpt.text, attribution: source.attribution, rightsStatement: source.rightsStatement, rightsUrl: source.rightsUrl });
    } catch (error) {
      if (error instanceof SourceAccessError || error instanceof SourceNotFoundError) return null;
      throw error;
    }
  }
}
