/** Opens the profile assistant and sends a question. Works from anywhere in the app. */
export const ASK_AI_EVENT = 'portfolio:ask-ai';

export function askAI(question: string) {
  window.dispatchEvent(new CustomEvent<string>(ASK_AI_EVENT, { detail: question }));
}

/** Small helpers for shareable deep links (#role-<id>, #project-<id>). */
export function setHash(hash: string | null) {
  const url = hash ? `#${hash}` : window.location.pathname + window.location.search;
  window.history.replaceState(null, '', url);
}

export function readHash(prefix: string): string | null {
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  return h.startsWith(prefix) ? h.slice(prefix.length) : null;
}

/** Lazy sections listen to this to mount immediately (used before jumping to an anchor). */
export const LOAD_ALL_EVENT = 'portfolio:load-all';

/** Mounts every lazy section, waits until they are ready, then scrolls to the target. */
export function scrollToSection(id: string) {
  window.dispatchEvent(new Event(LOAD_ALL_EVENT));
  const start = performance.now();
  const tryScroll = () => {
    const pending = document.querySelector('main [aria-busy="true"]');
    if (pending && performance.now() - start < 1500) {
      requestAnimationFrame(tryScroll);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  requestAnimationFrame(tryScroll);
}
