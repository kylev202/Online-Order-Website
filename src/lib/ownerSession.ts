import { useSyncExternalStore } from 'react';
import { api, ApiError } from './api';

// Whether the shop owner is signed in. The server keeps the session in an HttpOnly cookie,
// so the page only knows what the server last said.
type Session = 'checking' | 'signed-out' | 'signed-in';

let session: Session = 'checking';
const listeners = new Set<() => void>();

function set(next: Session) {
  session = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOwnerSession(): Session {
  return useSyncExternalStore(subscribe, () => session);
}

export async function checkOwnerSession() {
  try {
    const { signedIn } = await api<{ signedIn: boolean }>('admin/session');
    set(signedIn ? 'signed-in' : 'signed-out');
  } catch {
    set('signed-out');
  }
}

/** Throws ApiError (e.g. wrong password) so the login form can show it. */
export async function signIn(password: string) {
  await api('admin/login', { body: { password } });
  set('signed-in');
}

export async function signOut() {
  try {
    await api('admin/logout', { method: 'POST' });
  } finally {
    set('signed-out');
  }
}

/** API call for owner pages: an expired login sends the owner back to the login screen. */
export async function ownerApi<T>(...args: Parameters<typeof api>): Promise<T> {
  try {
    return await api<T>(...args);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) set('signed-out');
    throw error;
  }
}
