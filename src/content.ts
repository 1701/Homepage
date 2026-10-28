// Alle persönlichen Inhalte der Zeitreise an einem Ort.
// Texte hier ändern – die Epochen lesen nur aus dieser Datei.

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/markus-steireif-37a18487/',
  github: 'https://github.com/1701/',
  c64Games: 'https://archive.org/details/softwarelibrary_c64_games',
  dosGames: 'https://archive.org/details/softwarelibrary_msdos_games',
  magazines: 'https://www.kultmags.com/mags.php',
};

export const PERSON = {
  name: 'Markus Steireif',
  tagline: 'Product Guy & Retro-Enthusiast',
  icq: '22561217',
  quote: '"Things are only impossible until they\'re not."',
  quoteBy: 'Captain Jean-Luc Picard',
};

export type EraId = 'c64' | 'i386' | 'i486' | 'pentium' | 'mmx' | 'p2';

export interface Era {
  id: EraId;
  year: number;
  label: string;
  machine: string;
  mhz?: string;
  monitor: 'c64' | 'vga';
}

export const ERAS: Era[] = [
  { id: 'c64', year: 1986, label: 'C64', machine: 'Commodore 64', monitor: 'c64' },
  { id: 'i386', year: 1991, label: '386er', machine: 'Highscreen 386DX', mhz: '33', monitor: 'vga' },
  { id: 'i486', year: 1993, label: '486er', machine: 'Highscreen 486 DX2', mhz: '66', monitor: 'vga' },
  { id: 'pentium', year: 1995, label: 'Pentium', machine: 'Highscreen Pentium', mhz: '100', monitor: 'vga' },
  { id: 'mmx', year: 1997, label: 'MMX', machine: 'Pentium MMX', mhz: '233', monitor: 'vga' },
  { id: 'p2', year: 1999, label: 'Pentium II', machine: 'Pentium II', mhz: '350', monitor: 'vga' },
];

export const GAMES = {
  c64: [
    'The Great Giana Sisters',
    'Lode Runner',
    'Pitstop',
    'Fort Apocalypse',
    'Frogger',
    'Donkey Kong',
    'Spy Hunter',
  ],
  dos: [
    'Wing Commander',
    'Lemmings',
    'The Secret of Monkey Island',
    'Monkey Island 2',
    'Indiana Jones 3',
    'Indiana Jones 4',
    'Day of the Tentacle',
    'Strike Commander',
  ],
  win: [
    'Warcraft',
    'SimCity',
    'Die Siedler',
    'NASCAR Racing',
  ],
};

// Laufschrift im C64-Cracktro (Großbuchstaben, ohne Umlaute – wie damals)
export const C64_SCROLLER =
  'HALLO UND WILLKOMMEN ZU MEINER ZEITREISE! ... ICH BIN MARKUS STEIREIF, ' +
  'PRODUCT GUY UND RETRO-ENTHUSIAST. ... ANGEFANGEN HAT ALLES MIT DIESEM BROTKASTEN HIER: ' +
  'DEM COMMODORE 64. ... STUNDEN VOR GIANA SISTERS, LODE RUNNER, PITSTOP, FORT APOCALYPSE, ' +
  'FROGGER, DONKEY KONG UND SPY HUNTER ... UND IMMER WIEDER: LOAD"*",8,1 ... ' +
  'DANACH KAMEN DIE PCS - MEISTENS HIGHSCREEN VON VOBIS: 386ER, 486ER, PENTIUM, MMX, PENTIUM II. ' +
  '... DRUECKE SPACE FUER DAS UPGRADE AUF DEN 386ER! ... GREETINGS TO ALL RETRO FREAKS OUT THERE ...      ';

export const README_386 = [
  'README.TXT',
  '==========',
  '',
  'Der C64 hatte ausgedient. Jetzt steht hier ein',
  'Highscreen 386er von Vobis - mit Turbo-Taste!',
  '',
  'Ab jetzt heisst es: CONFIG.SYS und AUTOEXEC.BAT',
  'optimieren, bis genug konventioneller Speicher',
  'fuer Wing Commander frei ist.',
  '',
  'Tipp: DIR SPIELE zeigt meine Lieblingsspiele.',
  '      UPGRADE bringt dich zum 486er.',
];

export const ABOUT_TXT = [
  'Über mich',
  '=========',
  '',
  'Name:      Markus Steireif',
  'Beruf:     Product Guy',
  'Hobby:     Retro-Computer und -Spiele',
  '',
  'Meine Rechner:',
  '  - Commodore 64',
  '  - 386er, 486er, Pentium, Pentium MMX, Pentium II',
  '    (meistens Highscreen von Vobis)',
  '',
  'Online: AOL, mit einem US-Robotics-Modem.',
  'ICQ: 22561217 · Winamp läuft immer · mIRC sowieso.',
  '',
  PERSON.quote,
  '  - ' + PERSON.quoteBy,
];
