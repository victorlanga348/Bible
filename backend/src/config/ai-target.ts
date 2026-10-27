import { isAbsolute } from 'node:path';
import { assertTestTarget } from './database-target';

export interface AiRuntimeSettings { readonly aiHome?: string; readonly aiDatabaseUrl?: string }
export function assertAiTestTarget(input: NodeJS.ProcessEnv): string {
  try {
    const target = new URL(assertTestTarget(input));
    target.search = '?schema=ai';
    return target.href;
  } catch { throw new Error('Unsafe AI test database'); }
}
export function assertAiDevelopmentTarget(input: NodeJS.ProcessEnv): string {
  try {
    if (input.NODE_ENV !== 'development' || !input.BIBLE_AI_DATABASE_URL) throw new Error();
    const target = new URL(input.BIBLE_AI_DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(target.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)
      || target.username !== 'bible_ai_owner' || target.pathname !== '/bible_ai' || target.port !== '55436'
      || target.searchParams.size !== 1 || target.searchParams.get('schema') !== 'ai' || target.hash) throw new Error();
    return input.BIBLE_AI_DATABASE_URL;
  } catch { throw new Error('Unsafe AI development database'); }
}
export function parseAiRuntimeSettings(input: NodeJS.ProcessEnv): AiRuntimeSettings {
  const settings: { aiHome?: string; aiDatabaseUrl?: string } = {};
  if (input.BIBLE_AI_HOME !== undefined) {
    const home = input.BIBLE_AI_HOME;
    if (typeof home !== 'string' || !home.trim() || home !== home.trim() || !isAbsolute(home)) throw new Error('Invalid configuration: BIBLE_AI_HOME');
    settings.aiHome = home;
  }
  if (input.BIBLE_AI_DATABASE_URL !== undefined) settings.aiDatabaseUrl = input.NODE_ENV === 'test' ? assertAiTestTarget(input) : assertAiDevelopmentTarget(input);
  return settings;
}
