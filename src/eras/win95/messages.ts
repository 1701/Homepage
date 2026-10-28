import { LINKS } from '../../content';
import { openLink } from '../../lib/hooks';
import type { WindowManager } from './wm';

const GAME_MESSAGES: Record<string, string[]> = {
  Warcraft: ['Bitte legen Sie die Warcraft-CD in Laufwerk D: ein.'],
  SimCity: ['Bürgermeister Markus, die Stadt braucht ein neues Kraftwerk!', 'Leider ist das Budget schon aufgebraucht.'],
  'Die Siedler': ['Die Siedler laufen nur im MS-DOS-Modus.', 'Der Bau der Burg dauert ohnehin noch drei Stunden.'],
  'NASCAR Racing': ['Gentlemen, start your engines!', 'Bitte zuerst Lenkrad und Pedale kalibrieren.'],
};

export const gameMessage = (wm: WindowManager, game: string) =>
  wm.message({
    title: game,
    icon: 'info',
    text: GAME_MESSAGES[game] ?? ['Bitte Diskette 1 einlegen.'],
    buttons: [{ label: 'OK' }, { label: 'Online spielen', action: () => openLink(LINKS.dosGames) }],
  });
