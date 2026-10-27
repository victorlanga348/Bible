import type { ModelEndpoint, ModelSession } from './session';
import { AiResultRejectedError, AiTimeoutError, AiUnavailableError } from '../application/errors';

const endpoints = new Set<string>(['/tokenize', '/apply-template', '/v1/embeddings', '/v1/chat/completions']);

export class NativeModelHttpClient implements ModelSession {
  private readonly base: string;
  constructor(base: string, private readonly key: string, readonly runtimeVersion: string, private readonly timeoutMs = 120000, private readonly signal?: AbortSignal) {
    const url = URL.parse(base);
    if (!url || url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || Number(url.port) < 1 || url.username || url.password || url.pathname !== '/' || url.search || url.hash || (base !== url.origin && base !== url.origin + '/')) throw new AiUnavailableError();
    if (key.length < 32 || key.length > 128 || /[^A-Za-z0-9_-]/.test(key) || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new AiUnavailableError();
    this.base = url.origin;
  }
  async post(endpoint: ModelEndpoint, body: unknown, maxResponseBytes: number): Promise<unknown> {
    if (!endpoints.has(endpoint) || !Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1 || maxResponseBytes > 4194304 || this.signal?.aborted) throw new AiUnavailableError();
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), this.timeoutMs); timer.unref();
    const signal = this.signal ? AbortSignal.any([this.signal, deadline.signal]) : deadline.signal;
    try {
      const encoded = JSON.stringify(body);
      if (encoded === undefined) throw new AiUnavailableError();
      const response = await fetch(this.base + endpoint, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.key }, body: encoded, signal });
      if (!response.ok) {
        await response.body?.cancel();
        if (response.status === 400 || response.status === 422) throw new AiResultRejectedError();
        throw new AiUnavailableError();
      }
      if (Number(response.headers.get('content-length')) > maxResponseBytes) { await response.body?.cancel(); throw new AiUnavailableError(); }
      const reader = response.body?.getReader();
      if (!reader) throw new AiUnavailableError();
      const chunks: Uint8Array[] = []; let size = 0;
      try {
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.byteLength;
          if (size > maxResponseBytes) { await reader.cancel(); throw new AiUnavailableError(); }
          chunks.push(part.value);
        }
      } finally { reader.releaseLock(); }
      return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))) as unknown;
    } catch (error) {
      if (error instanceof AiResultRejectedError || error instanceof AiUnavailableError) throw error;
      if (deadline.signal.aborted) throw new AiTimeoutError();
      throw new AiUnavailableError();
    } finally { clearTimeout(timer); }
  }
}
