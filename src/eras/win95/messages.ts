import { LINKS } from '../../content';
import { openLink } from '../../lib/hooks';
import type { WindowManager } from './wm';

const GAME_MESSAGES: Record<string, string[]> = {
  Warcraft: ['Bitte legen Sie die Warcraft-CD in Laufwerk D: ein.'],
  SimCity: ['Bürgermeister Markus, die Stadt braucht ein neues Kraftwerk!', 'Leider ist das Budget schon aufgebraucht.'],
  'Die Siedler': ['Die Siedler laufen nur im MS-DOS-Modus.', 'Der Bau der Burg dauert ohnehin noch drei Stunden.'],
  'NASCAR Racing': ['Gentlemen, start your engines!', 'Bitte zuerst Lenkrad und Pedale kalibrieren.'],
  Diablo: ['Bleibt eine Weile und hört zu!', 'Battle.net wird über das 33.6er-Modem verbunden ...'],
  Quake: ['GLQuake braucht eine 3dfx-Voodoo-Karte.', 'Zur Not geht es auch in Software – mit 320x200.'],
  'Alarmstufe Rot': ['Bitte legen Sie die CD „Alliierte“ oder „Sowjets“ ein.'],
  'Tomb Raider II': ['Lara Croft wartet schon.', 'Tipp: Den Butler im Kühlraum einsperren.'],
  'Die Siedler II': ['Der Esel ist unterwegs.', 'Bis die Burg steht, dauert es noch ein paar Stunden.'],
  'Age of Empires': ['Wololo!', 'Ihre Einheiten haben soeben die Farbe gewechselt.'],
  'The Curse of Monkey Island': ['Ich bin Guybrush Threepwood, ein mächtiger Pirat!', 'Bitte legen Sie CD 2 ein.'],
  'X-Wing vs. TIE Fighter': ['Bitte zuerst den Joystick kalibrieren.', 'Möge die Macht mit dir sein.'],
};

export const gameMessage = (wm: WindowManager, game: string) =>
  wm.message({
    title: game,
    icon: 'info',
    text: GAME_MESSAGES[game] ?? ['Bitte Diskette 1 einlegen.'],
    buttons: [{ label: 'OK' }, { label: 'Online spielen', action: () => openLink(LINKS.dosGames) }],
  });
