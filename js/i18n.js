/**
 * Simple i18n: t(key), setLanguage(locale), getLanguage().
 * Storage key: app_language. Fallback: navigator.language -> "en".
 */

const STORAGE_KEY = 'app_language';
const SUPPORTED = ['en', 'ko'];
const FALLBACK = 'en';

import en from '../locales/en.json';
import ko from '../locales/ko.json';

const messages = { en, ko };

let currentLocale = FALLBACK;

function detectLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/**
 * @param {string} key e.g. "settings.title"
 * @returns {string}
 */
export function t(key) {
  const obj = messages[currentLocale];
  if (!obj) return key;
  const parts = key.split('.');
  let v = obj;
  for (const p of parts) {
    v = v?.[p];
  }
  return typeof v === 'string' ? v : key;
}

/**
 * @returns {string} 'en' | 'ko'
 */
export function getLanguage() {
  return currentLocale;
}

/**
 * @param {string} locale 'en' | 'ko'
 */
export function setLanguage(locale) {
  if (!SUPPORTED.includes(locale)) locale = FALLBACK;
  if (currentLocale === locale) return;
  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (_) {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === 'ko' ? 'ko' : 'en';
  }
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { locale } }));
}

/**
 * Call once at app init (after DOM or at module load).
 */
export function initI18n() {
  currentLocale = detectLanguage();
  try {
    localStorage.setItem(STORAGE_KEY, currentLocale);
  } catch (_) {}
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLocale === 'ko' ? 'ko' : 'en';
  }
}

// Initialize locale from storage or navigator on load
initI18n();
