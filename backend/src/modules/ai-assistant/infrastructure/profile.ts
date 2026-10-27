export interface PromptMessage { readonly role: 'system' | 'user' | 'assistant'; readonly content: string }
export interface LocalModelProfile {
  readonly id: string;
  readonly promptVersion: string;
  readonly messagesPrefix: readonly PromptMessage[];
  readonly embedding: { readonly id: string; readonly sha256: string; readonly dimensions: number; readonly queryPrefix: string };
  readonly generation: {
    readonly id: string; readonly sha256: string;
    readonly sampling: { readonly temperature: number; readonly top_p: number; readonly top_k: number; readonly min_p: number; readonly presence_penalty: number; readonly seed: number };
    readonly enableThinking: boolean;
  };
  readonly limits: { readonly generationOutputTokens: number; readonly generationContextTokens: number; readonly embeddingContextTokens: number };
}
export interface InstalledRuntimeProfile extends LocalModelProfile {
  readonly runtime: { readonly executable: string; readonly engineCommit: string; readonly files: readonly { readonly path: string; readonly sha256: string }[]; readonly environmentAllowlist: readonly string[] };
  readonly embedding: LocalModelProfile['embedding'] & { readonly file: string; readonly bytes: number };
  readonly generation: LocalModelProfile['generation'] & { readonly file: string; readonly bytes: number };
  readonly limits: LocalModelProfile['limits'] & { readonly readinessSeconds: number; readonly inferenceSeconds: number; readonly operationSeconds: number };
}
