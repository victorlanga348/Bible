import type { StudyBuilderPort, StudyCanonPort, StudySourcesPort } from './ports';
import type { StudyContent } from '../domain/study';

export class GenerateStructuredStudy implements StudyBuilderPort {
  constructor(private readonly canon: StudyCanonPort, private readonly sources: StudySourcesPort) {}
  async execute(translationId: string, reference: string): Promise<StudyContent> {
    const canon = await this.canon.load(translationId, reference);
    const sources = await this.sources.collect(canon.reference);
    const insufficient = 'Não existe análise curada suficiente nesta biblioteca.';
    return {
      reference: canon.reference, passage: canon.passage,
      sections: [
        { kind: 'immediate-context', status: 'available', text: canon.chapter.verses.map(verse => `${verse.number} ${verse.text}`).join('\n'), evidenceIds: [] },
        { kind: 'book-argument', status: 'insufficient-evidence', text: insufficient, evidenceIds: [] },
        { kind: 'history-culture', status: 'insufficient-evidence', text: insufficient, evidenceIds: [] },
        { kind: 'authorship-audience-purpose', status: 'insufficient-evidence', text: insufficient, evidenceIds: [] },
        { kind: 'comparison', status: sources.evidence.length > 0 ? 'available' : 'insufficient-evidence',
          text: sources.evidence.length > 0 ? sources.comparison : insufficient, evidenceIds: sources.evidence.map(row => row.excerptId) },
        { kind: 'interpretations', status: 'insufficient-evidence', text: insufficient, evidenceIds: [] },
      ],
      evidence: sources.evidence, interpretations: [],
      limitations: ['Estudo determinístico, sem geração por IA; as secções dependem da cobertura curada disponível.',
        'O contexto reproduz apenas os versículos disponíveis do capítulo nesta edição.', ...sources.limitations],
    };
  }
}
