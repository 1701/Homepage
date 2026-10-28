import React, { useEffect, useRef, useState } from 'react';
import { ERAS, LINKS, README_386 } from '../content';
import { useMachine } from '../components/machineContext';
import { sfx } from '../lib/audio';
import { openLink, requestSkip, useScript } from '../lib/hooks';
import type { EraProps } from './types';

type Line = string | { cmd: string; text: string };

const ERA = ERAS.find((e) => e.id === 'i386')!;

const GAME_DIRS: { dir: string; reply: Line[] }[] = [
  { dir: 'WINGCMDR', reply: ['Wing Commander benoetigt 589K freien konventionellen Speicher.', 'Verfuegbar: 571K. Zeit, die CONFIG.SYS umzubauen ...'] },
  { dir: 'LEMMINGS', reply: ['Let\'s go!', '', '57 Lemminge gerettet, 3 verloren. Oh no!'] },
  { dir: 'MONKEY', reply: ['Bitte Diskette 2 einlegen und eine Taste druecken.'] },
  { dir: 'MONKEY2', reply: ['Nicht genuegend Speicher.', 'Bitte EMM386.EXE aus der CONFIG.SYS entfernen und neu starten.'] },
  { dir: 'INDY3', reply: ['Kopierschutz: Bitte das Gralstagebuch bereithalten.'] },
  { dir: 'INDY4', reply: ['Sound Blaster gefunden (A220 I5 D1). Ton: bombastisch.'] },
  { dir: 'TENTACLE', reply: ['Dieses Spiel braucht einen 486er.', { cmd: 'UPGRADE', text: 'Tippe UPGRADE.' }] },
  { dir: 'STRIKE', reply: ['Strike Commander braucht einen 486er mit 8 MB RAM.', { cmd: 'UPGRADE', text: 'Tippe UPGRADE.' }] },
];

const HELP: Line[] = [
  'Verfuegbare Befehle (anklicken oder eintippen):',
  '',
  { cmd: 'DIR', text: '  DIR              Verzeichnis anzeigen' },
  { cmd: 'CD SPIELE', text: '  CD SPIELE        Zu meinen Spielen wechseln' },
  { cmd: 'TYPE README.TXT', text: '  TYPE README.TXT  Datei anzeigen' },
  { cmd: 'MEM', text: '  MEM              Speicher anzeigen' },
  { cmd: 'VER', text: '  VER              DOS-Version' },
  { cmd: 'ARCHIV', text: '  ARCHIV           DOS-Spiele online spielen' },
  { cmd: 'CLS', text: '  CLS              Bildschirm loeschen' },
  { cmd: 'UPGRADE', text: '  UPGRADE          Weiter zum 486er' },
];

const pad = (s: string, n: number) => (s + ' '.repeat(n)).slice(0, n);

const dirListing = (cwd: string, narrow: boolean): Line[] => {
  const head = [' Datentraeger in Laufwerk C hat keine Bezeichnung', ` Verzeichnis von ${cwd}`, ''];
  const entries: [string, string, string][] =
    cwd === 'C:\\SPIELE'
      ? [['.', '', '<DIR>'], ['..', '', '<DIR>'], ...GAME_DIRS.map((g) => [g.dir, '', '<DIR>'] as [string, string, string])]
      : [
          ['COMMAND', 'COM', '47845'],
          ['AUTOEXEC', 'BAT', '142'],
          ['CONFIG', 'SYS', '187'],
          ['README', 'TXT', '512'],
          ['DOS', '', '<DIR>'],
          ['SPIELE', '', '<DIR>'],
          ['WINDOWS', '', '<DIR>'],
        ];
  const rows: Line[] = entries.map(([n, ext, size]) => {
    const text = `${pad(n, 9)}${pad(ext, 4)}${size.padStart(narrow ? 7 : 9)}${narrow ? '' : '  14.08.91  21:12'}`;
    if (size === '<DIR>' && n !== '.' && n !== '..') return { cmd: cwd === 'C:\\' ? `CD ${n}` : n, text };
    if (n === 'README') return { cmd: 'TYPE README.TXT', text };
    return text;
  });
  return [...head, ...rows, `${String(entries.length).padStart(9)} Datei(en)`, `${'2875392'.padStart(18)} Byte frei`];
};

const Dos386: React.FC<EraProps> = ({ next, screen }) => {
  const narrow = screen.w < 640;
  const [phase, setPhase] = useState<'post' | 'dos' | 'prompt'>('post');
  const [mem, setMem] = useState(0);
  const [boot, setBoot] = useState<string[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [cwd, setCwd] = useState('C:\\');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const { setLeds } = useMachine();

  useScript(async ({ wait, skipping }) => {
    setBoot([]);
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(1.2);
    for (let k = 0; k <= 4096; k += 128) {
      setMem(k);
      await wait(45);
    }
    await wait(500);
    setLeds((l) => ({ ...l, hdd: false }));
    if (!skipping()) sfx.beep(1000, 0.18);
    await wait(1400);
    setPhase('dos');
    const bootLines = [
      'MS-DOS wird gestartet...',
      '',
      'HIMEM: DOS XMS-Treiber, Version 2.77',
      '64K High Memory Area verfuegbar.',
      '',
      'SMARTDrive-Cache installiert.',
      'Maustreiber installiert',
      'SET BLASTER=A220 I5 D1 T3',
      '',
    ];
    setLeds((l) => ({ ...l, hdd: true }));
    if (!skipping()) sfx.hdd(1.6);
    for (const l of bootLines) {
      setBoot((b) => [...b, l]);
      await wait(180);
    }
    setLeds((l) => ({ ...l, hdd: false }));
    setLines([
      ...bootLines,
      'Willkommen auf meinem 386er!',
      { cmd: 'HILFE', text: 'Tippe HILFE und druecke ENTER - oder klicke hier.' },
      '',
    ]);
    setPhase('prompt');
  }, []);

  useEffect(() => () => setLeds((l) => ({ ...l, hdd: false })), [setLeds]);

  useEffect(() => {
    if (phase === 'prompt') inputRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, boot, input]);

  const run = (raw: string) => {
    const cmd = raw.trim().toUpperCase().replace(/\s+/g, ' ');
    const echo: Line = `${cwd}>${raw}`;
    let out: Line[] = [];
    let after: (() => void) | null = null;
    const game = cwd === 'C:\\SPIELE' && GAME_DIRS.find((g) => g.dir === cmd || `CD ${g.dir}` === cmd);

    if (!cmd) out = [];
    else if (cmd === 'HILFE' || cmd === 'HELP' || cmd === '?') out = HELP;
    else if (cmd === 'DIR' || cmd === 'DIR /W' || cmd === 'DIR /P') out = dirListing(cwd, narrow);
    else if (cmd === 'CD SPIELE' || cmd === 'CD\\SPIELE' || cmd === 'CD \\SPIELE' || (cmd === 'SPIELE' && cwd === 'C:\\')) {
      setCwd('C:\\SPIELE');
      out = [{ cmd: 'DIR', text: 'Tipp: DIR zeigt meine Lieblingsspiele.' }];
    } else if (cmd === 'CD ..' || cmd === 'CD..' || cmd === 'CD \\' || cmd === 'CD\\') setCwd('C:\\');
    else if (game) out = game.reply;
    else if (cmd.startsWith('CD ')) out = ['Ungueltiges Verzeichnis'];
    else if (cmd === 'TYPE README.TXT' || cmd === 'README' || cmd === 'README.TXT')
      out = cwd === 'C:\\' ? README_386 : ['Datei nicht gefunden - README.TXT'];
    else if (cmd === 'MEM')
      out = [
        '',
        '   655360 Byte konventioneller Speicher insgesamt',
        '   655360 Byte fuer MS-DOS verfuegbar',
        '   584704 Byte maximale Programmgroesse',
        '',
        '  3145728 Byte Erweiterungsspeicher (XMS)',
        '',
      ];
    else if (cmd === 'VER') out = ['', 'MS-DOS Version 5.00', ''];
    else if (cmd === 'CLS') {
      setLines([]);
      setInput('');
      return;
    } else if (cmd === 'ARCHIV' || cmd === 'ARCHIVE') {
      out = ['Verbinde mit dem Internet Archive ...', '(Das Internet kommt erst 1997 - aber wir machen mal eine Ausnahme.)'];
      openLink(LINKS.dosGames);
    } else if (cmd === 'UPGRADE' || cmd === 'EXIT') {
      out = ['Bitte Schraubenzieher bereithalten ...', 'Rechner wird aufgeruestet.'];
      after = next;
    } else if (cmd === 'WIN') out = ['Windows? Erst mal Spiele.'];
    else if (cmd.startsWith('FORMAT')) out = ['Netter Versuch.'];
    else if (cmd.startsWith('DEL') || cmd.startsWith('ERASE')) out = ['Alle Dateien werden geloescht! Sind Sie sicher (J/N)? N'];
    else if (cmd.startsWith('LOAD')) out = ['Das hier ist kein C64 mehr ;-)'];
    else if (cmd === 'AUTOEXEC.BAT' || cmd === 'TYPE AUTOEXEC.BAT')
      out = ['@ECHO OFF', 'PROMPT $P$G', 'PATH C:\\DOS;C:\\WINDOWS', 'LH C:\\DOS\\MOUSE.COM', 'LH C:\\DOS\\SMARTDRV.EXE', 'SET BLASTER=A220 I5 D1 T3'];
    else if (cmd === 'CONFIG.SYS' || cmd === 'TYPE CONFIG.SYS')
      out = ['DEVICE=C:\\DOS\\HIMEM.SYS', 'DOS=HIGH,UMB', 'FILES=30', 'BUFFERS=20'];
    else out = ['Befehl oder Dateiname nicht gefunden'];

    setLines((l) => [...l, echo, ...out, ''].slice(-200));
    if (raw.trim()) setHistory((h) => [raw, ...h].slice(0, 30));
    setHistIdx(-1);
    setInput('');
    if (after) window.setTimeout(after, 1200);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(histIdx + 1, history.length - 1);
      if (i >= 0) {
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = histIdx - 1;
      setHistIdx(i);
      setInput(i >= 0 ? history[i] : '');
    } else if (e.key.length === 1 || e.key === 'Backspace') sfx.key();
  };

  const renderLine = (l: Line, i: number) =>
    typeof l === 'string' ? (
      <div key={i} className="dos-line">
        {l || ' '}
      </div>
    ) : (
      <button key={i} type="button" className="dos-line dos-link" onClick={() => run(l.cmd)}>
        {l.text}
      </button>
    );

  return (
    <div
      className={`dos ${narrow ? 'dos-narrow' : ''}`}
      onClick={() => (phase === 'prompt' ? inputRef.current?.focus({ preventScroll: true }) : requestSkip())}
    >
      {phase === 'post' && (
        <div className="dos-out">
          <div className="dos-line dos-bright">Modular BIOS v4.20, (C) 1990</div>
          <div className="dos-line">{ERA.machine} System BIOS</div>
          <div className="dos-line"> </div>
          <div className="dos-line">80386DX CPU at {ERA.mhz} MHz</div>
          <div className="dos-line">Memory Test : {String(mem).padStart(5)}K {mem >= 4096 ? 'OK' : ''}</div>
          <div className="dos-line"> </div>
          {mem >= 4096 && (
            <>
              <div className="dos-line">Fixed Disk 0 : 40 MB</div>
              <div className="dos-line">Diskette A  : 1.44M, 3.5 in.</div>
              <div className="dos-line">Diskette B  : 1.2M, 5.25 in.</div>
            </>
          )}
          <div className="dos-post-footer">
            <div className="dos-line">Press DEL to enter SETUP</div>
            <div className="dos-line">08/14/91-386DX-HS-01</div>
          </div>
        </div>
      )}
      {phase === 'dos' && <div className="dos-out">{boot.map((l, i) => renderLine(l, i))}</div>}
      {phase === 'prompt' && (
        <div ref={outRef} className="dos-out dos-scroll">
          {lines.map(renderLine)}
          <div className="dos-line dos-prompt">
            {cwd}&gt;{input}
            <span className="dos-cursor">_</span>
          </div>
          <input
            ref={inputRef}
            className="dos-input"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, narrow ? 30 : 70))}
            onKeyDown={onKeyDown}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="DOS-Eingabe"
          />
        </div>
      )}
    </div>
  );
};

export default Dos386;
