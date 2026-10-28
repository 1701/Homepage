import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Machine from './components/Machine';
import { MachineContext, type Leds, type Power, type ScreenMode } from './components/machineContext';
import Timeline from './components/Timeline';
import ImprintModal from './components/ImprintModal';
import Intro from './components/Intro';
import { ERAS, type EraId } from './content';
import { requestSkip, useKeydown } from './lib/hooks';
import { onSoundChange, setSoundEnabled, sfx, storedSoundPreference } from './lib/audio';
import type { EraProps } from './eras/types';
import C64 from './eras/C64';
import Dos386 from './eras/Dos386';
import Adventure486 from './eras/Adventure486';
import Win95 from './eras/Win95';
import Internet97 from './eras/Internet97';
import Shutdown99 from './eras/Shutdown99';

const WIN_MODES: ScreenMode[] = [
  { w: 640, h: 480 },
  { w: 800, h: 600 },
  { w: 1024, h: 768 },
];

const SCREENS: Record<EraId, { modes: ScreenMode[]; fluid?: boolean; Component: React.FC<EraProps> }> = {
  c64: { modes: [{ w: 368, h: 248 }], Component: C64 },
  i386: { modes: [{ w: 640, h: 400, aspect: 1.2 }, { w: 320, h: 400, aspect: 1.2 }], Component: Dos386 },
  i486: { modes: [{ w: 320, h: 200, aspect: 1.2 }], Component: Adventure486 },
  pentium: { modes: WIN_MODES, fluid: true, Component: Win95 },
  mmx: { modes: WIN_MODES, fluid: true, Component: Internet97 },
  p2: { modes: WIN_MODES, fluid: true, Component: Shutdown99 },
};

const eraFromHash = (): number => {
  const year = Number(window.location.hash.slice(1));
  const i = ERAS.findIndex((e) => e.year === year);
  return i < 0 ? 0 : i;
};

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [eraIdx, setEraIdx] = useState(eraFromHash);
  const [power, setPower] = useState<Power>('off');
  const [quick, setQuick] = useState(false);
  const [sound, setSound] = useState(false);
  const [showImprint, setShowImprint] = useState(false);
  const [leds, setLeds] = useState<Leds>({ hdd: false, drive: false, turbo: true });
  const timers = useRef<number[]>([]);

  const era = ERAS[eraIdx];
  const screen = SCREENS[era.id];

  useEffect(() => onSoundChange(setSound), []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const powerOn = useCallback(() => {
    setPower('turning-on');
    sfx.powerOn();
    later(() => setPower('on'), 650);
  }, [later]);

  const goToIndex = useCallback(
    (i: number, viaTimeline: boolean) => {
      if (i < 0 || i >= ERAS.length) return;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setQuick(viaTimeline);
      setPower('turning-off');
      sfx.powerOff();
      later(() => {
        setPower('off');
        setEraIdx(i);
        setLeds({ hdd: false, drive: false, turbo: true });
        window.history.replaceState(null, '', `#${ERAS[i].year}`);
      }, 450);
      later(powerOn, 1000);
    },
    [later, powerOn],
  );

  const start = (withSound: boolean, direct = false) => {
    setSoundEnabled(withSound);
    setStarted(true);
    if (direct) {
      const i = ERAS.findIndex((e) => e.id === 'mmx');
      setEraIdx(i);
      setQuick(true);
      window.history.replaceState(null, '', `#${ERAS[i].year}`);
    }
    powerOn();
  };

  useKeydown((e) => {
    if (e.key === 'Escape') {
      if (showImprint) setShowImprint(false);
      else requestSkip();
    }
  });

  const eraProps = useMemo(
    () => ({
      next: () => goToIndex(eraIdx + 1, false),
      goTo: (id: EraId) => goToIndex(ERAS.findIndex((e) => e.id === id), true),
      quick,
      openImprint: () => setShowImprint(true),
    }),
    [eraIdx, goToIndex, quick],
  );

  const { Component } = screen;

  return (
    <MachineContext.Provider value={{ leds, setLeds }}>
      <div className="room">
        <Machine
          era={era}
          modes={screen.modes}
          fluid={screen.fluid}
          power={started ? power : 'off'}
          overlay={!started && <Intro onStart={start} initialSound={storedSoundPreference()} />}
        >
          {(info) => <Component key={era.id} screen={info} {...eraProps} />}
        </Machine>
        <Timeline
          current={started ? era.id : null}
          sound={sound}
          onSelect={(id) => {
            const i = ERAS.findIndex((e) => e.id === id);
            if (!started) {
              setEraIdx(i);
              start(sound);
            } else if (i !== eraIdx) goToIndex(i, true);
          }}
          onSkip={requestSkip}
          onToggleSound={() => setSoundEnabled(!sound)}
          onImprint={() => setShowImprint(true)}
        />
        {showImprint && <ImprintModal onClose={() => setShowImprint(false)} />}
      </div>
    </MachineContext.Provider>
  );
};

export default App;
