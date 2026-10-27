export type ModelKind = 'embedding' | 'generation';
export type ModelEndpoint = '/tokenize' | '/apply-template' | '/v1/embeddings' | '/v1/chat/completions';
export interface ModelSession {
  readonly runtimeVersion: string;
  post(endpoint: ModelEndpoint, body: unknown, maxResponseBytes: number): Promise<unknown>;
}
export interface ModelRuntimePort {
  run<T>(kind: ModelKind, execute: (session: ModelSession) => Promise<T>, signal?: AbortSignal): Promise<T>;
}
