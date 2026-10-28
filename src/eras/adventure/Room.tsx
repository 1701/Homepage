import React, { useMemo } from 'react';

// Zimmer 1993 – 320 x 144, nur ganzzahlige Rechtecke (bleibt bei jeder Vergrößerung scharf)

type R = [number, number, number, number, string];

const C = {
  wall: '#34406b',
  wallStripe: '#2e3962',
  wallShadow: '#252d4f',
  glow: '#4a5a96',
  ceiling: '#1f2643',
  floor1: '#6e4a2c',
  floor2: '#644228',
  seam: '#3f2a18',
  floorHi: '#84593a',
  base: '#4a3220',
  baseHi: '#6b4a30',
  frame: '#d8c8a0',
  frameDark: '#a89870',
  night: '#0d1433',
  night2: '#141c42',
  moon: '#f4f0c8',
  star: '#c8d0ff',
  fir: '#08160f',
  fir2: '#0e2218',
  curtain: '#8b2b2b',
  curtainDark: '#6a1e1e',
  rod: '#6b5030',
  wood: '#8a6038',
  woodDark: '#5e3e22',
  woodDeep: '#4e321c',
  beige: '#d6cdb4',
  beigeDark: '#a89f86',
  beigeShade: '#bfb69c',
  ncBlue: '#0000aa',
  ncCyan: '#55ffff',
  ncGrey: '#aaaaaa',
  ncSel: '#00aaaa',
  black: '#101010',
  red: '#d02020',
  green: '#30e030',
  rug: '#7a2830',
  rugBorder: '#a84040',
  rugInner: '#5a1c24',
};

// Treppenförmiges Dreieck (Tanne) aus Zeilen
const fir = (cx: number, top: number, h: number, color: string): R[] => {
  const rows: R[] = [];
  for (let i = 0; i < h; i++) {
    const half = Math.floor((i + 1) * 0.45 + ((i % 4 === 3) ? -1 : 0));
    rows.push([cx - half, top + i, half * 2 + 1, 1, color]);
  }
  return rows;
};

const buildRoom = (turbo: boolean, hasJoystick: boolean): R[] => {
  const r: R[] = [];
  const add = (...x: R[]) => r.push(...x);

  // Wand mit Streifentapete
  add([0, 0, 320, 100, C.wall]);
  for (let x = 4; x < 320; x += 10) add([x, 6, 2, 94, C.wallStripe]);
  add([0, 0, 320, 6, C.ceiling]);
  add([0, 6, 320, 1, C.wallShadow]);
  // Schattige Ecken (Dither-Spalten)
  for (let y = 7; y < 100; y += 2) {
    add([0, y, 1, 1, C.wallShadow], [2, y + 1, 1, 1, C.wallShadow], [319, y, 1, 1, C.wallShadow], [317, y + 1, 1, 1, C.wallShadow]);
  }

  // Monitor-Schein an der Wand (Dither)
  for (let y = 26; y < 70; y++) {
    for (let x = 144; x < 204; x++) {
      const d = Math.abs(x - 174) / 30 + Math.abs(y - 48) / 22;
      if (d < 1 && (x + y) % 2 === 0) add([x, y, 1, 1, C.glow]);
    }
  }

  // Boden
  add([0, 104, 320, 40, C.floor1]);
  for (let y = 104, i = 0; y < 144; y += 6, i++) {
    add([0, y, 320, 3, i % 2 ? C.floor2 : C.floor1], [0, y, 320, 1, C.seam]);
    for (let x = (i * 37) % 60; x < 320; x += 60) add([x, y + 1, 1, 5, C.seam]);
    add([0, y + 1, 320, 1, C.floorHi]);
  }
  // Fußleiste
  add([0, 98, 320, 6, C.base], [0, 98, 320, 1, C.baseHi]);

  // Teppich
  add([62, 120, 136, 16, C.rugBorder], [64, 121, 132, 14, C.rug], [70, 124, 120, 8, C.rugInner]);
  for (let x = 72; x < 188; x += 8) add([x, 127, 4, 2, C.rugBorder]);

  // Fenster
  add([8, 9, 88, 3, C.rod]);
  add([20, 14, 64, 62, C.frame]);
  add([23, 17, 58, 56, C.night]);
  add([23, 47, 58, 26, C.night2]);
  for (let y = 41; y < 47; y++) for (let x = 23 + (y % 2); x < 81; x += 2) add([x, y, 1, 1, C.night2]);
  for (let dy = -4; dy <= 4; dy++) {
    const half = Math.floor(Math.sqrt(16 - dy * dy));
    add([34 - half, 25 + dy, half * 2 + 1, 1, C.moon]);
  }
  for (let dy = -3; dy <= 3; dy++) {
    const half = Math.floor(Math.sqrt(9 - dy * dy));
    add([36 - half, 24 + dy, half * 2 + 1, 1, C.night]);
  }
  [[44, 20], [60, 24], [70, 19], [52, 30], [76, 33], [27, 36], [66, 38], [41, 27]].forEach(([x, y]) => add([x, y, 1, 1, C.star]));
  [[28, 50, 22], [40, 46, 26], [54, 52, 20], [66, 44, 28], [77, 50, 22]].forEach(([cx, top, h], i) => add(...fir(cx, top, h, i % 2 ? C.fir2 : C.fir)));
  add([23, 70, 58, 3, C.fir]);
  add([51, 17, 2, 56, C.frame], [23, 44, 58, 2, C.frame]);
  add([20, 14, 64, 1, C.frameDark], [18, 76, 68, 3, C.frame], [18, 79, 68, 1, C.frameDark]);
  // Vorhänge
  for (const x0 of [12, 82]) {
    add([x0, 11, 12, 74, C.curtain]);
    for (let x = x0 + 2; x < x0 + 12; x += 4) add([x, 11, 1, 74, C.curtainDark]);
    add([x0, 84, 12, 1, C.curtainDark]);
  }

  // Poster
  add([100, 18, 34, 44, '#e8e8e8'], [101, 19, 32, 42, '#0a0a24']);
  [[104, 23], [128, 21], [110, 52], [124, 56], [130, 40], [103, 45], [117, 25]].forEach(([x, y]) => add([x, y, 1, 1, '#ffffff']));
  // Raumschiff
  add([107, 33, 16, 3, '#9aa4b4'], [109, 32, 12, 1, '#c0c8d8'], [109, 36, 12, 1, '#6a7484']);
  add([114, 37, 3, 4, '#8a94a4'], [111, 41, 12, 4, '#9aa4b4'], [111, 45, 12, 1, '#6a7484']);
  add([118, 38, 2, 3, '#8a94a4'], [118, 37, 12, 2, '#b0b8c8'], [118, 42, 12, 2, '#b0b8c8']);
  add([129, 37, 2, 2, '#ff6040'], [129, 42, 2, 2, '#ff6040']);
  add([101, 19, 2, 2, C.red], [131, 19, 2, 2, C.red]);

  // Schreibtisch
  add([136, 74, 98, 8, C.wood], [136, 74, 98, 1, '#a07848'], [136, 82, 98, 3, C.woodDark]);
  add([139, 85, 5, 32, C.woodDeep], [226, 85, 5, 32, C.woodDeep]);
  add([198, 85, 28, 18, '#6a4528'], [198, 93, 28, 1, C.woodDeep], [208, 88, 8, 2, '#c8a060'], [208, 97, 8, 2, '#c8a060']);

  // Lautsprecher
  add([139, 60, 9, 16, C.beige], [139, 60, 9, 1, '#ece4cc'], [147, 60, 1, 16, C.beigeDark]);
  for (let y = 62; y < 74; y += 2) for (let x = 141; x < 146; x += 2) add([x, y, 1, 1, C.beigeDark]);

  // PC-Gehäuse (Desktop)
  add([146, 64, 54, 12, C.beige], [146, 64, 54, 1, '#ece4cc'], [146, 75, 54, 1, C.beigeDark]);
  add([150, 67, 18, 2, C.beigeDark], [150, 71, 12, 2, C.beigeDark], [150, 67, 18, 1, '#404040'], [150, 71, 12, 1, '#404040']);
  add([180, 67, 9, 5, '#200606']);
  // Turbo-Anzeige "66" bzw. "33" als 3x5-Ziffern
  const digit = (d: string, x: number, y: number) => {
    const font: Record<string, string[]> = {
      '6': ['###', '#..', '###', '#.#', '###'],
      '3': ['###', '..#', '###', '..#', '###'],
    };
    font[d].forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && add([x + i, y + j, 1, 1, '#ff3020'])));
  };
  const mhz = turbo ? '66' : '33';
  digit(mhz[0], 181, 67);
  digit(mhz[1], 185, 67);
  add([191, 68, 2, 2, C.green], [195, 68, 2, 2, turbo ? '#ffd030' : '#504020'], [191, 71, 6, 2, C.beigeShade]);

  // Monitor
  add([166, 60, 14, 4, C.beigeDark], [162, 62, 22, 2, C.beigeShade]);
  add([152, 32, 42, 29, C.beige], [152, 32, 42, 1, '#ece4cc'], [193, 32, 1, 29, C.beigeDark], [152, 60, 42, 1, C.beigeDark]);
  add([155, 35, 36, 23, C.ncBlue]);
  // Norton Commander
  add([155, 35, 36, 1, C.ncSel]);
  for (const x0 of [156, 173]) {
    add([x0, 37, 17, 1, C.ncCyan], [x0, 37, 1, 19, C.ncCyan], [x0 + 16, 37, 1, 19, C.ncCyan], [x0, 55, 17, 1, C.ncCyan]);
    for (let y = 39; y < 54; y += 2) add([x0 + 2, y, 6 + ((y * 7 + x0) % 6), 1, C.ncGrey]);
  }
  add([157, 43, 15, 1, C.ncSel]);
  add([155, 57, 36, 1, C.black]);
  // Tastatur
  add([150, 77, 46, 4, '#d8d0b8'], [150, 80, 46, 1, '#a8a088']);
  for (let x = 152; x < 194; x += 3) add([x, 78, 2, 1, '#b8b098']);
  // Maus
  add([200, 78, 5, 3, '#d8d0b8'], [202, 76, 1, 2, '#505050']);

  // Diskettenbox
  add([206, 62, 3, 6, '#2050c0'], [209, 63, 3, 5, '#f0f0f0'], [212, 62, 3, 6, '#c02020'], [215, 63, 2, 5, '#f0d020']);
  add([204, 66, 15, 10, '#3a3a3a'], [204, 66, 15, 1, '#5a5a5a']);

  // Joystick
  if (hasJoystick) {
    add([221, 72, 10, 4, C.black], [222, 72, 8, 1, '#404040'], [224, 64, 2, 8, '#303030'], [223, 61, 4, 4, C.red], [224, 61, 1, 1, '#ff8080'], [228, 71, 2, 1, C.red]);
  }

  // Bürostuhl
  add([208, 82, 18, 20, '#303848'], [208, 82, 18, 1, '#485268'], [206, 102, 22, 5, '#303848'], [206, 102, 22, 1, '#485268']);
  add([216, 107, 3, 10, '#202020'], [206, 117, 23, 2, '#202020'], [205, 119, 3, 2, '#101010'], [227, 119, 3, 2, '#101010']);

  // Regal
  add([240, 18, 64, 82, '#3a2616']);
  add([240, 18, 3, 82, C.wood], [301, 18, 3, 82, C.wood], [240, 18, 64, 3, C.wood]);
  for (const y of [44, 70, 96]) add([240, y, 64, 3, C.wood], [243, y + 3, 58, 1, C.woodDeep]);
  // Spielepackungen (groß, wie damals)
  const boxes = ['#c02828', '#2848a8', '#e0c020', '#208848', '#6828a0', '#e07818', '#202020', '#d0d0d0', '#28a0c0'];
  let x = 244;
  boxes.forEach((c, i) => {
    const h = 18 + ((i * 5) % 6);
    const w = 5 + (i % 3);
    add([x, 44 - h, w, h, c], [x, 44 - h, w, 1, '#e8e8e8'], [x + w - 1, 44 - h, 1, h, '#181818']);
    add([x + 1, 44 - h + 3, w - 2, 1, i % 2 ? '#f0f0f0' : '#101010']);
    x += w + 1;
  });
  // Mittelfach: weitere Packungen + Sound-Blaster-Karton
  add([245, 54, 22, 16, '#f0f0f0'], [245, 58, 22, 3, '#e07818'], [247, 63, 10, 2, '#202020']);
  ['#3048b0', '#b03030', '#309050', '#c0a020'].forEach((c, i) => add([270 + i * 7, 51 + (i % 2) * 2, 6, 19 - (i % 2) * 2, c]));
  // Unteres Fach: Zeitschriften-Stapel + Disketten
  ['#e8e0c8', '#c8402a', '#3060c0', '#e8e0c8', '#30a060', '#d0b030', '#e8e0c8'].forEach((c, i) => add([245 + (i % 2), 94 - i * 3, 26, 3, c], [245 + (i % 2), 96 - i * 3, 26, 1, '#2a2a2a']));
  for (let i = 0; i < 5; i++) add([276 + i * 5, 84 - (i % 2) * 2, 4, 12 + (i % 2) * 2, '#1a1a1a'], [277 + i * 5, 86 - (i % 2) * 2, 2, 3, '#e8e8e8']);

  return r;
};

interface RoomProps {
  turbo: boolean;
  hasJoystick: boolean;
}

const Room: React.FC<RoomProps> = ({ turbo, hasJoystick }) => {
  const rects = useMemo(() => buildRoom(turbo, hasJoystick), [turbo, hasJoystick]);
  return (
    <svg className="room-svg" width={320} height={144} viewBox="0 0 320 144" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(([x, y, w, h, c], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={c} />
      ))}
    </svg>
  );
};

export default React.memo(Room);
