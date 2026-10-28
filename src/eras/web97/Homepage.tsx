import React, { useEffect, useState } from 'react';
import PixelArt from '../../components/PixelArt';
import { ERAS, LINKS, PERSON } from '../../content';
import { openLink } from '../../lib/hooks';

const CONSTRUCTION = {
  palette: { y: '#ffd800', k: '#000000', o: '#ff8000', s: '#f0c090', b: '#3050c0', g: '#808080', w: '#ffffff' },
  frames: [
    [
      'yyyykkkkyyyykkkkyyyykkkkyyyykkkkyyyy',
      'yyykkkkyyyykkkkyyyykkkkyyyykkkkyyyyk',
      '....................................',
      '..........oo........................',
      '.........oooo.......................',
      '.........ssss.......................',
      '.........ssss.........g.............',
      '........bbbbbb.......g..............',
      '.......bbbbbbbbs....g...............',
      '.......bbbbbb..ssssg................',
      '........bbbb........................',
      '........bb.bb.......................',
      '.......bb...bb...kkkkkk.............',
      '......kk.....kk.kkkkkkkk............',
      'yyyykkkkyyyykkkkyyyykkkkyyyykkkkyyyy',
      'yyykkkkyyyykkkkyyyykkkkyyyykkkkyyyyk',
    ],
    [
      'yyyykkkkyyyykkkkyyyykkkkyyyykkkkyyyy',
      'yyykkkkyyyykkkkyyyykkkkyyyykkkkyyyyk',
      '....................................',
      '..........oo........................',
      '.........oooo.......................',
      '.........ssss.......................',
      '.........ssss.......................',
      '........bbbbbb......................',
      '.......bbbbbbbbs....................',
      '.......bbbbbb..sssg.................',
      '........bbbb.....g..................',
      '........bb.bb...g...................',
      '.......bb...bb.g.kkkkkk.............',
      '......kk.....kk.kkkkkkkk............',
      'yyyykkkkyyyykkkkyyyykkkkyyyykkkkyyyy',
      'yyykkkkyyyykkkkyyyykkkkyyyykkkkyyyyk',
    ],
  ],
};

// Zähler wächst mit jedem Tag seit dem "Online-Gang"
const visitorCount = () => {
  const days = Math.floor((Date.now() - Date.UTC(1997, 2, 14)) / 86400000);
  return String(4200 + days * 3).padStart(7, '0');
};

const Badge: React.FC<{ top: string; bottom: string; bg: string; fg?: string }> = ({ top, bottom, bg, fg = '#fff' }) => (
  <span className="web-badge" style={{ background: bg, color: fg }}>
    <b>{top}</b>
    <span>{bottom}</span>
  </span>
);

interface HomepageProps {
  onPrev: () => void;
  onNext: () => void;
  onImprint: () => void;
  onGuestbook: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onPrev, onNext, onImprint, onGuestbook }) => {
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setF((x) => x + 1), 500);
    return () => window.clearInterval(id);
  }, []);

  const rainbow = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0080ff', '#ff00ff'];
  const title = "Markus' Homepage";

  return (
    <div className="web">
      <div className="web-marquee" aria-hidden="true">
        <span>
          +++ Herzlich Willkommen auf meiner Homepage im World Wide Web! +++ NEU: Jetzt auch mit ICQ! +++ Diese Seite ist immer im
          Aufbau +++ Trag dich ins Gästebuch ein! +++
        </span>
      </div>

      <center>
        <PixelArt rows={CONSTRUCTION.frames[f % 2]} palette={CONSTRUCTION.palette} scale={3} title="Under Construction" />
        <h1 className="web-h1">
          {[...title].map((ch, i) => (
            <span key={i} style={{ color: rainbow[(i + f) % rainbow.length] }}>
              {ch}
            </span>
          ))}
        </h1>
        <p className="web-sub">
          Willkommen auf meiner Seite! Hier gibt es alles über mich, meine Rechner und meine Lieblingslinks.
        </p>
        <hr className="web-hr" />
      </center>

      <table className="web-table">
        <tbody>
          <tr>
            <td>
              <h2>
                <span className="web-blink">★</span> Über mich
              </h2>
              <p>
                Ich bin <b>{PERSON.name}</b> – {PERSON.tagline}. Angefangen hat alles mit einem Commodore 64, danach kamen die PCs,
                meistens Highscreen von Vobis.
              </p>
              <p>
                Ins Internet komme ich mit <b>AOL</b> und meinem <b>US-Robotics</b>-Modem. Nebenbei läuft immer Winamp, und abends
                bin ich im mIRC.
              </p>
              <p className="web-quote">
                {PERSON.quote}
                <br />– {PERSON.quoteBy}
              </p>
            </td>
            <td>
              <h2>Meine Rechner</h2>
              <ul className="web-list">
                {ERAS.map((e) => (
                  <li key={e.id}>
                    {e.year}: {e.machine}
                    {e.mhz ? ` (${e.mhz} MHz)` : ''}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <hr className="web-hr" />

      <h2 className="web-center">
        Meine Links <span className={`web-new ${f % 2 ? 'off' : ''}`}>NEU!</span>
      </h2>
      <ul className="web-links">
        <li>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
            Mein Lebenslauf (LinkedIn)
          </a>
        </li>
        <li>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
            Meine Programme (GitHub)
          </a>
        </li>
        <li>
          <a href={LINKS.c64Games} target="_blank" rel="noopener noreferrer">
            C64-Spiele online spielen
          </a>
        </li>
        <li>
          <a href={LINKS.dosGames} target="_blank" rel="noopener noreferrer">
            DOS-Spiele online spielen
          </a>
        </li>
        <li>
          <a href={LINKS.magazines} target="_blank" rel="noopener noreferrer">
            Alte Spielezeitschriften (Kultmags)
          </a>
        </li>
      </ul>

      <p className="web-center">
        Mein ICQ: <b>{PERSON.icq}</b> · <button type="button" className="web-link" onClick={() => openLink(LINKS.linkedin)}>Schreib mir!</button>
      </p>

      <div className="web-center web-counter">
        Du bist Besucher Nr.{' '}
        <span className="web-odometer">
          {[...visitorCount()].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </span>
      </div>

      <p className="web-center">
        <button type="button" className="web-link" onClick={onGuestbook}>
          Gästebuch eintragen
        </button>{' '}
        |{' '}
        <button type="button" className="web-link" onClick={onGuestbook}>
          Gästebuch ansehen
        </button>
      </p>

      <table className="web-ring">
        <tbody>
          <tr>
            <td>
              <button type="button" className="web-link" onClick={onPrev}>
                &lt;&lt; Zurück
              </button>
            </td>
            <td>
              <b>Retro-Webring</b>
              <br />
              <small>Zeitreise durch meine Rechner</small>
            </td>
            <td>
              <button type="button" className="web-link" onClick={onNext}>
                Weiter &gt;&gt;
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="web-badges">
        <Badge top="Netscape" bottom="optimiert" bg="#000080" />
        <Badge top="800 x 600" bottom="Bildpunkte" bg="#008000" />
        <Badge top="HTML 3.2" bottom="handgemacht" bg="#800000" />
        <Badge top="Gegen" bottom="Frames!" bg="#ffff00" fg="#000" />
      </div>

      <p className="web-footer">
        Letzte Aktualisierung: 14.03.1997 · © 1997 {PERSON.name} ·{' '}
        <button type="button" className="web-link" onClick={onImprint}>
          Impressum
        </button>
      </p>
    </div>
  );
};

export default Homepage;
