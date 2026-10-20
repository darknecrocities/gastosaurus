import { useState, useEffect } from 'react';
import { invitesApi } from '../lib/api';

const JOIN_KEY = 'gastosaurus-join-code';

/** The ?join=<code> from the URL (moved into sessionStorage), or one saved earlier. */
export function readJoinCode() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('join');
    if (fromUrl) {
      sessionStorage.setItem(JOIN_KEY, fromUrl);
      window.history.replaceState({}, '', window.location.pathname);
    }
    return sessionStorage.getItem(JOIN_KEY);
  } catch {
    return null;
  }
}

export function clearJoinCode() {
  try {
    sessionStorage.removeItem(JOIN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Hook to manage invite link joining flow across page reloads & auth.
 */
export function useJoinCode(authUser, { onJoined, onError }) {
  const [joinCode, setJoinCode] = useState(readJoinCode);

  useEffect(() => {
    if (!joinCode || !authUser) return;
    invitesApi
      .join(joinCode)
      .then((group) => {
        onJoined?.(group);
      })
      .catch((err) => {
        onError?.(err);
      })
      .finally(() => {
        clearJoinCode();
        setJoinCode(null);
      });
  }, [joinCode, authUser, onJoined, onError]);

  return { joinCode, clearJoinCode };
}
