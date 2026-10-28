import React, { useState } from 'react';
import { ERAS, LINKS, PERSON } from '../content';
import { sfx } from '../lib/audio';
import { useScript } from '../lib/hooks';
import PcBoot, { Splash } from './win95/Boot';
import type { EraProps } from './types';

const ERA = ERAS.find((e) => e.id === 'p2')!;

const Shutdown99: React.FC<EraProps> = ({ goTo, openImprint }) => {
  const [stage, setStage] = useState<'boot' | 'wait' | 'off'>('boot');
  const [links, setLinks] = useState(false);

  useScript(
    async ({ wait }) => {
      if (stage === 'wait') {
        await wait(2800);
        sfx.powerOff();
        setStage('off');
      } else if (stage === 'off') {
        await wait(1600);
        setLinks(true);
      }
    },
    [stage],
  );

  if (stage === 'boot')
    return (
      <PcBoot
        bios="Modular BIOS v6.00PG, (C) 1999"
        machine={ERA.machine}
        cpu={`Pentium II CPU at ${ERA.mhz} MHz`}
        memK={65536}
        extra={['Detecting IDE Primary Master ... 8.4 GB', 'Detecting IDE Secondary Master ... DVD-ROM', 'Jahr-2000-Test ............... bestanden', '', 'Zeit, Schluss zu machen ...']}
        splash="none"
        onDone={() => setStage('wait')}
      />
    );

  if (stage === 'wait')
    return <Splash brand="Markus" sub="Bitte warten Sie, während der Computer heruntergefahren wird." bar={false} />;

  return (
    <div className="win-shutdown">
      <p className="win-shutdown-text">Sie können den Computer jetzt ausschalten.</p>
      {links && (
        <div className="finale">
          <p>Danke für deinen Besuch auf meiner Zeitreise!</p>
          <p className="finale-name">
            {PERSON.name} · {PERSON.tagline} · heute
          </p>
          <nav className="finale-links">
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <button type="button" onClick={openImprint}>
              Impressum
            </button>
            <button type="button" onClick={() => goTo('c64')}>
              ↻ Neu starten (1986)
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Shutdown99;
