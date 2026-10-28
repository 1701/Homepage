import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ERAS, LINKS } from '../content';
import { useMachine } from '../components/machineContext';
import PixelArt, { PixelRuns } from '../components/PixelArt';
import { ChipPlayer, SONGS, isSoundEnabled, sfx } from '../lib/audio';
import { openLink, requestSkip, useKeydown, useScript } from '../lib/hooks';
import Room from './adventure/Room';
import {
  DIALOG_OPTIONS,
  DIALOG_START,
  FALLBACK,
  HOTSPOTS,
  ITEMS,
  PAIRS,
  REACTIONS,
  VERB_GRID,
  type Reaction,
  type Verb,
} from './adventure/script';
import { ITEM_ICONS, ITEM_PALETTE, MARKUS_FRAMES, MARKUS_H, MARKUS_PALETTE, MARKUS_W } from './adventure/sprites';
import type { EraProps } from './types';

const ERA = ERAS.find((e) => e.id === 'i486')!;
const FLOOR_Y = 134;
const MIN_X = 12;
const MAX_X = 308;

type Speaker = 'markus' | 'pc';
interface Speech {
  who: Speaker;
  text: string;
}

const speakPc = (text: string) => {
  if (!isSoundEnabled() || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text.toLowerCase());
    u.lang = 'de-DE';
    u.pitch = 0.2;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* keine Sprachausgabe */
  }
};

// --- BIOS + Start ------------------------------------------------------------

const Post: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div className="adv-post">
    {lines.map((l, i) => (
      <div key={i}>{l || ' '}</div>
    ))}
    <span className="dos-cursor">_</span>
  </div>
);

// --- Titelbild ---------------------------------------------------------------

// Pixel-Mondsichel: heller Kreis, dunkler Kreis versetzt darüber
const disc = (cx: number, cy: number, r: number, c: string) =>
  Array.from({ length: r * 2 + 1 }, (_, i) => {
    const dy = i - r;
    const half = Math.floor(Math.sqrt(r * r - dy * dy));
    return [cx - half, cy + dy, half * 2 + 1, 1, c] as [number, number, number, number, string];
  });
const crescent = (cx: number, cy: number, r: number, c: string, sky: string) => [...disc(cx, cy, r, c), ...disc(cx + Math.ceil(r / 2), cy - 1, r - 1, sky)];

const TITLE_SKY = ['#05081c', '#0a1030', '#101844', '#18205a', '#22286c', '#302c78'];

const TitleArt: React.FC = () => {
  const rects: [number, number, number, number, string][] = [];
  TITLE_SKY.forEach((c, i) => rects.push([0, i * 24, 320, 24, c]));
  // Dither-Übergänge zwischen den Bändern
  TITLE_SKY.slice(1).forEach((c, i) => {
    for (let x = 0; x < 320; x += 2) rects.push([x + ((i % 2) * 1), (i + 1) * 24 - 2, 1, 2, c]);
  });
  [[20, 12], [60, 30], [94, 8], [140, 22], [180, 10], [230, 28], [270, 14], [300, 40], [40, 52], [210, 50], [120, 44], [290, 66]].forEach(([x, y]) =>
    rects.push([x, y, 1, 1, '#d8dcff']),
  );
  rects.push(...crescent(254, 32, 8, '#f4f0c8', '#0a1030'));
  // Tannen-Horizont
  for (let i = 0; i < 26; i++) {
    const cx = i * 13 + ((i * 7) % 5);
    const h = 30 + ((i * 11) % 22);
    for (let j = 0; j < h; j++) {
      const half = Math.floor((j + 1) * 0.42);
      rects.push([cx - half, 200 - 48 - h + j + 20, half * 2 + 1, 1, i % 2 ? '#081410' : '#0c1c16']);
    }
  }
  rects.push([0, 172, 320, 28, '#081410']);
  // Haus mit erleuchtetem Fenster
  rects.push([150, 150, 26, 22, '#1c1410'], [146, 146, 34, 4, '#120c08'], [150, 142, 26, 4, '#120c08'], [156, 156, 6, 6, '#f0c040'], [166, 156, 6, 6, '#f0c040']);
  return (
    <svg width={320} height={200} viewBox="0 0 320 200" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
};

const Title: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  useEffect(() => {
    const player = new ChipPlayer(SONGS.adventure);
    player.play();
    return () => player.stop();
  }, []);
  useKeydown((e) => {
    if (e.key !== 'Escape') onStart();
  });
  return (
    <button type="button" className="adv-title" onClick={onStart}>
      <TitleArt />
      <span className="adv-title-by">Markus Steireif in</span>
      <span className="adv-title-the">The Secret of</span>
      <span className="adv-title-name">MARXZELL</span>
      <span className="adv-title-credits">(C) 1993 Markus Steireif · Klicken zum Starten</span>
    </button>
  );
};

// --- Spiel -------------------------------------------------------------------

const Game: React.FC<{ next: () => void }> = ({ next }) => {
  const { leds, setLeds } = useMachine();
  const [x, setX] = useState(96);
  const [facing, setFacing] = useState<'l' | 'r'>('r');
  const [walkFrame, setWalkFrame] = useState<number | null>(null);
  const [verb, setVerb] = useState<Verb | null>(null);
  const [first, setFirst] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[]>(['gummihuhn']);
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [dialog, setDialog] = useState(false);
  const [talkFrame, setTalkFrame] = useState(false);
  // Satzzeile hält die laufende Aktion fest, bis Markus angekommen ist
  const [running, setRunning] = useState<string | null>(null);
  const afterSpeech = useRef<(() => void) | null>(null);
  const queueRef = useRef<Speech[]>([]);
  const walkRef = useRef<{ target: number; done: () => void } | null>(null);
  const xRef = useRef(x);

  const say = useCallback((who: Speaker, lines: string[], then?: () => void) => {
    if (!lines.length) {
      then?.();
      return;
    }
    if (who === 'pc') speakPc(lines.join(' '));
    queueRef.current = lines.slice(1).map((text) => ({ who, text }));
    afterSpeech.current = then ?? null;
    setSpeech({ who, text: lines[0] });
  }, []);

  const advanceSpeech = useCallback(() => {
    const nextLine = queueRef.current.shift();
    if (nextLine) {
      setSpeech(nextLine);
      return;
    }
    setSpeech(null);
    const fn = afterSpeech.current;
    afterSpeech.current = null;
    fn?.();
  }, []);

  // Sprechblasen-Zeit abhängig von der Textlänge
  useEffect(() => {
    if (!speech) return;
    const t = window.setTimeout(advanceSpeech, Math.max(1600, speech.text.length * 70));
    return () => window.clearTimeout(t);
  }, [speech, advanceSpeech]);

  useEffect(() => {
    if (speech?.who !== 'markus') return;
    const t = window.setInterval(() => setTalkFrame((f) => !f), 140);
    return () => {
      window.clearInterval(t);
      setTalkFrame(false);
    };
  }, [speech]);

  // Laufen – zeitbasiert, damit das Tempo nicht von der Bildrate abhängt
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let walked = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const w = walkRef.current;
      if (w) {
        const dx = w.target - xRef.current;
        const step = 60 * dt;
        if (Math.abs(dx) <= step) {
          xRef.current = w.target;
          walkRef.current = null;
          walked = 0;
          setX(w.target);
          setWalkFrame(null);
          w.done();
        } else {
          xRef.current += Math.sign(dx) * step;
          walked += step;
          setX(xRef.current);
          setWalkFrame(Math.floor(walked / 7) % 4);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const walkTo = (target: number, then?: () => void) => {
    const t = Math.max(MIN_X, Math.min(MAX_X, Math.round(target)));
    setFacing(t < xRef.current ? 'l' : t > xRef.current ? 'r' : facing);
    walkRef.current = { target: t, done: then ?? (() => {}) };
  };

  const applyEffect = (r: Reaction) => {
    setRunning(null);
    const e = r.effect;
    if (!e) return say('markus', r.say);
    if (e.type === 'take') {
      setInventory((inv) => (inv.includes(e.item) ? inv : [...inv, e.item]));
      return say('markus', inventory.includes(e.item) ? ['Davon habe ich schon eine.'] : r.say);
    }
    if (e.type === 'turbo') {
      const on = !leds.turbo;
      setLeds((l) => ({ ...l, turbo: on }));
      sfx.key();
      return say('markus', on ? ['Turbo an. 66 MHz!', 'Volle Kraft voraus!'] : ['Turbo aus.', 'Jetzt läuft Wing Commander endlich', 'in normaler Geschwindigkeit.']);
    }
    if (e.type === 'dialog') {
      say('pc', [DIALOG_START], () => setDialog(true));
      return;
    }
    if (e.type === 'beep') sfx.blip();
    if (e.type === 'upgrade') return say('markus', r.say, next);
    say('markus', r.say);
  };

  const reactionFor = (v: Verb, target: string, second?: string): Reaction => {
    if (second) {
      const pair = PAIRS[`${target}+${second}`] ?? PAIRS[`${second}+${target}`];
      return pair ?? { say: FALLBACK[v] };
    }
    if (target === 'joystick' && inventory.includes('joystick') && v === 'Benutze') return { say: ['Damit spiele ich gleich weiter.'] };
    return REACTIONS[target]?.[v] ?? { say: FALLBACK[v] };
  };

  const isItem = (id: string) => id in ITEMS;

  const nameOf = (id: string) => (id === 'markus' ? 'Markus' : ITEMS[id] ?? HOTSPOTS.find((h) => h.id === id)?.name ?? id);

  const resetVerb = () => {
    setVerb(null);
    setFirst(null);
  };

  const act = (target: string, useVerb?: Verb) => {
    if (dialog) return;
    if (speech) advanceSpeech();
    const v = useVerb ?? verb;
    const spot = HOTSPOTS.find((h) => h.id === target);

    if (!v) {
      if (spot) walkTo(spot.walkX);
      return;
    }

    // Zwei-Objekt-Verben
    if ((v === 'Benutze' || v === 'Gib') && isItem(target) && !first && !(v === 'Benutze' && REACTIONS[target]?.Benutze)) {
      setFirst(target);
      return;
    }
    if ((v === 'Benutze' || v === 'Gib') && first) {
      const r = reactionFor(v, first, target);
      setRunning(`${v} ${nameOf(first)} ${v === 'Gib' ? 'an' : 'mit'} ${nameOf(target)}`);
      resetVerb();
      if (spot) walkTo(spot.walkX, () => applyEffect(r));
      else applyEffect(r);
      return;
    }

    const r = reactionFor(v, target);
    setRunning(`${v} ${nameOf(target)}`);
    // Links sofort im Klick öffnen, sonst blockiert der Popup-Blocker
    if (r.effect?.type === 'link') openLink(r.effect.url);
    resetVerb();
    if (spot) walkTo(spot.walkX, () => applyEffect(r));
    else applyEffect(r);
  };

  const onFloor = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialog) return;
    if (speech) {
      advanceSpeech();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 320;
    resetVerb();
    setRunning(null);
    walkTo(nx);
  };

  const chooseOption = (id: string) => {
    setDialog(false);
    const option = DIALOG_OPTIONS.find((o) => o.id === id)!;
    say('markus', [option.text], () => {
      if (id === 'who')
        say('pc', ['MARKUS STEIREIF. PRODUCT GUY UND RETRO-ENTHUSIAST.', 'ANGEFANGEN HAT ALLES MIT EINEM C64.', 'HEUTE BAUT ER DIGITALE PRODUKTE.'], () => setDialog(true));
      else if (id === 'contact')
        say('pc', ['AM BESTEN UEBER LINKEDIN.', 'KLICKE AUF "LINKEDIN OEFFNEN".'], () => setDialog(true));
      else if (id === 'secret') say('pc', ['DAS IST GEHEIM.'], () => say('markus', ['Hätte ich mir denken können.'], () => setDialog(true)));
      else if (id === 'upgrade') say('pc', ['PENTIUM GEFUNDEN.', 'ICH BIN DANN MAL WEG.'], next);
      else say('pc', ['AUF WIEDERSEHEN.']);
    });
  };

  const sentence = (() => {
    const v = verb ?? 'Gehe zu';
    const conj = verb === 'Gib' ? 'an' : 'mit';
    if (first) return `${v} ${nameOf(first)} ${conj} ${hover && hover !== first ? nameOf(hover) : ''}`;
    return `${v} ${hover ? nameOf(hover) : ''}`;
  })();

  const hoverDefault = !verb && hover ? (HOTSPOTS.find((h) => h.id === hover)?.defaultVerb ?? (isItem(hover) ? 'Schau an' : null)) : null;

  const frame =
    walkFrame !== null ? [MARKUS_FRAMES.walk1, MARKUS_FRAMES.stand, MARKUS_FRAMES.walk2, MARKUS_FRAMES.stand][walkFrame] : talkFrame ? MARKUS_FRAMES.talk : MARKUS_FRAMES.stand;

  const spriteLeft = Math.round(x - MARKUS_W / 2);
  const spriteTop = FLOOR_Y - MARKUS_H;

  const speechPos = speech?.who === 'pc' ? { x: 173, y: 26 } : { x, y: spriteTop - 4 };
  const speechLines = speech ? wrap(speech.text, 38) : [];

  return (
    <div className="adv">
      <div className="adv-scene" onClick={onFloor}>
        <Room turbo={leds.turbo} hasJoystick={!inventory.includes('joystick')} />
        {HOTSPOTS.filter((h) => h.id !== 'joystick' || !inventory.includes('joystick')).map((h) => (
          <button
            key={h.id}
            type="button"
            className="adv-hotspot"
            style={{ left: h.rect[0], top: h.rect[1], width: h.rect[2], height: h.rect[3] }}
            aria-label={h.name}
            onMouseEnter={() => setHover(h.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(h.id)}
            onBlur={() => setHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              act(h.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              act(h.id, h.defaultVerb);
            }}
          />
        ))}
        <svg
          className="adv-markus"
          width={MARKUS_W}
          height={MARKUS_H}
          viewBox={`0 0 ${MARKUS_W} ${MARKUS_H}`}
          shapeRendering="crispEdges"
          style={{ left: spriteLeft, top: spriteTop, transform: facing === 'l' ? 'scaleX(-1)' : undefined }}
          aria-hidden="true"
        >
          <PixelRuns rows={frame} palette={MARKUS_PALETTE} />
        </svg>
        <button
          type="button"
          className="adv-hotspot"
          style={{ left: spriteLeft, top: spriteTop, width: MARKUS_W, height: MARKUS_H }}
          aria-label="Markus"
          onMouseEnter={() => setHover('markus')}
          onMouseLeave={() => setHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            act('markus');
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            act('markus', 'Schau an');
          }}
        />
        {speech && (
          <div
            className={`adv-speech adv-speech-${speech.who}`}
            style={{
              left: Math.max(4, Math.min(316 - 38 * 4.8, speechPos.x - (Math.max(...speechLines.map((l) => l.length)) * 4.8) / 2)),
              top: Math.max(2, speechPos.y - speechLines.length * 11),
            }}
            role="status"
          >
            {speechLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </div>
      <div className="adv-sentence">{dialog ? ' ' : (running ?? sentence)}</div>
      {dialog ? (
        <div className="adv-dialog">
          {DIALOG_OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => chooseOption(o.id)}>
              {o.text}
            </button>
          ))}
          <button type="button" className="adv-dialog-link" onClick={() => openLink(LINKS.linkedin)}>
            → LinkedIn öffnen
          </button>
        </div>
      ) : (
        <div className="adv-ui">
          <div className="adv-verbs">
            {VERB_GRID.map((row) =>
              row.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`adv-verb ${verb === v ? 'active' : ''} ${hoverDefault === v ? 'hint' : ''}`}
                  onClick={() => {
                    setVerb(v);
                    setFirst(null);
                  }}
                >
                  {v}
                </button>
              )),
            )}
          </div>
          <div className="adv-inventory">
            {Array.from({ length: 6 }, (_, i) => inventory[i]).map((item, i) =>
              item ? (
                <button
                  key={item}
                  type="button"
                  className="adv-item"
                  aria-label={ITEMS[item]}
                  onMouseEnter={() => setHover(item)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => act(item, verb ?? 'Schau an')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    act(item, 'Schau an');
                  }}
                >
                  <PixelArt rows={ITEM_ICONS[item]} palette={ITEM_PALETTE} scale={1} />
                </button>
              ) : (
                <span key={`empty-${i}`} className="adv-item empty" />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Zeilenumbruch nach Wörtern
const wrap = (text: string, max: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines;
};

// --- Epoche ------------------------------------------------------------------

const Adventure486: React.FC<EraProps> = ({ next }) => {
  const [phase, setPhase] = useState<'post' | 'title' | 'game'>('post');
  const [lines, setLines] = useState<string[]>([]);
  const { setLeds } = useMachine();

  useScript(async ({ wait, skipping }) => {
    const add = (l: string) => setLines((ls) => [...ls, l]);
    setLines([]);
    add('Modular BIOS v4.51PG, (C) 1993');
    add(`${ERA.machine} System BIOS`);
    add('');
    add(`486DX2 CPU at ${ERA.mhz} MHz`);
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(1.4);
    await wait(500);
    add('Memory Test :  8192K OK');
    add('');
    await wait(500);
    if (!skipping()) sfx.beep(1000, 0.15);
    add('Sound Blaster 16 gefunden: A220 I5 D1 H5');
    add('CD-ROM: MSCDEX installiert, Laufwerk D:');
    add('');
    await wait(900);
    setLeds((l) => ({ ...l, hdd: false }));
    for (const cmd of ['C:\\>CD SPIELE\\MARKUS', 'C:\\SPIELE\\MARKUS>MARKUS.EXE']) {
      add('');
      for (const ch of cmd) {
        setLines((ls) => [...ls.slice(0, -1), ls[ls.length - 1] + ch]);
        if (!skipping()) sfx.key();
        await wait(70);
      }
      await wait(400);
    }
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(1);
    await wait(900);
    setLeds((l) => ({ ...l, hdd: false }));
    setPhase('title');
  }, []);

  useEffect(() => () => setLeds((l) => ({ ...l, hdd: false, turbo: true })), [setLeds]);

  return (
    <div className="adv-root" onClick={phase === 'post' ? requestSkip : undefined}>
      {phase === 'post' && <Post lines={lines} />}
      {phase === 'title' && <Title onStart={() => setPhase('game')} />}
      {phase === 'game' && <Game next={next} />}
    </div>
  );
};

export default Adventure486;
