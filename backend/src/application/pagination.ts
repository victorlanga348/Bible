export interface PageCursor { readonly id: string; readonly createdAt: string }
export interface PageWindow { readonly limit: number; readonly cursor?: PageCursor }
