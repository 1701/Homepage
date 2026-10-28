import React, { useEffect, useState } from 'react';
import { useMachine } from '../../components/machineContext';
import { sfx } from '../../lib/audio';
import { requestSkip, useScript } from '../../lib/hooks';

interface PcBootProps {
  bios: string;
  machine: string;
  cpu: string;
  memK: number;
  extra: string[];
  splash: 'start' | 'none';
  brand?: string;
  onDone: () => void;
}

const CLOUDS = [
  { x: 8, y: 12, w: 140, h: 46 },
  { x: 62, y: 8, w: 110, h: 40 },
  { x: 24, y: 70, w: 160, h: 50 },
  { x: 70, y: 64, w: 120, h: 44 },
  { x: -6, y: 46, w: 90, h: 36 },
  { x: 40, y: 34, w: 80, h: 30 },
];

export const Splash: React.FC<{ brand: string; sub: string; bar?: boolean }> = ({ brand, sub, bar = true }) => (
  <div className="win-splash">
    {CLOUDS.map((c, i) => (
      <span key={i} className="cloud" style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.w, height: c.h }} />
    ))}
    <div className="win-splash-logo">
      <b>{brand}</b>
      <span>95</span>
    </div>
    <div className="win-splash-sub">{sub}</div>
    {bar && <div className="win-splash-bar" />}
  </div>
);

const PcBoot: React.FC<PcBootProps> = ({ bios, machine, cpu, memK, extra, splash, brand = 'Markus', onDone }) => {
  const [mem, setMem] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [stage, setStage] = useState<'post' | 'starting' | 'splash'>('post');
  const { setLeds } = useMachine();

  useScript(async ({ wait, skipping }) => {
    setLines([]);
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(1);
    const step = memK / 24;
    for (let k = 0; k <= memK; k += step) {
      setMem(Math.round(k));
      await wait(40);
    }
    setMem(memK);
    setLeds((l) => ({ ...l, hdd: false }));
    if (!skipping()) sfx.beep(1000, 0.15);
    for (const l of extra) {
      setLines((ls) => [...ls, l]);
      await wait(260);
    }
    await wait(700);
    if (splash === 'none') return onDone();
    setStage('starting');
    await wait(900);
    setStage('splash');
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(2.4);
    await wait(2600);
    setLeds((l) => ({ ...l, hdd: false }));
    onDone();
  }, []);

  useEffect(() => () => setLeds((l) => ({ ...l, hdd: false })), [setLeds]);

  if (stage === 'splash') return <div onClick={requestSkip}><Splash brand={brand} sub="Eine Zeitreise · Pentium-Edition" /></div>;

  return (
    <div className="pc-boot" onClick={requestSkip}>
      {stage === 'starting' ? (
        <div>Windows 95 wird gestartet...</div>
      ) : (
        <>
          <div className="bright">{bios}</div>
          <div>{machine} System BIOS</div>
          <div> </div>
          <div>{cpu}</div>
          <div>
            Memory Test : {String(mem).padStart(6)}K {mem >= memK ? 'OK' : ''}
          </div>
          <div> </div>
          {lines.map((l, i) => (
            <div key={i}>{l || ' '}</div>
          ))}
        </>
      )}
    </div>
  );
};

export default PcBoot;
