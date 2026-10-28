import React, { useEffect, useMemo, useRef, useState } from 'react';
import PixelArt from '../../components/PixelArt';
import type { ScreenInfo } from '../../components/machineContext';
import { ICONS, W95_PALETTE, type IconName } from './icons';
import type { DesktopIcon, Program, StartItem, WindowManager, WinState } from './wm';

export const Icon: React.FC<{ name: IconName; size?: 16 | 32 }> = ({ name, size = 32 }) => (
  <PixelArt rows={ICONS[name]} palette={W95_PALETTE} scale={size / 16} />
);

const GLYPHS: Record<'min' | 'max' | 'close', string[]> = {
  min: ['........', '........', '........', '........', '........', '........', 'kkkkkk..', 'kkkkkk..'],
  max: ['kkkkkkkkk', 'kkkkkkkkk', 'k.......k', 'k.......k', 'k.......k', 'k.......k', 'k.......k', 'kkkkkkkkk'],
  close: ['kk....kk', '.kk..kk.', '..kkkk..', '...kk...', '..kkkk..', '.kk..kk.', 'kk....kk', '........'],
};

const Clock: React.FC = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return <span>{now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>;
};

const TitleButton: React.FC<{ glyph: keyof typeof GLYPHS; label: string; onClick: () => void }> = ({ glyph, label, onClick }) => (
  <button
    type="button"
    className="w95-titlebtn"
    aria-label={label}
    onPointerDown={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <PixelArt rows={GLYPHS[glyph]} palette={W95_PALETTE} scale={1} />
  </button>
);

const StartMenuList: React.FC<{ items: StartItem[]; onDone: () => void; root?: boolean }> = ({ items, onDone, root }) => {
  const [openSub, setOpenSub] = useState<number | null>(null);
  return (
    <ul className={root ? 'w95-startlist' : 'w95-submenu w95-raised'}>
      {items.map((item, i) => (
        <li key={item.label} onMouseEnter={() => setOpenSub(item.sub ? i : null)}>
          <button
            type="button"
            className={`w95-startitem ${openSub === i ? 'open' : ''} ${root ? 'big' : ''}`}
            onClick={() => {
              if (item.sub) setOpenSub(openSub === i ? null : i);
              else {
                item.action?.();
                onDone();
              }
            }}
          >
            <Icon name={item.icon} size={root ? 32 : 16} />
            <span>{item.label}</span>
            {item.sub && <span className="w95-arrow">▸</span>}
          </button>
          {item.sub && openSub === i && <StartMenuList items={item.sub} onDone={onDone} />}
        </li>
      ))}
    </ul>
  );
};

interface DesktopProps {
  wm: WindowManager;
  screen: ScreenInfo;
  programs: Program[];
  icons: DesktopIcon[];
  startMenu: StartItem[];
  brand: string;
  tray?: React.ReactNode;
}

const TASKBAR_H = 28;

const Desktop: React.FC<DesktopProps> = ({ wm, screen, programs, icons, startMenu, brand, tray }) => {
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const maximizeAll = screen.w < 600 || screen.h < 420;
  const deskH = screen.h - TASKBAR_H;
  const coarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const byId = useMemo(() => Object.fromEntries(programs.map((p) => [p.id, p])), [programs]);

  const topId = [...wm.wins].reverse().find((w) => !w.min)?.id;

  const place = (w: WinState, p: Program) => {
    if (maximizeAll) return { left: 0, top: 0, width: screen.w, height: deskH };
    const width = Math.min(p.w, screen.w - 8);
    const height = Math.min(p.h, deskH - 8);
    // negative Koordinaten = noch nicht platziert → kaskadieren bzw. Wunschposition
    const cascade = -1 - w.x;
    const left = w.x >= 0 ? w.x : p.x ?? Math.max(8, Math.min(screen.w - width - 8, 90 + cascade * 24));
    const top = w.y >= 0 ? w.y : p.y ?? Math.max(8, Math.min(deskH - height - 8, 30 + cascade * 24));
    return { left: Math.max(0, Math.min(screen.w - 40, left)), top: Math.max(0, Math.min(deskH - 20, top)), width, height };
  };

  const focus = (id: string) =>
    wm.setWins((ws) => {
      const w = ws.find((x) => x.id === id);
      return w ? [...ws.filter((x) => x.id !== id), w] : ws;
    });

  const onTitleDown = (e: React.PointerEvent, w: WinState, p: Program) => {
    focus(w.id);
    if (maximizeAll) return;
    const pos = place(w, p);
    drag.current = { id: w.id, dx: e.clientX / screen.scale - pos.left, dy: e.clientY / screen.scale - pos.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTitleMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.round(e.clientX / screen.scale - d.dx);
    const y = Math.round(e.clientY / screen.scale - d.dy);
    wm.setWins((ws) => ws.map((w) => (w.id === d.id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w)));
  };

  const message = wm.messages[0];

  return (
    <div className="w95" style={{ width: screen.w, height: screen.h }} onPointerDown={() => setSelected(null)}>
      <div className="w95-desk" style={{ height: deskH }} onPointerDown={() => setStartOpen(false)}>
        <div className="w95-icons">
          {icons.map((ic) => (
            <button
              key={ic.id}
              type="button"
              className={`w95-deskicon ${selected === ic.id ? 'selected' : ''}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelected(ic.id);
              }}
              onDoubleClick={ic.open}
              onClick={() => coarse && ic.open()}
              onKeyDown={(e) => e.key === 'Enter' && ic.open()}
            >
              <Icon name={ic.icon} />
              <span>{ic.label}</span>
            </button>
          ))}
        </div>

        {wm.wins.map((w) => {
          const p = byId[w.id];
          if (!p || w.min) return null;
          const pos = place(w, p);
          const active = w.id === topId && !message;
          if (p.skin)
            return (
              <section
                key={w.id}
                className={`skin-window skin-${p.skin}`}
                style={{ left: pos.left, top: pos.top, width: maximizeAll ? screen.w : p.w }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  focus(w.id);
                  setStartOpen(false);
                }}
                aria-label={p.title}
              >
                <header
                  className="skin-titlebar"
                  onPointerDown={(e) => onTitleDown(e, w, p)}
                  onPointerMove={onTitleMove}
                  onPointerUp={() => (drag.current = null)}
                >
                  <span>{p.title.toUpperCase()}</span>
                  <button
                    type="button"
                    className="skin-close"
                    aria-label="Schließen"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      p.onClose?.();
                      wm.close(w.id);
                    }}
                  >
                    ×
                  </button>
                </header>
                {p.body}
              </section>
            );
          return (
            <section
              key={w.id}
              className="w95-window w95-raised"
              style={pos}
              onPointerDown={(e) => {
                e.stopPropagation();
                focus(w.id);
                setStartOpen(false);
              }}
              aria-label={p.title}
            >
              <header
                className={`w95-titlebar ${active ? '' : 'inactive'}`}
                onPointerDown={(e) => onTitleDown(e, w, p)}
                onPointerMove={onTitleMove}
                onPointerUp={() => (drag.current = null)}
              >
                <Icon name={p.icon} size={16} />
                <span className="w95-title">{p.title}</span>
                <TitleButton glyph="min" label="Minimieren" onClick={() => wm.setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, min: true } : x)))} />
                <TitleButton glyph="max" label="Maximieren" onClick={() => {}} />
                <TitleButton
                  glyph="close"
                  label="Schließen"
                  onClick={() => {
                    p.onClose?.();
                    wm.close(w.id);
                  }}
                />
              </header>
              {p.menu && (
                <nav className="w95-menubar">
                  {p.menu.map((m) => (
                    <span key={m}>
                      <u>{m[0]}</u>
                      {m.slice(1)}
                    </span>
                  ))}
                </nav>
              )}
              <div className={`w95-body ${p.bodyClass ?? ''}`}>{p.body}</div>
            </section>
          );
        })}

        {message && (
          <div className="w95-modal">
            <section className="w95-window w95-raised w95-msgbox" role="alertdialog" aria-label={message.title}>
              <header className="w95-titlebar">
                <span className="w95-title">{message.title}</span>
                <TitleButton glyph="close" label="Schließen" onClick={() => wm.setMessages((ms) => ms.slice(1))} />
              </header>
              <div className="w95-msgbody">
                {message.icon && <Icon name={message.icon} />}
                <div>
                  {message.text.map((t, i) => (
                    <p key={i}>{t}</p>
                  ))}
                </div>
              </div>
              <div className="w95-msgbuttons">
                {message.buttons.map((b, i) => (
                  <button
                    key={b.label}
                    type="button"
                    className="w95-button"
                    autoFocus={i === 0}
                    onClick={() => {
                      wm.setMessages((ms) => ms.slice(1));
                      b.action?.();
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {startOpen && (
        <div className="w95-startmenu w95-raised" onPointerDown={(e) => e.stopPropagation()}>
          <div className="w95-startband">
            <span>
              <b>{brand}</b>95
            </span>
          </div>
          <StartMenuList items={startMenu} onDone={() => setStartOpen(false)} root />
        </div>
      )}

      <footer className="w95-taskbar w95-raised" style={{ height: TASKBAR_H }}>
        <button
          type="button"
          className={`w95-button w95-startbtn ${startOpen ? 'pressed' : ''}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setStartOpen((o) => !o)}
        >
          <Icon name="start" size={16} />
          <b>Start</b>
        </button>
        <div className="w95-tasks">
          {wm.wins.map((w) => {
            const p = byId[w.id];
            if (!p) return null;
            return (
              <button
                key={w.id}
                type="button"
                className={`w95-button w95-task ${w.id === topId ? 'pressed' : ''}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() =>
                  w.id === topId
                    ? wm.setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, min: true } : x)))
                    : wm.open(w.id)
                }
              >
                <Icon name={p.icon} size={16} />
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>
        <div className="w95-tray">
          {tray}
          <Icon name="speaker" size={16} />
          <Clock />
        </div>
      </footer>
    </div>
  );
};

export default Desktop;
