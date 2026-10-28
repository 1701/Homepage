import React, { useEffect, useRef, useState } from 'react';
import { C64_SCROLLER, GAMES, LINKS } from '../content';
import { useMachine } from '../components/machineContext';
import { ChipPlayer, SONGS, sfx } from '../lib/audio';
import { openLink, requestSkip, useKeydown, useScript } from '../lib/hooks';
import type { EraProps } from './types';

// Colodore-Palette
const C64_COLORS = [
  '#000000', '#ffffff', '#813338', '#75cec8', '#8e3c97', '#56ac4d', '#2e2c9b', '#edf171',
  '#8e5029', '#553800', '#c46c71', '#4a4a4a', '#7b7b7b', '#a9ff9f', '#706deb', '#b2b2b2',
];

type Phase = 'basic' | 'decrunch' | 'intro';

const BOOT = ['', '    **** COMMODORE 64 BASIC V2 ****', '', ' 64K RAM SYSTEM  38911 BASIC BYTES FREE', '', 'READY.', ''];

const Decrunch: React.FC = () => {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSeed((s) => s + 1), 40);
    return () => window.clearInterval(id);
  }, []);
  const stripes: string[] = [];
  let y = 0;
  // seed sorgt dafür, dass jedes Bild neue Streifen bekommt
  let r = (seed * 9301 + 49297) % 233280;
  while (y < 248) {
    r = (r * 9301 + 49297) % 233280;
    const h = 1 + (r % 5);
    const c = C64_COLORS[r % 16];
    stripes.push(`${c} ${y}px ${y + h}px`);
    y += h;
  }
  return <div className="c64-decrunch" style={{ background: `linear-gradient(to bottom, ${stripes.join(',')})` }} />;
};

const BAR_COLORS = [
  [6, 14, 3, 13, 1, 13, 3, 14, 6],
  [9, 8, 10, 7, 1, 7, 10, 8, 9],
  [11, 12, 15, 1, 15, 12, 11],
];

// Balken laufen über und unter dem Logo, nicht hindurch
const BAR_PATHS = [
  [9, 8],
  [72, 4],
  [9, 8],
];

const Cracktro: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => {
  const barsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [wash, setWash] = useState(0);

  useEffect(() => {
    const player = new ChipPlayer(SONGS.cracktro);
    player.play();
    return () => player.stop();
  }, []);

  useEffect(() => {
    const letters = Array.from(scrollRef.current?.children ?? []) as HTMLElement[];
    const bars = Array.from(barsRef.current?.children ?? []) as HTMLElement[];
    const stars = Array.from(starsRef.current?.children ?? []) as HTMLElement[];
    const starData = stars.map((_, i) => ({ x: (i * 97) % 368, y: 60 + ((i * 53) % 110), v: 0.3 + (i % 3) * 0.45 }));
    const text = C64_SCROLLER;
    const cw = 16;
    let offset = 0;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame++;
      offset = (offset + 1.5) % (text.length * cw);
      const first = Math.floor(offset / cw);
      const sub = offset % cw;
      letters.forEach((el, i) => {
        const x = i * cw - sub;
        const ch = text[(first + i) % text.length];
        if (el.textContent !== ch) el.textContent = ch;
        const y = Math.round(Math.sin((x + frame * 2) / 40) * 9);
        el.style.transform = `translate(${Math.round(x)}px, ${y}px)`;
      });
      bars.forEach((el, i) => {
        const [base, amp] = BAR_PATHS[i];
        const y = base + Math.round(Math.sin(frame / 28 + i * 2.1) * amp);
        el.style.transform = `translateY(${y}px)`;
      });
      starData.forEach((s, i) => {
        s.x -= s.v;
        if (s.x < 0) s.x += 368;
        stars[i].style.transform = `translate(${Math.round(s.x)}px, ${s.y}px)`;
      });
      if (frame % 6 === 0) setWash((w) => w + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const washColors = [7, 8, 10, 2, 10, 8, 7, 1];

  return (
    <div className="c64-cracktro">
      <div ref={starsRef} className="c64-stars" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} style={{ background: C64_COLORS[[1, 15, 12][i % 3]] }} />
        ))}
      </div>
      <div ref={barsRef} className="c64-bars" aria-hidden="true">
        {BAR_COLORS.map((cols, i) => (
          <div key={i} className="c64-bar">
            {cols.map((c, j) => (
              <span key={j} style={{ background: C64_COLORS[c] }} />
            ))}
          </div>
        ))}
      </div>
      <div className="c64-logo" aria-label="Markus">
        MARKUS
      </div>
      <div className="c64-line c64-center" style={{ top: 92, color: C64_COLORS[15] }}>
        PRESENTS: EINE ZEITREISE 1986-1999
      </div>
      <div className="c64-menu">
        <div className="c64-line" style={{ color: C64_COLORS[13] }}>
          MEINE TOP 7 ANNO 1986:
        </div>
        {GAMES.c64.map((g, i) => (
          <div key={g} className="c64-line" style={{ color: C64_COLORS[washColors[(i + wash) % washColors.length]] }}>
            {i + 1}. {g.toUpperCase()}
          </div>
        ))}
      </div>
      <div className="c64-keys">
        <button type="button" onClick={() => openLink(LINKS.c64Games)}>
          <span className="c64-inv">F1</span> SPIELE ONLINE
        </button>
        <button type="button" onClick={onUpgrade}>
          <span className="c64-inv">SPACE</span> UPGRADE
        </button>
      </div>
      <div ref={scrollRef} className="c64-scroller" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <p className="sr-only">{C64_SCROLLER}</p>
    </div>
  );
};

const C64: React.FC<EraProps> = ({ next }) => {
  const [phase, setPhase] = useState<Phase>('basic');
  const [lines, setLines] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { setLeds } = useMachine();

  useScript(async ({ wait, skipping }) => {
    setLines(BOOT);
    await wait(1400);
    const type = async (text: string) => {
      for (const ch of text) {
        setLines((l) => [...l.slice(0, -1), l[l.length - 1] + ch]);
        if (!skipping()) sfx.key();
        await wait(110);
      }
      await wait(250);
    };
    await type('LOAD"*",8,1');
    setBusy(true);
    setLines((l) => [...l, '', 'SEARCHING FOR *']);
    setLeds((s) => ({ ...s, drive: true }));
    if (!skipping()) sfx.floppy(3.6);
    await wait(1300);
    setLines((l) => [...l, 'LOADING']);
    await wait(2400);
    setLeds((s) => ({ ...s, drive: false }));
    setLines((l) => [...l, 'READY.', '']);
    setBusy(false);
    await wait(600);
    await type('RUN');
    setLines((l) => [...l, '']);
    setPhase('decrunch');
    await wait(1500);
    setPhase('intro');
  }, []);

  useEffect(() => () => setLeds((s) => ({ ...s, drive: false })), [setLeds]);

  useKeydown((e) => {
    if (phase !== 'intro') return;
    if (e.key === ' ') {
      e.preventDefault();
      next();
    } else if (e.key === 'F1') {
      e.preventDefault();
      openLink(LINKS.c64Games);
    }
  });

  return (
    <div className="c64" onClick={phase === 'basic' ? requestSkip : undefined}>
      {phase === 'basic' && (
        <div className="c64-border">
          <div className="c64-screen">
            {lines.map((line, i) => (
              <div key={i} className="c64-row">
                {line}
                {i === lines.length - 1 && !busy && <span className="c64-cursor" />}
              </div>
            ))}
          </div>
        </div>
      )}
      {phase === 'decrunch' && <Decrunch />}
      {phase === 'intro' && <Cracktro onUpgrade={next} />}
    </div>
  );
};

export default C64;
