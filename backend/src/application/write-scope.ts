declare const writeScopeBrand: unique symbol;
/** Opaque capability for a short main-database write; infrastructure owns its lifetime. */
export interface WriteScope { readonly [writeScopeBrand]: true }
