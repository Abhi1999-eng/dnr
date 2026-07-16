'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener('focus', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('focus', handler);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('dnr_token') || '';
}

export function useAdminToken() {
  return useSyncExternalStore(subscribe, getSnapshot, () => '');
}
