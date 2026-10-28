import React, { useState } from 'react';
import { ABOUT_TXT, ERAS, GAMES } from '../content';
import PcBoot from './win95/Boot';
import Desktop from './win95/Desktop';
import FolderView from './win95/FolderView';
import { gameMessage } from './win95/messages';
import type { IconName } from './win95/icons';
import { useWindowManager, type Program, type StartItem } from './win95/wm';
import type { EraProps } from './types';

const ERA = ERAS.find((e) => e.id === 'pentium')!;

const Win95: React.FC<EraProps> = ({ screen, next, goTo }) => {
  const [booted, setBooted] = useState(false);
  const wm = useWindowManager(['welcome']);

  const online = () =>
    wm.message({
      title: 'Online gehen',
      icon: 'question',
      text: ['Es wurde kein Modem gefunden.', 'Möchten Sie Ihren Rechner jetzt aufrüsten (Pentium MMX mit US-Robotics-Modem)?'],
      buttons: [{ label: 'Ja', action: next }, { label: 'Nein' }],
    });

  const backToDos = () =>
    wm.message({
      title: 'MS-DOS-Eingabeaufforderung',
      icon: 'question',
      text: ['Zurück in die DOS-Zeit von 1991?'],
      buttons: [{ label: 'Ja', action: () => goTo('i386') }, { label: 'Nein' }],
    });

  const shutdown = () =>
    wm.message({
      title: 'Windows beenden',
      icon: 'question',
      text: ['Möchten Sie den Computer jetzt herunterfahren?', '(Damit springst du ans Ende der Zeitreise.)'],
      buttons: [{ label: 'Ja', action: () => goTo('p2') }, { label: 'Nein' }],
    });

  const drives = [
    {
      label: '3½-Diskette (A:)',
      icon: 'disk' as IconName,
      open: () =>
        wm.message({ title: 'A:\\', icon: 'warn', text: ['Auf A:\\ kann nicht zugegriffen werden.', 'Das Gerät ist nicht bereit.'], buttons: [{ label: 'Wiederholen' }, { label: 'Abbrechen' }] }),
    },
    {
      label: '(C:)',
      icon: 'drive' as IconName,
      open: () => wm.message({ title: '(C:)', icon: 'info', text: ['Kapazität: 850 MB', 'Frei: 12 MB. Wie immer.'], buttons: [{ label: 'OK' }] }),
    },
    {
      label: 'CD-ROM (D:)',
      icon: 'cd' as IconName,
      open: () => wm.message({ title: 'D:\\', icon: 'warn', text: ['Bitte legen Sie eine CD in Laufwerk D: ein.'], buttons: [{ label: 'OK' }] }),
    },
  ];

  const programs: Program[] = [
    {
      id: 'welcome',
      title: 'Willkommen',
      icon: 'info',
      w: 440,
      h: 250,
      body: (
        <div className="w95-tip">
          <div className="w95-tip-text w95-sunken">
            <h2>Willkommen auf meinem Pentium!</h2>
            <p>Wussten Sie schon ...?</p>
            <p>Mit einem Doppelklick auf „Spiele“ finden Sie meine Lieblingsspiele dieser Zeit.</p>
            <p>Mit einem Doppelklick auf „Online gehen“ geht es ins Internet – dafür braucht es allerdings noch ein Modem.</p>
          </div>
          <div className="w95-tip-buttons">
            <button type="button" className="w95-button" onClick={() => wm.close('welcome')}>
              Schließen
            </button>
            <button type="button" className="w95-button" onClick={() => wm.open('about')}>
              Über mich
            </button>
            <button type="button" className="w95-button" onClick={online}>
              Online gehen
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'computer',
      title: 'Arbeitsplatz',
      icon: 'computer',
      w: 340,
      h: 220,
      menu: ['Datei', 'Bearbeiten', 'Ansicht', '?'],
      body: <FolderView items={drives} />,
    },
    {
      id: 'bin',
      title: 'Papierkorb',
      icon: 'bin',
      w: 320,
      h: 200,
      menu: ['Datei', 'Bearbeiten', 'Ansicht', '?'],
      body: (
        <FolderView
          items={['AUTOEXEC.BAK', 'CONFIG.OLD', 'MEMMAKER.STS'].map((f) => ({
            label: f,
            icon: 'notepad' as IconName,
            open: () => wm.message({ title: f, icon: 'warn', text: ['Diese Datei befindet sich im Papierkorb.', 'Lieber nicht wiederherstellen.'], buttons: [{ label: 'OK' }] }),
          }))}
        />
      ),
    },
    {
      id: 'games',
      title: 'Spiele',
      icon: 'folder',
      w: 380,
      h: 230,
      menu: ['Datei', 'Bearbeiten', 'Ansicht', '?'],
      body: <FolderView items={GAMES.win.map((g) => ({ label: g, icon: 'game' as IconName, open: () => gameMessage(wm, g) }))} />,
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
  ];

  const startMenu: StartItem[] = [
    {
      label: 'Programme',
      icon: 'folder',
      sub: [
        { label: 'Spiele', icon: 'folder', action: () => wm.open('games') },
        { label: 'Editor', icon: 'notepad', action: () => wm.open('about') },
        { label: 'MS-DOS-Eingabeaufforderung', icon: 'dos', action: backToDos },
      ],
    },
    { label: 'Dokumente', icon: 'notepad', sub: [{ label: 'Über mich.txt', icon: 'notepad', action: () => wm.open('about') }] },
    { label: 'Online gehen', icon: 'modem', action: online },
    { label: 'Hilfe', icon: 'question', action: () => wm.open('welcome') },
    { label: 'Beenden...', icon: 'computer', action: shutdown },
  ];

  if (!booted)
    return (
      <PcBoot
        bios="Modular BIOS v4.51PG, (C) 1995"
        machine={ERA.machine}
        cpu={`Pentium CPU at ${ERA.mhz} MHz`}
        memK={16384}
        extra={['Plug and Play BIOS Extension v1.0A', 'Detecting IDE Primary Master ... 850 MB', 'Detecting IDE Secondary Master ... CD-ROM']}
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
      icons={[
        { id: 'computer', label: 'Arbeitsplatz', icon: 'computer', open: () => wm.open('computer') },
        { id: 'bin', label: 'Papierkorb', icon: 'bin', open: () => wm.open('bin') },
        { id: 'games', label: 'Spiele', icon: 'folder', open: () => wm.open('games') },
        { id: 'about', label: 'Über mich.txt', icon: 'notepad', open: () => wm.open('about') },
        { id: 'dos', label: 'MS-DOS', icon: 'dos', open: backToDos },
        { id: 'online', label: 'Online gehen', icon: 'modem', open: online },
      ]}
    />
  );
};

export default Win95;
