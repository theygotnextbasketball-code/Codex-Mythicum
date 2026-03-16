import { useState, useEffect } from 'react';

// ─── PWA INSTALL PROMPT ───
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  };

  return { isInstallable, isInstalled, promptInstall };
}

// ─── SHARE CREATURE ───
export async function shareCreature(creature) {
  const text = `${creature.name} — ${creature.aka}\n${creature.mythology} mythology\n\n${creature.description.slice(0, 200)}...\n\nDiscover more at Codex Mythicum`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${creature.name} — Codex Mythicum`,
        text,
        url: window.location.href,
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Fallback to clipboard
        return copyToClipboard(text);
      }
      return false;
    }
  }
  return copyToClipboard(text);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
