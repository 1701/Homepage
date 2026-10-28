import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ABOUT_TXT, ERAS, GAMES, LINKS, PERSON } from '../content';
import { sfx } from '../lib/audio';
import { openLink } from '../lib/hooks';
import PcBoot from './win95/Boot';
import Desktop, { Icon } from './win95/Desktop';
import FolderView from './win95/FolderView';
import { gameMessage } from './win95/messages';
import type { IconName } from './win95/icons';
import { useWindowManager, type Program, type StartItem } from './win95/wm';
import Homepage from './web97/Homepage';
import Winamp from './web97/Winamp';
import type { EraProps } from './types';

const ERA = ERAS.find((e) => e.id === 'mmx')!;
const URL_97 = 'http://members.aol.com/msteireif/index.htm';

// --- DFÜ-Netzwerk ------------------------------------------------------------

const DIAL_STEPS = ['Wählen ...', 'Überprüfen von Benutzername und Kennwort ...', 'Anmelden im Netzwerk ...'];

const Dialer: React.FC<{ onConnected: () => void; onCancel: () => void }> = ({ onConnected, onCancel }) => {
  const [step, setStep] = useState(-1);
  const stopSound = useRef<() => void>(() => {});
  const done = useEffectEvent(onConnected);

  useEffect(() => () => stopSound.current(), []);

  useEffect(() => {
    if (step < 0) return;
    if (step >= DIAL_STEPS.length) {
      done();
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 4200 : 2200);
    return () => window.clearTimeout(t);
  }, [step]);

  const dial = () => {
    stopSound.current = sfx.modem();
    setStep(0);
  };

  return (
    <div className="dialer">
      <div className="dialer-top">
        <Icon name="modem" />
        <b>AOL</b>
      </div>
      <dl className="dialer-fields">
        <dt>Benutzername:</dt>
        <dd className="w95-sunken">msteireif</dd>
        <dt>Kennwort:</dt>
        <dd className="w95-sunken">********</dd>
        <dt>Rufnummer:</dt>
        <dd className="w95-sunken">0191011</dd>
        <dt>Modem:</dt>
        <dd>U.S. Robotics Sportster 33600</dd>
      </dl>
      <p className="dialer-status">{step < 0 ? 'Bereit.' : DIAL_STEPS[Math.min(step, DIAL_STEPS.length - 1)]}</p>
      <div className="w95-msgbuttons">
        <button type="button" className="w95-button" onClick={dial} disabled={step >= 0} autoFocus>
          Verbinden
        </button>
        <button type="button" className="w95-button" onClick={step >= 0 ? onConnected : onCancel}>
          {step >= 0 ? 'Überspringen' : 'Abbrechen'}
        </button>
      </div>
    </div>
  );
};

// --- Browser -----------------------------------------------------------------

const Navigator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 9 + Math.random() * 14);
      setProgress(p);
      if (p >= 100) window.clearInterval(id);
    }, 160);
    return () => window.clearInterval(id);
  }, [reloads]);

  const loading = progress < 100;
  const status = !loading
    ? 'Dokument: Übermittelt.'
    : progress < 25
      ? 'Verbindung zu members.aol.com wird hergestellt ...'
      : `Übertrage Daten ... ${Math.round(progress)}%`;

  const reload = () => {
    setProgress(0);
    setReloads((r) => r + 1);
  };

  return (
    <div className="nav">
      <div className="nav-toolbar">
        {['Zurück', 'Vor', 'Neu laden', 'Startseite', 'Suchen', 'Drucken', 'Stopp'].map((b) => (
          <button key={b} type="button" className="nav-btn" onClick={b === 'Neu laden' || b === 'Startseite' ? reload : undefined}>
            <span className={`nav-glyph nav-${b.replace(' ', '').toLowerCase()}`} aria-hidden="true" />
            {b}
          </button>
        ))}
        <div className={`nav-throbber ${loading ? 'busy' : ''}`} aria-hidden="true" />
      </div>
      <div className="nav-location">
        <span>Adresse:</span>
        <span className="w95-sunken nav-url">{URL_97}</span>
      </div>
      <div className="nav-page w95-sunken">{progress > 20 ? children : null}</div>
      <div className="nav-status">
        <span className="w95-sunken">{status}</span>
        <span className="w95-sunken nav-progress">
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  );
};

// --- ICQ & mIRC --------------------------------------------------------------

const Icq: React.FC<{ onMessage: () => void }> = ({ onMessage }) => (
  <div className="icq">
    <div className="icq-head">
      <Icon name="icq" size={16} /> <b>{PERSON.icq}</b>
    </div>
    <div className="icq-list w95-sunken">
      <div className="icq-group">Online</div>
      <button type="button" onDoubleClick={onMessage} onClick={onMessage}>
        <Icon name="icq" size={16} /> Markus
      </button>
      <div className="icq-group">Offline</div>
      <div className="icq-off">Besucher</div>
    </div>
    <div className="icq-status">
      <span className="icq-dot" /> Verfügbar
    </div>
  </div>
);

const MIRC_LOG = [
  '[21:02] *** Du bist jetzt in #retro',
  '[21:02] *** Thema: Willkommen im Retro-Channel! C64, DOS & Adventures',
  '[21:03] <@Markus> Abend zusammen!',
  '[21:03] <C64Freak> moin Markus',
  '[21:04] <Lemming> hat jemand Tipps für Monkey Island 2?',
  '[21:04] <@Markus> Affe benutzen. Mit der Pumpe. Glaub mir.',
  '[21:05] <Lemming> lol, danke!',
  '[21:06] <RetroFan> wer kommt Samstag zur LAN-Party?',
  '[21:06] <@Markus> bin dabei, bringe meinen Pentium mit',
];

const BOT_REPLIES = [
  'Hehe, cool! Schreib mir am besten über LinkedIn.',
  'Kenn ich! Hast du schon die anderen Epochen ausprobiert?',
  'Moment, Mama will telefonieren ... ;-)',
  'Stimmt genau. Früher war mehr Lametta.',
  'Probier mal DIR SPIELE auf dem 386er!',
];

const Mirc: React.FC = () => {
  const [log, setLog] = useState(MIRC_LOG);
  const [text, setText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const replies = useRef(0);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    setLog((l) => [...l, `[${time}] <Gast> ${msg}`]);
    setText('');
    window.setTimeout(() => {
      setLog((l) => [...l, `[${time}] <@Markus> ${BOT_REPLIES[replies.current++ % BOT_REPLIES.length]}`]);
      sfx.blip();
    }, 1200);
  };

  return (
    <div className="mirc">
      <div className="mirc-main">
        <div ref={logRef} className="mirc-log w95-sunken">
          {log.map((l, i) => (
            <div key={i} className={l.includes('***') ? 'mirc-sys' : l.includes('<@Markus>') ? 'mirc-me' : ''}>
              {l}
            </div>
          ))}
        </div>
        <ul className="mirc-nicks w95-sunken">
          {['@Markus', 'C64Freak', 'Gast', 'Lemming', 'RetroFan'].map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={send}>
        <input className="mirc-input w95-sunken" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht eingeben und Enter drücken" aria-label="Nachricht an #retro" />
      </form>
    </div>
  );
};

// --- Epoche ------------------------------------------------------------------

const Internet97: React.FC<EraProps> = ({ screen, next, goTo, quick, openImprint }) => {
  const [booted, setBooted] = useState(quick);
  const [online, setOnline] = useState(quick);
  const wm = useWindowManager(quick ? ['winamp', 'netscape'] : ['winamp', 'dialer']);
  const icqTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (icqTimer.current) window.clearTimeout(icqTimer.current);
  }, []);

  const icqMessage = () => {
    sfx.blip();
    wm.open('icqmsg');
  };

  const connected = () => {
    setOnline(true);
    wm.close('dialer');
    wm.open('icq');
    wm.open('netscape');
    icqTimer.current = window.setTimeout(icqMessage, 6000);
  };

  const big = { w: Math.min(760, screen.w - 70), h: Math.min(560, screen.h - 60) };

  const guestbook = () =>
    wm.message({
      title: 'Gästebuch',
      icon: 'info',
      text: ['Das Gästebuch ist leider voll.', 'Schreib mir lieber über LinkedIn!'],
      buttons: [{ label: 'LinkedIn öffnen', action: () => openLink(LINKS.linkedin) }, { label: 'OK' }],
    });

  const programs: Program[] = [
    {
      id: 'dialer',
      title: 'Verbinden mit AOL',
      icon: 'modem',
      w: 320,
      h: 260,
      x: Math.max(8, (screen.w - 320) / 2),
      y: Math.max(8, (screen.h - 300) / 2),
      body: <Dialer onConnected={connected} onCancel={() => wm.close('dialer')} />,
    },
    {
      id: 'netscape',
      title: "Markus' Homepage - Navigator",
      icon: 'globe',
      ...big,
      x: Math.max(4, screen.w - big.w - 10),
      y: 6,
      menu: ['Datei', 'Bearbeiten', 'Ansicht', 'Gehe', 'Communicator', 'Hilfe'],
      body: (
        <Navigator>
          <Homepage onPrev={() => goTo('pentium')} onNext={next} onImprint={openImprint} onGuestbook={guestbook} />
        </Navigator>
      ),
    },
    {
      id: 'winamp',
      title: 'Winamp',
      icon: 'winamp',
      skin: 'winamp',
      w: 275,
      h: 200,
      x: 90,
      y: Math.max(8, screen.h - 260),
      body: <Winamp />,
    },
    {
      id: 'icq',
      title: 'ICQ',
      icon: 'icq',
      w: 170,
      h: 250,
      x: 96,
      y: 12,
      body: <Icq onMessage={() => wm.open('icqmsg')} />,
    },
    {
      id: 'icqmsg',
      title: `Nachricht von Markus (${PERSON.icq})`,
      icon: 'icq',
      w: 320,
      h: 190,
      x: Math.max(8, (screen.w - 320) / 2),
      y: Math.max(8, (screen.h - 230) / 2),
      body: (
        <div className="icq-msg">
          <div className="w95-sunken icq-msg-text">
            Hi! Schön, dass du vorbeischaust. :-)
            <br />
            Heute erreichst du mich am besten über LinkedIn.
          </div>
          <div className="w95-msgbuttons">
            <button type="button" className="w95-button" onClick={() => openLink(LINKS.linkedin)} autoFocus>
              LinkedIn öffnen
            </button>
            <button type="button" className="w95-button" onClick={() => wm.close('icqmsg')}>
              Schließen
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'mirc',
      title: 'mIRC - [#retro]',
      icon: 'mirc',
      w: 460,
      h: 280,
      menu: ['Datei', 'Extras', 'Befehle', 'Fenster', 'Hilfe'],
      body: <Mirc />,
    },
    {
      id: 'about',
      title: 'Über mich.txt - Editor',
      icon: 'notepad',
      w: 460,
      h: 330,
      menu: ['Datei', 'Bearbeiten', 'Suchen', '?'],
      bodyClass: 'w95-sunken',
      body: <textarea className="w95-editor" defaultValue={ABOUT_TXT.join('\n')} spellCheck={false} aria-label="Über mich" />,
    },
    {
      id: 'games',
      title: 'Spiele',
      icon: 'folder',
      w: 380,
      h: 230,
      menu: ['Datei', 'Bearbeiten', 'Ansicht', '?'],
      body: <FolderView items={GAMES.win97.map((g) => ({ label: g, icon: 'game' as IconName, open: () => gameMessage(wm, g) }))} />,
    },
  ];

  const openNet = () => (online ? wm.open('netscape') : wm.open('dialer'));

  const startMenu: StartItem[] = [
    {
      label: 'Programme',
      icon: 'folder',
      sub: [
        { label: 'Netscape Navigator', icon: 'globe', action: openNet },
        { label: 'Winamp', icon: 'winamp', action: () => wm.open('winamp') },
        { label: 'ICQ', icon: 'icq', action: () => wm.open('icq') },
        { label: 'mIRC', icon: 'mirc', action: () => wm.open('mirc') },
        { label: 'Spiele', icon: 'folder', action: () => wm.open('games') },
      ],
    },
    { label: 'Dokumente', icon: 'notepad', sub: [{ label: 'Über mich.txt', icon: 'notepad', action: () => wm.open('about') }] },
    { label: 'Upgrade: Pentium II', icon: 'computer', action: next },
    {
      label: 'Beenden...',
      icon: 'computer',
      action: () =>
        wm.message({
          title: 'Windows beenden',
          icon: 'question',
          text: ['Möchten Sie den Computer jetzt herunterfahren?'],
          buttons: [{ label: 'Ja', action: () => goTo('p2') }, { label: 'Nein' }],
        }),
    },
  ];

  if (!booted)
    return (
      <PcBoot
        bios="Modular BIOS v4.51PG, (C) 1997"
        machine={ERA.machine}
        cpu={`Pentium MMX CPU at ${ERA.mhz} MHz`}
        memK={32768}
        extra={['Detecting IDE Primary Master ... 2.1 GB', 'Detecting IDE Secondary Master ... 24x CD-ROM', 'COM2: U.S. Robotics Sportster 33600 Fax']}
        splash="start"
        onDone={() => setBooted(true)}
      />
    );

  return (
    <Desktop
      wm={wm}
      screen={screen}
      programs={programs}
      brand="Markus"
      startMenu={startMenu}
      tray={online && <Icon name="connected" size={16} />}
      icons={[
        { id: 'computer', label: 'Arbeitsplatz', icon: 'computer', open: () => wm.message({ title: 'Arbeitsplatz', icon: 'info', text: ['2,1 GB Festplatte. Damit ist Platz für immer.'], buttons: [{ label: 'OK' }] }) },
        { id: 'aol', label: 'AOL', icon: 'modem', open: () => (online ? wm.message({ title: 'AOL', icon: 'info', text: ['Sie sind bereits verbunden.', 'Sie haben Post!'], buttons: [{ label: 'OK' }] }) : wm.open('dialer')) },
        { id: 'netscape', label: 'Netscape Navigator', icon: 'globe', open: openNet },
        { id: 'winamp', label: 'Winamp', icon: 'winamp', open: () => wm.open('winamp') },
        { id: 'icq', label: 'ICQ', icon: 'icq', open: () => wm.open('icq') },
        { id: 'mirc', label: 'mIRC', icon: 'mirc', open: () => wm.open('mirc') },
        { id: 'about', label: 'Über mich.txt', icon: 'notepad', open: () => wm.open('about') },
      ]}
    />
  );
};

export default Internet97;
