import { useSyncExternalStore } from 'react';

// Hash routes (#/cart, #/admin, ...) work on any static host without server rewrites.
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

const currentRoute = () => window.location.hash.slice(1) || '/';

export function useRoute() {
  return useSyncExternalStore(subscribe, currentRoute);
}

export function navigate(route: string) {
  window.location.hash = route;
}
