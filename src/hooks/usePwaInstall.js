import { useEffect, useState, useCallback } from 'react';

// Singleton state to capture beforeinstallprompt before components mount
let globalDeferredPrompt = null;
const globalPromptListeners = new Set();
let globalIsInstalled = typeof window !== 'undefined'
  ? !!(
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  : false;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    globalPromptListeners.forEach((fn) => fn({ prompt: e, canInstall: true }));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    globalIsInstalled = true;
    globalPromptListeners.forEach((fn) => fn({ prompt: null, canInstall: false, isInstalled: true }));
  });
}

/**
 * Enhanced Hook to manage PWA installation state, automatic install prompts,
 * and direct browser install triggers across Android, iOS, Windows, and macOS.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(globalIsInstalled);
  const [isIos] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  });

  useEffect(() => {
    const handleUpdate = ({ prompt, isInstalled: installed }) => {
      setDeferredPrompt(prompt);
      if (installed !== undefined) {
        setIsInstalled(installed);
      }
    };

    globalPromptListeners.add(handleUpdate);
    return () => {
      globalPromptListeners.delete(handleUpdate);
    };
  }, []);

  /**
   * Directly triggers the browser's native PWA installation dialog.
   * Returns true if user accepted, false if rejected or unavailable.
   */
  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) {
      return { supported: false, accepted: false };
    }

    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        return { supported: true, accepted: true };
      }
      return { supported: true, accepted: false };
    } catch (err) {
      console.warn('[pwa] Installation prompt error:', err);
      return { supported: true, accepted: false, error: err };
    }
  }, [deferredPrompt]);

  return {
    canInstall: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIos,
    promptInstall,
  };
}

export default usePwaInstall;
