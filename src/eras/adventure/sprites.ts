import type { Palette } from '../../components/PixelArt';

export const MARKUS_PALETTE: Palette = {
  h: '#2a1d14',
  s: '#e8b890',
  d: '#c08868',
  e: '#000000',
  m: '#a04838',
  t: '#3c4450',
  u: '#2c323c',
  c: '#20b8c8',
  j: '#2c4a8a',
  k: '#1e3466',
  w: '#e8e8e8',
  g: '#a0a0a0',
};

// Seitenansicht, Blick nach rechts – 14 x 38
const HEAD = [
  '....hhhhhh....',
  '...hhhhhhhh...',
  '..hhhhhhhhhh..',
  '..hhhhhhhhhh..',
  '..hhhhhhsssh..',
  '..hhhhhsssss..',
  '..hhhhsssses..',
  '...hhdsssssss.',
  '...hhdssssss..',
  '....dssssmm...',
  '.....dsssss...',
  '......ssss....',
];

const HEAD_TALK = [...HEAD.slice(0, 9), '....dssssme...', '.....dssssm...', '......ssss....'];

const TORSO = [
  '....tttttt....',
  '...tttttttt...',
  '...ttttuttt...',
  '...ccccuccc...',
  '...ccccuccc...',
  '...ttttuttt...',
  '...ttttuttt...',
  '...ttttuttt...',
  '...tttt.sst...',
  '...tttt.ss....',
  '...jjjjjj.....',
];

const LEGS_STAND = [
  '...jjjjjjj....',
  '...jjjkjjj....',
  '...jjjkjjj....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....jjkjj.....',
  '....wwwwww....',
  '....gggggg....',
];

const LEGS_WALK1 = [
  '...jjjjjjj....',
  '...jjjjjjjj...',
  '..jjjk.jjjj...',
  '..jjk...jjj...',
  '.jjk....jjj...',
  '.jjk.....jjj..',
  'jjk......jjj..',
  'jjk.......jjj.',
  'jjk.......jjj.',
  'jj........jjj.',
  'www.......wwww',
  'ggg.......gggg',
];

const LEGS_WALK2 = [
  '...jjjjjjj....',
  '...jjjjjjj....',
  '...jjkjjjj....',
  '...jjkjjj.....',
  '...jjk.jjj....',
  '..jjk..jjj....',
  '..jjk...jjj...',
  '..jjk...jjj...',
  '.jjk.....jjj..',
  '.jjk.....jjj..',
  '.www.....wwww.',
  '.ggg.....gggg.',
];

// Rumpf und Beine strecken, damit die Figur zu den Möbeln passt
const stretch = (rows: string[], idx: number[]) => rows.flatMap((r, i) => (idx.includes(i) ? [r, r] : [r]));
const BODY = stretch(TORSO, [1, 5, 6, 7]);
const legs = (rows: string[]) => stretch(rows, [1, 3, 4, 5, 6, 7, 8, 9]);

export const MARKUS_FRAMES = {
  stand: [...HEAD, ...BODY, ...legs(LEGS_STAND)],
  talk: [...HEAD_TALK, ...BODY, ...legs(LEGS_STAND)],
  walk1: [...HEAD, ...BODY, ...legs(LEGS_WALK1)],
  walk2: [...HEAD, ...BODY, ...legs(LEGS_WALK2)],
};

export const MARKUS_W = 14;
export const MARKUS_H = MARKUS_FRAMES.stand.length;

// Inventar-Icons 20 x 14
export const ITEM_PALETTE: Palette = {
  y: '#f0d020',
  o: '#e08010',
  r: '#c02020',
  k: '#101010',
  g: '#606060',
  l: '#b0b0b0',
  w: '#f0f0f0',
  b: '#2050c0',
  n: '#1838a0',
};

export const ITEM_ICONS: Record<string, string[]> = {
  gummihuhn: [
    '..........yy........',
    '.........yyyy.......',
    '.........yykyr......',
    '.........yyyyoo.....',
    '..........yyy.......',
    '...y.....yyyy.......',
    '...yy...yyyyyy......',
    '....yyyyyyllyyy.....',
    '....yyyyylgglyy.....',
    '.....yyyylgglyy.....',
    '......yyyyllyy......',
    '........yyyy........',
    '........o..o........',
    '.......oo..oo.......',
  ],
  diskette: [
    '....................',
    '...nnnnnnnnnnnnn....',
    '...nnnllllllnnnnn...',
    '...nnnllkkllnnnnn...',
    '...nnnllkkllnnnnn...',
    '...nnnllllllnnnnn...',
    '...nnnnnnnnnnnnnn...',
    '...nnwwwwwwwwwwnn...',
    '...nnwwbbbbbbwwnn...',
    '...nnwwwwwwwwwwnn...',
    '...nnwwbbbbwwwwnn...',
    '...nnwwwwwwwwwwnn...',
    '...nnnnnnnnnnnnnn...',
    '....................',
  ],
  joystick: [
    '.........rr.........',
    '........rrrr........',
    '........rrrr........',
    '.........rr.........',
    '.........kk.........',
    '.........kk.........',
    '.........kk.........',
    '.........kk.........',
    '.........kk.........',
    '....kkkkkkkkkkkk....',
    '...kkgggggggggrkk...',
    '...kkggggggggggkk...',
    '...kkkkkkkkkkkkkk...',
    '....................',
  ],
};
