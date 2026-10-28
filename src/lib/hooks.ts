import { useEffect, useEffectEvent } from 'react';

const SKIP_EVENT = 'retro:skip';

// ESC oder "Überspringen" spult laufende Boot-Sequenzen vor
export const requestSkip = () => window.dispatchEvent(new Event(SKIP_EVENT));

export interface ScriptApi {
  wait: (ms: number) => Promise<void>;
  skipping: () => boolean;
}

class Aborted extends Error {}

// Führt ein asynchrones Drehbuch aus. Beim Unmount wird abgebrochen,
// bei einem Skip laufen alle weiteren wait()-Aufrufe sofort durch.
export function useScript(script: (api: ScriptApi) => Promise<void>, deps: unknown[]) {
  const run = useEffectEvent(script);

  useEffect(() => {
    let aborted = false;
    let skipping = false;
    const pending = new Set<() => void>();

    const onSkip = () => {
      skipping = true;
      pending.forEach((resolve) => resolve());
      pending.clear();
    };
    window.addEventListener(SKIP_EVENT, onSkip);

    const api: ScriptApi = {
      skipping: () => skipping,
      wait: (ms) =>
        new Promise<void>((resolve, reject) => {
          if (aborted) return reject(new Aborted());
          if (skipping) return resolve();
          const done = () => {
            window.clearTimeout(id);
            pending.delete(done);
            if (aborted) reject(new Aborted());
            else resolve();
          };
          const id = window.setTimeout(done, ms);
          pending.add(done);
        }),
    };

    run(api).catch((e) => {
      if (!(e instanceof Aborted)) throw e;
    });

    return () => {
      aborted = true;
      window.removeEventListener(SKIP_EVENT, onSkip);
      pending.forEach((resolve) => resolve());
      pending.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useKeydown(handler: (e: KeyboardEvent) => void, active = true) {
  const onKey = useEffectEvent(handler);
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active]);
}

export const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
