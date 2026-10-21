import { CanonDomainError } from './canon-domain-error';
import { PassageReference } from './passage-reference';

export function parseReference(translationId: string, input: string): PassageReference {
  const match = /^([A-Za-z0-9]{3}) ([1-9][0-9]*):([1-9][0-9]*)(?:-([1-9][0-9]*))?$/.exec(input.trim());
  if (!match) throw new CanonDomainError();
  const fromVerse = Number(match[3]);
  return new PassageReference({
    translationId,
    bookCode: match[1]!,
    chapter: Number(match[2]),
    fromVerse,
    toVerse: match[4] === undefined ? fromVerse : Number(match[4]),
  });
}
