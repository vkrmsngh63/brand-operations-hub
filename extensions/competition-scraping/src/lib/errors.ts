// Shared error types for the extension. Kept in a tiny standalone file so
// modules that only need the error class (notably the content-script
// api-bridge) don't transitively pull in auth.ts → supabase — that chain
// doesn't resolve under node:test's --experimental-strip-types because
// ./supabase is imported without a .ts extension. Runtime extension code
// (popup, background) pulls in supabase fine via WXT's bundler.

export interface ApiError {
  status: number;
  message: string;
}

export class PlosApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'PlosApiError';
  }
}
