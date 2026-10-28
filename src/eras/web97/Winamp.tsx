import React, { useEffect, useRef, useState } from 'react';
import { ChipPlayer, SONGS, isSoundEnabled, onSoundChange, setSoundEnabled, type Song } from '../../lib/audio';

const TRACKS: Song[] = [SONGS.winamp, SONGS.cracktro, SONGS.adventure];

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const Winamp: React.FC = () => {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [sound, setSound] = useState(isSoundEnabled);
  const player = useRef<ChipPlayer | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => onSoundChange(setSound), []);

  useEffect(() => () => player.current?.stop(), []);

  useEffect(() => {
    if (!sound && player.current?.playing) {
      player.current.stop();
      setPlaying(false);
    }
  }, [sound]);

  // Spektrum + Zeit + Lauftext
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const data = new Uint8Array(64);
    const draw = () => {
      frame++;
      const c = canvas.current?.getContext('2d');
      const p = player.current;
      if (c) {
        c.fillStyle = '#000';
        c.fillRect(0, 0, 76, 16);
        const a = p?.playing ? p.analyser : null;
        if (a) a.getByteFrequencyData(data);
        for (let i = 0; i < 19; i++) {
          const v = a ? data[1 + i * 2] / 255 : 0;
          const h = Math.round(v * 16);
          for (let y = 0; y < h; y++) {
            c.fillStyle = y > 12 ? '#ff3020' : y > 8 ? '#f0d020' : '#20d020';
            c.fillRect(i * 4, 15 - y, 3, 1);
          }
        }
      }
      if (frame % 10 === 0) {
        setTime(p?.elapsed ?? 0);
        setOffset((o) => o + 1);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const play = (i = track) => {
    if (!isSoundEnabled()) setSoundEnabled(true);
    player.current?.stop();
    player.current = new ChipPlayer(TRACKS[i]);
    player.current.play();
    setTrack(i);
    setPlaying(true);
  };

  const stop = () => {
    player.current?.stop();
    setPlaying(false);
  };

  const title = `${track + 1}. ${TRACKS[track].title} *** `;
  const scroll = (title + title).slice(offset % title.length, (offset % title.length) + 31);

  return (
    <div className="winamp">
      <div className="winamp-main">
        <div className="winamp-lcd">
          <div className="winamp-state">{playing ? '▶' : '■'}</div>
          <div className="winamp-time">{playing ? fmt(time) : '00:00'}</div>
          <canvas ref={canvas} width={76} height={16} className="winamp-spectrum" />
        </div>
        <div className="winamp-info">
          <div className="winamp-title">{scroll}</div>
          <div className="winamp-meta">
            <span>128</span> kbps <span>44</span> kHz <b className={playing ? 'on' : ''}>stereo</b>
          </div>
          <div className="winamp-seek">
            <span style={{ left: `${Math.min(100, (time / 133) * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="winamp-buttons">
        <button type="button" aria-label="Zurück" onClick={() => play((track + TRACKS.length - 1) % TRACKS.length)}>
          ⏮
        </button>
        <button type="button" aria-label="Abspielen" onClick={() => play()}>
          ▶
        </button>
        <button type="button" aria-label="Pause" onClick={stop}>
          ❚❚
        </button>
        <button type="button" aria-label="Stopp" onClick={stop}>
          ■
        </button>
        <button type="button" aria-label="Weiter" onClick={() => play((track + 1) % TRACKS.length)}>
          ⏭
        </button>
        {!sound && <span className="winamp-hint">Ton ist aus – ▶ schaltet ihn ein</span>}
      </div>
      <ol className="winamp-playlist">
        {TRACKS.map((t, i) => (
          <li key={t.title}>
            <button type="button" className={i === track ? 'current' : ''} onDoubleClick={() => play(i)} onClick={() => setTrack(i)}>
              {i + 1}. {t.title}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Winamp;
