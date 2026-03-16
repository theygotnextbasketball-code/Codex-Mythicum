import { useState, useEffect } from 'react';

// ─── PREMIUM STATE ───
// For now this uses a simple local flag.
// In production, replace with Stripe/RevenueCat/Play Billing verification.

const PREMIUM_KEY = 'codex_mythicum_premium';
const ARCHIVE_VIEWS_KEY = 'codex_archive_views';
const ARCHIVE_VIEWS_DATE_KEY = 'codex_archive_views_date';
const FREE_ARCHIVE_LIMIT = 3; // free users can browse 3 archive creatures per day
const FREE_ALGO_LIMIT = 5; // free users get 5 algorithmic rolls per day
const ALGO_ROLLS_KEY = 'codex_algo_rolls';
const ALGO_ROLLS_DATE_KEY = 'codex_algo_rolls_date';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(() => {
    try { return localStorage.getItem(PREMIUM_KEY) === 'true'; } catch { return false; }
  });

  const activate = () => {
    localStorage.setItem(PREMIUM_KEY, 'true');
    setIsPremium(true);
  };

  const deactivate = () => {
    localStorage.removeItem(PREMIUM_KEY);
    setIsPremium(false);
  };

  return { isPremium, activate, deactivate };
}

// Track daily archive views for free users
export function useArchiveLimit() {
  const getCount = () => {
    try {
      const date = localStorage.getItem(ARCHIVE_VIEWS_DATE_KEY);
      if (date !== getToday()) return 0;
      return parseInt(localStorage.getItem(ARCHIVE_VIEWS_KEY) || '0', 10);
    } catch { return 0; }
  };

  const [views, setViews] = useState(getCount);

  const increment = () => {
    const today = getToday();
    try {
      const storedDate = localStorage.getItem(ARCHIVE_VIEWS_DATE_KEY);
      let count = 0;
      if (storedDate === today) {
        count = parseInt(localStorage.getItem(ARCHIVE_VIEWS_KEY) || '0', 10);
      }
      count++;
      localStorage.setItem(ARCHIVE_VIEWS_KEY, count.toString());
      localStorage.setItem(ARCHIVE_VIEWS_DATE_KEY, today);
      setViews(count);
      return count;
    } catch { return 0; }
  };

  const remaining = Math.max(0, FREE_ARCHIVE_LIMIT - views);
  const isLimited = views >= FREE_ARCHIVE_LIMIT;

  return { views, remaining, isLimited, increment, limit: FREE_ARCHIVE_LIMIT };
}

// Track daily algo rolls for free users
export function useAlgoLimit() {
  const getCount = () => {
    try {
      const date = localStorage.getItem(ALGO_ROLLS_DATE_KEY);
      if (date !== getToday()) return 0;
      return parseInt(localStorage.getItem(ALGO_ROLLS_KEY) || '0', 10);
    } catch { return 0; }
  };

  const [rolls, setRolls] = useState(getCount);

  const increment = () => {
    const today = getToday();
    try {
      const storedDate = localStorage.getItem(ALGO_ROLLS_DATE_KEY);
      let count = 0;
      if (storedDate === today) {
        count = parseInt(localStorage.getItem(ALGO_ROLLS_KEY) || '0', 10);
      }
      count++;
      localStorage.setItem(ALGO_ROLLS_KEY, count.toString());
      localStorage.setItem(ALGO_ROLLS_DATE_KEY, today);
      setRolls(count);
      return count;
    } catch { return 0; }
  };

  const remaining = Math.max(0, FREE_ALGO_LIMIT - rolls);
  const isLimited = rolls >= FREE_ALGO_LIMIT;

  return { rolls, remaining, isLimited, increment, limit: FREE_ALGO_LIMIT };
}
