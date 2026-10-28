// Synthetisierte Retro-Sounds (WebAudio) – keine Samples, keine Lizenzfragen.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;
let noiseBuffer: AudioBuffer | null = null;
const listeners = new Set<(on: boolean) => void>();

const getCtx = () => {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  return ctx;
};

export const isSoundEnabled = () => enabled;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
  try {
    localStorage.setItem('sound', on ? '1' : '0');
  } catch {
    /* privater Modus */
  }
  if (on) void getCtx().resume();
  else if (ctx) void ctx.suspend();
  listeners.forEach((l) => l(on));
};

export const onSoundChange = (l: (on: boolean) => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const storedSoundPreference = () => {
  try {
    return localStorage.getItem('sound') === '1';
  } catch {
    return false;
  }
};

const out = () => master as GainNode;

const noise = () => {
  const c = getCtx();
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  return src;
};

const tone = (freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.2) => {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, start);
  g.gain.setValueAtTime(vol, start + dur - 0.01);
  g.gain.linearRampToValueAtTime(0, start + dur);
  o.connect(g).connect(out());
  o.start(start);
  o.stop(start + dur);
};

const click = (start: number, vol = 0.3, freq = 1800, len = 0.015) => {
  const c = getCtx();
  const n = noise();
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + len);
  n.connect(f).connect(g).connect(out());
  n.start(start);
  n.stop(start + len + 0.01);
};

export const sfx = {
  beep(freq = 1000, dur = 0.15) {
    if (!enabled) return;
    tone(freq, getCtx().currentTime, dur, 'square', 0.12);
  },
  key() {
    if (!enabled) return;
    click(getCtx().currentTime, 0.15, 2500 + Math.random() * 1500, 0.02);
  },
  // CRT einschalten: dumpfes Klacken + Entmagnetisierungs-Brummen
  powerOn() {
    if (!enabled) return;
    const c = getCtx();
    const t = c.currentTime;
    click(t, 0.5, 300, 0.08);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 50;
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    o.connect(g).connect(out());
    o.start(t);
    o.stop(t + 1.3);
  },
  powerOff() {
    if (!enabled) return;
    click(getCtx().currentTime, 0.4, 400, 0.06);
  },
  // 1541: Kopf rattert, dann gleichmäßiges Mahlen
  floppy(seconds: number) {
    if (!enabled) return;
    const c = getCtx();
    const t = c.currentTime;
    for (let i = 0; i < 6; i++) click(t + i * 0.07, 0.35, 220, 0.05);
    const n = noise();
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 160;
    f.Q.value = 3;
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 5;
    lfoGain.gain.value = 0.08;
    const g = c.createGain();
    g.gain.value = 0.1;
    lfo.connect(lfoGain).connect(g.gain);
    n.connect(f).connect(g).connect(out());
    n.start(t + 0.45);
    lfo.start(t + 0.45);
    n.stop(t + seconds);
    lfo.stop(t + seconds);
    for (let s = 0.6; s < seconds; s += 0.4 + Math.random() * 0.5) click(t + s, 0.2, 260, 0.04);
  },
  hdd(seconds: number) {
    if (!enabled) return;
    const t = getCtx().currentTime;
    for (let s = 0; s < seconds; s += 0.04 + Math.random() * 0.18) click(t + s, 0.12 + Math.random() * 0.1, 1200 + Math.random() * 2000, 0.012);
  },
  blip() {
    if (!enabled) return;
    const t = getCtx().currentTime;
    tone(880, t, 0.08, 'square', 0.1);
    tone(660, t + 0.09, 0.12, 'square', 0.1);
  },
  // Wählen, Ansagen, Pfeifen, Rauschen – ca. 9 Sekunden
  modem(): () => void {
    if (!enabled) return () => {};
    const c = getCtx();
    const t = c.currentTime;
    const nodes: AudioScheduledSourceNode[] = [];
    const osc = (freq: number, start: number, dur: number, vol = 0.12, type: OscillatorType = 'sine') => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g).connect(out());
      o.start(t + start);
      o.stop(t + start + dur);
      nodes.push(o);
      return o;
    };
    // Freizeichen
    osc(425, 0, 0.9);
    // MFV-Wahl
    const dtmf: Record<string, [number, number]> = {
      '0': [941, 1336], '1': [697, 1209], '9': [852, 1477],
    };
    '0191011'.split('').forEach((d, i) => {
      const [a, b] = dtmf[d];
      osc(a, 1 + i * 0.11, 0.07, 0.1);
      osc(b, 1 + i * 0.11, 0.07, 0.1);
    });
    // Antwortton
    osc(2100, 2.2, 1.4, 0.08);
    // Aushandeln
    osc(980, 3.7, 0.5, 0.08, 'square');
    osc(1650, 3.7, 0.5, 0.05, 'square');
    const sweep = osc(600, 4.3, 0.9, 0.08, 'sawtooth');
    sweep.frequency.setValueAtTime(600, t + 4.3);
    sweep.frequency.linearRampToValueAtTime(2400, t + 5.2);
    osc(1200, 5.2, 0.3, 0.06, 'square');
    osc(2400, 5.5, 0.3, 0.06, 'square');
    // Datenrauschen
    const n = noise();
    const g = c.createGain();
    g.gain.setValueAtTime(0.09, t + 5.8);
    g.gain.linearRampToValueAtTime(0.11, t + 8.4);
    g.gain.linearRampToValueAtTime(0, t + 8.8);
    n.connect(g).connect(out());
    n.start(t + 5.8);
    n.stop(t + 8.8);
    nodes.push(n);
    return () => nodes.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* schon beendet */
      }
    });
  },
};

// ---------------------------------------------------------------------------
// Chiptune-Player: drei Stimmen (Puls, Puls/Dreieck, Rauschen), 16tel-Raster

const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

const freqOf = (n: string) => {
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return 0;
  const semis = NOTE[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
};

export interface Song {
  title: string;
  bpm: number;
  lead: string;
  bass: string;
  drums: string;
  leadWave: 'pulse25' | 'pulse50' | 'saw';
  bassWave: 'triangle' | 'pulse50';
}

const pulseWaves = new Map<string, PeriodicWave>();
const pulse = (duty: number) => {
  const key = String(duty);
  const c = getCtx();
  let w = pulseWaves.get(key);
  if (!w) {
    const n = 48;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      real[k] = Math.sin(2 * Math.PI * k * duty) / (k * Math.PI);
      imag[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (k * Math.PI);
    }
    w = c.createPeriodicWave(real, imag);
    pulseWaves.set(key, w);
  }
  return w;
};

const parse = (s: string) => s.trim().split(/\s+/);

export class ChipPlayer {
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private song: Song;
  private bus: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  startedAt = 0;

  constructor(song: Song) {
    this.song = song;
  }

  get playing() {
    return this.timer !== null;
  }

  get elapsed() {
    return ctx && this.playing ? ctx.currentTime - this.startedAt : 0;
  }

  play() {
    if (this.playing || !enabled) return;
    const c = getCtx();
    this.bus = c.createGain();
    this.bus.gain.value = 0.8;
    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 256;
    this.bus.connect(this.analyser);
    this.analyser.connect(out());
    this.step = 0;
    this.nextTime = c.currentTime + 0.05;
    this.startedAt = this.nextTime;
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (this.bus && ctx) {
      this.bus.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
      const b = this.bus;
      window.setTimeout(() => b.disconnect(), 300);
    }
    this.bus = null;
  }

  private schedule() {
    const c = getCtx();
    const dur = 60 / this.song.bpm / 4;
    const lead = parse(this.song.lead);
    const bass = parse(this.song.bass);
    const drums = parse(this.song.drums);
    while (this.nextTime < c.currentTime + 0.12) {
      const i = this.step;
      this.voice(lead[i % lead.length], this.song.leadWave, this.nextTime, dur, 0.13, lead, i);
      this.voice(bass[i % bass.length], this.song.bassWave, this.nextTime, dur, 0.18, bass, i);
      this.drum(drums[i % drums.length], this.nextTime);
      this.nextTime += dur;
      this.step++;
    }
  }

  // Noten halten bis zum nächsten Ereignis ("-" verlängert)
  private voice(n: string, wave: string, t: number, dur: number, vol: number, seq: string[], i: number) {
    if (!n || n === '.' || n === '-' || !this.bus) return;
    let len = 1;
    while (seq[(i + len) % seq.length] === '-' && len < 16) len++;
    const c = getCtx();
    const o = c.createOscillator();
    if (wave === 'pulse25') o.setPeriodicWave(pulse(0.25));
    else if (wave === 'pulse50') o.setPeriodicWave(pulse(0.5));
    else o.type = wave === 'saw' ? 'sawtooth' : 'triangle';
    o.frequency.value = freqOf(n);
    const g = c.createGain();
    const end = t + dur * len;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.linearRampToValueAtTime(vol * 0.6, t + 0.08);
    g.gain.setValueAtTime(vol * 0.6, end - 0.02);
    g.gain.linearRampToValueAtTime(0, end);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(end + 0.01);
  }

  private drum(d: string, t: number) {
    if (!d || d === '.' || !this.bus) return;
    const c = getCtx();
    if (d === 'k') {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g).connect(this.bus);
      o.start(t);
      o.stop(t + 0.16);
      return;
    }
    const n = noise();
    const f = c.createBiquadFilter();
    f.type = d === 'h' ? 'highpass' : 'bandpass';
    f.frequency.value = d === 'h' ? 7000 : 1800;
    const g = c.createGain();
    const len = d === 'h' ? 0.03 : 0.12;
    g.gain.setValueAtTime(d === 'h' ? 0.12 : 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(f).connect(g).connect(this.bus);
    n.start(t);
    n.stop(t + len + 0.01);
  }
}

// Eigene Kompositionen
export const SONGS: Record<'cracktro' | 'adventure' | 'winamp', Song> = {
  cracktro: {
    title: 'Markus - Zeitreise 1986 (SID Mix)',
    bpm: 128,
    leadWave: 'pulse25',
    bassWave: 'pulse50',
    lead: `
      A4 - C5 E5 A5 - G5 E5  F5 - E5 D5 E5 - - -   A4 - C5 E5 A5 - B5 C6  B5 - G5 E5 G5 - - -
      F5 - A5 C6 F5 - E5 C5  D5 - F5 A5 G5 - E5 -  E5 - G#5 B5 E6 - D6 B5  C6 - B5 A5 A5 - - -`,
    bass: `
      A2 . A3 . A2 . A3 .  F2 . F3 . F2 . F3 .  A2 . A3 . A2 . A3 .  G2 . G3 . G2 . G3 .
      F2 . F3 . F2 . F3 .  D2 . D3 . D2 . D3 .  E2 . E3 . E2 . E3 .  A2 . A3 . E2 . E3 .`,
    drums: `
      k . h . s . h .  k . h k s . h .  k . h . s . h .  k . h k s . h h
      k . h . s . h .  k . h k s . h .  k . h . s . h .  k . s s s . s s`,
  },
  adventure: {
    title: 'The Secret of Marxzell - Titelmusik',
    bpm: 100,
    leadWave: 'pulse50',
    bassWave: 'triangle',
    lead: `
      E5 - - - G5 - A5 -  B5 - - - A5 - G5 -  E5 - - - D5 - E5 -  G5 - - - - - - -
      E5 - - - G5 - A5 -  B5 - - - D6 - B5 -  A5 - G5 - E5 - D5 -  E5 - - - - - - -`,
    bass: `
      E2 . . B2 E3 . B2 .  C2 . . G2 C3 . G2 .  A2 . . E3 A3 . E3 .  B1 . . F#2 B2 . F#2 .
      E2 . . B2 E3 . B2 .  C2 . . G2 C3 . G2 .  A2 . . E3 B2 . F#2 .  E2 . . B2 E2 . . .`,
    drums: `
      . . s . . . s .  . . s . . . s .  . . s . . . s .  . . s . . . s h
      . . s . . . s .  . . s . . . s .  . . s . . . s .  . . s . k . s .`,
  },
  winamp: {
    title: 'Markus - Dial-Up Dreams (MOD)',
    bpm: 140,
    leadWave: 'saw',
    bassWave: 'pulse50',
    lead: `
      D5 - F5 - A5 - D6 -  C6 - A5 - F5 - G5 -  A5 - - - - - G5 F5  E5 - - - - - - -
      D5 - F5 - A5 - D6 -  E6 - D6 - C6 - A5 -  A#5 - A5 - G5 - E5 -  F5 - - - E5 - - -`,
    bass: `
      D2 D3 . D2 D3 . D2 D3  A#1 A#2 . A#1 A#2 . A#1 A#2  F2 F3 . F2 F3 . F2 F3  C2 C3 . C2 C3 . C2 C3
      D2 D3 . D2 D3 . D2 D3  A#1 A#2 . A#1 A#2 . A#1 A#2  G2 G3 . G2 G3 . G2 G3  A2 A3 . A2 A3 . A2 A3`,
    drums: `
      k . h . s . h k  k . h . s . h .  k . h . s . h k  k . h . s h s h
      k . h . s . h k  k . h . s . h .  k . h . s . h k  k k h . s s s s`,
  },
};
