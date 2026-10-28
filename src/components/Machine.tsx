import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Era } from '../content';
import { useMachine, type Leds, type Power, type ScreenInfo, type ScreenMode } from './machineContext';

interface MachineProps {
  era: Era;
  modes: ScreenMode[];
  fluid?: boolean;
  power: Power;
  children: (screen: ScreenInfo) => React.ReactNode;
  overlay?: React.ReactNode;
}

interface Layout {
  screen: ScreenInfo;
  aspect: number;
  compact: boolean;
  // schwarzer Rand zwischen Bild und Röhrenkante
  overscan?: number;
}

// Größte Auflösung × ganzzahliger Faktor, die in den verfügbaren Platz passt
const pickLayout = (aw: number, ah: number, modes: ScreenMode[], fluid: boolean, compact: boolean): Layout => {
  let best: Layout | null = null;
  let bestArea = 0;
  for (const m of modes) {
    const aspect = m.aspect ?? 1;
    for (let k = 1; k <= 6; k++) {
      const w = m.w * k;
      const h = m.h * k * aspect;
      if (w > aw || h > ah) break;
      if (w * h > bestArea) {
        bestArea = w * h;
        best = { screen: { w: m.w, h: m.h, scale: k, fluid: false }, aspect, compact };
      }
    }
  }
  if (best) return best;
  if (fluid) return { screen: { w: Math.floor(aw), h: Math.floor(ah), scale: 1, fluid: true }, aspect: 1, compact };
  const m = modes[0];
  const aspect = m.aspect ?? 1;
  const k = Math.min(aw / m.w, ah / (m.h * aspect));
  return { screen: { w: m.w, h: m.h, scale: k, fluid: false }, aspect, compact };
};

const Seg: React.FC<{ value: string }> = ({ value }) => (
  <span className="seg" aria-label={`${value} MHz`}>
    <span className="seg-ghost">{'8'.repeat(value.length)}</span>
    <span className="seg-value">{value}</span>
  </span>
);

const C64Desk: React.FC<{ drive: boolean; compact: boolean }> = ({ drive, compact }) => (
  <div className="desk desk-c64">
    <div className="breadbin">
      {!compact && (
        <div className="breadbin-keys">
          {Array.from({ length: 4 }, (_, r) => (
            <div key={r} className="key-row">
              {Array.from({ length: r === 3 ? 1 : 15 - r }, (_, i) => (
                <span key={i} className={r === 3 ? 'key space' : 'key'} />
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="breadbin-badge">
        <span className="led led-red on" />
        <span>commodore 64</span>
      </div>
    </div>
    <div className="drive1541">
      <div className="drive-slot" />
      <div className="drive-front">
        <span className="led led-green on" title="Power" />
        <span className={`led led-red ${drive ? 'on' : ''}`} title="Drive" />
        {!compact && <span className="drive-label">1541</span>}
      </div>
    </div>
  </div>
);

const PcCase: React.FC<{ era: Era; leds: Leds; compact: boolean }> = ({ era, leds, compact }) => (
  <div className="desk desk-pc">
    {!compact && (
      <div className="pc-drives">
        <span className="bay bay-525" />
        <span className="bay bay-35" />
      </div>
    )}
    <span className="pc-brand">HIGHSCREEN</span>
    <div className="pc-panel">
      {era.mhz && <Seg value={leds.turbo ? era.mhz : String(Math.round(Number(era.mhz) / 2))} />}
      <div className="pc-leds">
        <span className="led led-green on" title="Power" />
        <span className={`led led-yellow ${leds.turbo ? 'on' : ''}`} title="Turbo" />
        <span className={`led led-red ${leds.hdd ? 'on' : ''}`} title="HDD" />
      </div>
      {!compact && (
        <div className="pc-buttons">
          <span className="pc-btn">TURBO</span>
          <span className="pc-btn">RESET</span>
        </div>
      )}
    </div>
  </div>
);

const Machine: React.FC<MachineProps> = ({ era, modes, fluid = false, power, children, overlay }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const { leds } = useMachine();

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const compact = r.width < 640 || r.height < 520;
      const bezelX = compact ? 12 : era.monitor === 'c64' ? 30 : 28;
      const bezelY = compact ? 12 + 14 : era.monitor === 'c64' ? 30 + 40 : 28 + 34;
      const desk = compact ? 34 : 58;
      const over = era.monitor === 'c64' ? 0 : compact ? 9 : 14;
      const margin = compact ? 8 : 32;
      const aw = r.width - bezelX * 2 - margin - over * 2;
      const ah = r.height - bezelY - desk - margin - over * 2;
      setLayout({ ...pickLayout(aw, ah, modes, fluid, compact), overscan: over });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [era.monitor, modes, fluid]);

  const screen = layout?.screen;
  const outerW = screen ? (screen.fluid ? screen.w : screen.w * screen.scale) : 0;
  const outerH = screen ? (screen.fluid ? screen.h : screen.h * screen.scale * (layout?.aspect ?? 1)) : 0;
  const lineSize = screen && !screen.fluid ? screen.scale * (layout?.aspect ?? 1) : 0;

  return (
    <div ref={stageRef} className="stage">
      {layout && screen && (
        <div className={`rig rig-${era.monitor} ${layout.compact ? 'compact' : ''}`}>
          <div className={`monitor monitor-${era.monitor}`}>
            <div
              className="tube"
              style={{ width: outerW + (layout.overscan ?? 0) * 2, height: outerH + (layout.overscan ?? 0) * 2 }}
            >
              <div className={`raster power-${power}`} style={{ inset: layout.overscan }}>
                {power !== 'off' && (
                  <div
                    className="native"
                    style={{
                      width: screen.w,
                      height: screen.h,
                      transform: screen.fluid ? undefined : `scale(${screen.scale}, ${screen.scale * layout.aspect})`,
                    }}
                  >
                    {children(screen)}
                  </div>
                )}
              </div>
              {lineSize >= 2 && <div className="scanlines" style={{ backgroundSize: `100% ${lineSize}px` }} />}
              <div className="glass" />
              {overlay}
            </div>
            <div className="monitor-chin">
              {era.monitor === 'c64' ? (
                <span className="monitor-label">
                  <span className="cbm-logo" aria-hidden="true" />
                  commodore 1084S
                </span>
              ) : (
                <span className="monitor-label">SVGA 14"</span>
              )}
              <span className={`led led-green ${power === 'off' ? '' : 'on'}`} />
            </div>
          </div>
          {era.monitor === 'c64' ? (
            <C64Desk drive={leds.drive} compact={layout.compact} />
          ) : (
            <PcCase era={era} leds={leds} compact={layout.compact} />
          )}
        </div>
      )}
    </div>
  );
};

export default Machine;
