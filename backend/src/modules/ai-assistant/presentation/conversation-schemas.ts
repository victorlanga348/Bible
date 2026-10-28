import { z } from 'zod';
import { AiQuestion } from '../domain/model-input';
import { analysisView } from './schemas';

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).length(36);
const positive = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const turnNumber = z.number().int().min(1).max(20);
const question = z.string().refine(value => { try { return new TextEncoder().encode(new AiQuestion(value).text).byteLength <= 500; } catch { return false; } }).describe('Trimmed question, at most 500 UTF-8 bytes; valid Unicode and no forbidden control characters.');
export const conversationParams = z.strictObject({ conversationId: uuid });
export const createConversationBody = z.strictObject({ studyVersion: positive });
export const appendConversationBody = z.strictObject({ expectedRevision: z.number().int().min(0).max(20), question, revisesTurn: turnNumber.optional() });
export const emptyConversationBody = z.strictObject({}).optional();
export const conversationView = z.strictObject({
  id: uuid, studyId: uuid, studyVersion: positive, createdAt: z.iso.datetime(), revision: z.number().int().min(0).max(20),
  turns: z.array(z.strictObject({ number: turnNumber, question, analysisId: uuid, createdAt: z.iso.datetime(), contextTurnNumbers: z.array(turnNumber).max(2), omittedTurns: z.number().int().min(0).max(19), revisesTurn: turnNumber.nullable(), analysis: analysisView.nullable(), responseStatus: z.enum(['available', 'unavailable']) })).max(20),
});
