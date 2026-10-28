import React, { useEffect, useState } from 'react';
import PixelArt, { PixelRuns } from '../../components/PixelArt';
import { ANECDOTES_97, LINKS, PERSON, TREK_97 } from '../../content';
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

const ENTERPRISE = {
  palette: { h: '#d8dae4', m: '#9aa0b4', s: '#5a6074', w: '#fff8b0', r: '#ff3018', b: '#50b0ff', o: '#ffa040' },
  rows: [
    '.................................mhhhm..............',
    '............................hhhhhhhhhhhhhhh.........',
    '.......................hhhhhhhhhhhhhhhhhhhhhhhhh....',
    '...hhhhhhhhhhhhrr...mmwmmwmmwmmwmmwmmwmmwmmwmmwmmmm.',
    '.bbbbbbbbbbbbbbrrr....ssssssssssssssssssssssssssss..',
    '..mmmmmmmmmmmmmrr..........sssssssssssssssss........',
    '.........mmmm...............mmmmmmm.................',
    '..........mmmm............mmmmmmm...................',
    '...........mmmm.........mmmmmmm.....................',
    '.......hhhhhhhhhhhhhhhhhhhhhhhhh....................',
    '.....hhhwhhhwhhhwhhhwhhhwhhhhoooo...................',
    '......mmmmmmmmmmmmmmmmmmmmmmmmooo...................',
    '.........ssssssssssssssssssss.......................',
  ],
};

const PICARD = {
  palette: { s: '#e8b088', l: '#f8d8b8', d: '#b87850', h: '#9a8a7a', k: '#5a3a2a', e: '#202030', r: '#c81818', n: '#141414', g: '#ffd040' },
  rows: [
    '.....ssssss.....',
    '...sslllssss....',
    '..sslllsssssss..',
    '..ssllssssssss..',
    '.hsssssssssssdh.',
    'hhskkksssskkkdhh',
    'hdseessssseesddh',
    '.dssssssdssssdd.',
    '..sssssssdssssd.',
    '..ssssssddsssd..',
    '..dssskkkkssdd..',
    '...dsssssssdd...',
    '....ddsssddd....',
    '......dsdd......',
    '..nnnnnssnnnnn..',
    '.nnnnnnrrnnnnnn.',
    'nnnnnrrrrrrnnnnn',
    'rrrrrrrrrrrrgrrr',
    'rrrrrrrrrrrgggrr',
    'rrrrrrrrrrrgrgrr',
  ],
};

// Sterne für den Warpflug: [x, y, Länge]
const STARS = [
  [4, 3, 5], [19, 30, 3], [31, 7, 6], [44, 33, 4], [57, 2, 3], [63, 25, 5], [76, 9, 4], [88, 29, 6],
  [11, 17, 2], [38, 27, 2], [51, 15, 2], [70, 19, 2], [83, 4, 2], [93, 13, 3], [26, 34, 2], [8, 26, 3],
];

const Viewscreen: React.FC = () => (
  <svg className="web-viewscreen" width={192} height={72} viewBox="0 0 96 36" shapeRendering="crispEdges" role="img" aria-label={TREK_97.ship}>
    <rect width={96} height={36} fill="#000" />
    <g className="web-warp">
      {[0, 96].map((dx) =>
        STARS.map(([x, y, w], i) => <rect key={`${dx}-${i}`} x={x + dx} y={y} width={w} height={1} fill={w > 3 ? '#fff' : '#8090c0'} />),
      )}
    </g>
    <PixelRuns rows={ENTERPRISE.rows} palette={ENTERPRISE.palette} x={22} y={11} />
  </svg>
);

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
          Willkommen auf meiner Seite! Hier gibt es Links, Kurioses aus dem Netz und eine Prise Star Trek.
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
                Ich bin <b>{PERSON.name}</b> – {PERSON.tagline}.
              </p>
              <h2 className="web-h2-gap">Wussten Sie schon?</h2>
              <ul className="web-list">
                {ANECDOTES_97.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </td>
            <td>
              <h2>Star Trek: TNG</h2>
              <center>
                <Viewscreen />
                <p className="web-caption">{TREK_97.ship}</p>
              </center>
              <div className="web-trek">
                <PixelArt rows={PICARD.rows} palette={PICARD.palette} scale={3} title="Captain Jean-Luc Picard" />
                <p className="web-quote">
                  {PERSON.quote}
                  <br />– {PERSON.quoteBy}
                </p>
              </div>
              <p className="web-log">
                Logbuch des Captains, Sternzeit {TREK_97.stardate}:
                <br />
                {TREK_97.quotes.join(' · ')}
              </p>
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
