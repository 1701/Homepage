import { GAMES, LINKS, PERSON } from '../../content';

export type Verb = 'Gib' | 'Öffne' | 'Schließe' | 'Nimm' | 'Schau an' | 'Rede mit' | 'Benutze' | 'Drücke' | 'Ziehe';

// Anordnung wie in Monkey Island 2 (spaltenweise)
export const VERB_GRID: Verb[][] = [
  ['Gib', 'Öffne', 'Schließe'],
  ['Nimm', 'Schau an', 'Rede mit'],
  ['Benutze', 'Drücke', 'Ziehe'],
];

export type Effect =
  | { type: 'take'; item: string }
  | { type: 'turbo' }
  | { type: 'dialog' }
  | { type: 'link'; url: string }
  | { type: 'upgrade' }
  | { type: 'beep' };

export interface Reaction {
  say: string[];
  effect?: Effect;
}

export interface Hotspot {
  id: string;
  name: string;
  rect: [number, number, number, number];
  walkX: number;
  defaultVerb: Verb;
}

export const HOTSPOTS: Hotspot[] = [
  { id: 'fenster', name: 'Fenster', rect: [14, 10, 80, 72], walkX: 56, defaultVerb: 'Schau an' },
  { id: 'poster', name: 'Poster', rect: [100, 18, 34, 44], walkX: 117, defaultVerb: 'Schau an' },
  { id: 'lautsprecher', name: 'Lautsprecher', rect: [139, 60, 9, 16], walkX: 146, defaultVerb: 'Benutze' },
  { id: 'pc', name: 'PC', rect: [146, 32, 52, 49], walkX: 172, defaultVerb: 'Benutze' },
  { id: 'diskettenbox', name: 'Diskettenbox', rect: [204, 60, 15, 16], walkX: 210, defaultVerb: 'Öffne' },
  { id: 'joystick', name: 'Joystick', rect: [220, 60, 12, 16], walkX: 224, defaultVerb: 'Nimm' },
  { id: 'stuhl', name: 'Bürostuhl', rect: [205, 82, 25, 39], walkX: 236, defaultVerb: 'Benutze' },
  { id: 'regal', name: 'Spieleregal', rect: [240, 18, 64, 52], walkX: 272, defaultVerb: 'Schau an' },
  { id: 'zeitschriften', name: 'Zeitschriften', rect: [240, 70, 64, 30], walkX: 272, defaultVerb: 'Nimm' },
  { id: 'teppich', name: 'Teppich', rect: [62, 120, 136, 16], walkX: 130, defaultVerb: 'Schau an' },
];

export const ITEMS: Record<string, string> = {
  gummihuhn: 'Gummihuhn mit Umlenkrolle',
  diskette: 'Diskette',
  joystick: 'Joystick',
};

const gameList = GAMES.dos.join(', ');

export const REACTIONS: Record<string, Partial<Record<Verb, Reaction>>> = {
  markus: {
    'Schau an': { say: [`Das bin ich: ${PERSON.name}.`, `${PERSON.tagline}.`] },
    'Rede mit': { say: ['Ich rede nicht mit mir selbst.', 'Jedenfalls nicht laut.'] },
    Nimm: { say: ['Ich bin schon ziemlich vollständig.'] },
  },
  fenster: {
    'Schau an': { say: ['Draußen ist es stockdunkel.', 'Perfektes Wetter zum Zocken.'] },
    Öffne: { say: ['Brrr. Viel zu kalt.'] },
    Schließe: { say: ['Ist schon zu.'] },
    Ziehe: { say: ['Die Vorhänge bleiben, wo sie sind.'] },
  },
  poster: {
    'Schau an': { say: [`${PERSON.quoteBy}:`, PERSON.quote] },
    Nimm: { say: ['Das Poster bleibt hängen.'] },
    Ziehe: { say: ['Dann reißt es. Lieber nicht.'] },
    'Rede mit': { say: ['Make it so!'] },
  },
  lautsprecher: {
    'Schau an': { say: ['Aktivboxen am Sound Blaster.', 'Bombastischer Klang!'] },
    Benutze: { say: ['Test, Test ...', 'Klingt super.'], effect: { type: 'beep' } },
    Drücke: { say: ['Test, Test ...', 'Klingt super.'], effect: { type: 'beep' } },
  },
  pc: {
    'Schau an': { say: ['Mein 486 DX2 mit 66 MHz. Von Vobis.', 'Mit Turbo-Taste!'] },
    Benutze: { say: [], effect: { type: 'dialog' } },
    'Rede mit': { say: [], effect: { type: 'dialog' } },
    Drücke: { say: [], effect: { type: 'turbo' } },
    Öffne: { say: ['Den schraube ich erst beim', 'nächsten Upgrade auf.'] },
    Nimm: { say: ['Viel zu schwer.', 'Und dann das Kabelgewirr ...'] },
    Schließe: { say: ['Ist doch zu.'] },
  },
  diskettenbox: {
    'Schau an': { say: ['Lauter Sicherheitskopien.', 'Ehrlich!'] },
    Öffne: { say: ['Disketten mit Aufschriften wie', '"SPIELE 3", "WICHTIG" und', '"NICHT LÖSCHEN!!!"'] },
    Nimm: { say: ['Ich nehme mal eine Diskette mit.'], effect: { type: 'take', item: 'diskette' } },
    Schließe: { say: ['Sonst staubt alles ein.'] },
  },
  joystick: {
    'Schau an': { say: ['Mein Joystick.', 'Hat schon viele Flugstunden in', 'Strike Commander hinter sich.'] },
    Nimm: { say: ['Kommt mit!'], effect: { type: 'take', item: 'joystick' } },
    Benutze: { say: ['Erst mal nehmen.'] },
    Ziehe: { say: ['Steil nach oben! Wie im Looping.'] },
  },
  stuhl: {
    'Schau an': { say: ['Mein Bürostuhl.', 'Quietscht bei jeder Drehung.'] },
    Benutze: { say: ['Ich sitze schon den ganzen Tag.'] },
    Drücke: { say: ['Quieeeetsch.'] },
    Ziehe: { say: ['Quieeeetsch.'] },
  },
  regal: {
    'Schau an': { say: ['Meine Spielesammlung:', gameList + ' ...'] },
    Nimm: { say: ['Ich kann mich nicht entscheiden.', 'Spielen wir sie doch online!'], effect: { type: 'link', url: LINKS.dosGames } },
    Benutze: { say: ['Ab ins Internet Archive!'], effect: { type: 'link', url: LINKS.dosGames } },
    Öffne: { say: ['Die Packungen sind riesig.', 'Drin sind vor allem Luft und Disketten.'] },
  },
  zeitschriften: {
    'Schau an': { say: ['Stapelweise Spielezeitschriften.', 'Die Testberichte kenne ich auswendig.'] },
    Nimm: { say: ['Lass uns im Archiv blättern!'], effect: { type: 'link', url: LINKS.magazines } },
    Benutze: { say: ['Lass uns im Archiv blättern!'], effect: { type: 'link', url: LINKS.magazines } },
    Öffne: { say: ['Lass uns im Archiv blättern!'], effect: { type: 'link', url: LINKS.magazines } },
  },
  teppich: {
    'Schau an': { say: ['Ein Teppich.', 'Darunter liegt garantiert kein Geheimgang.'] },
    Ziehe: { say: ['Darunter ist nur Staub.'] },
    Nimm: { say: ['Der passt nicht ins Inventar.'] },
  },
  gummihuhn: {
    'Schau an': { say: ['Ein Gummihuhn mit einer Umlenkrolle', 'in der Mitte. Wer weiß, wofür das', 'mal gut ist.'] },
    Benutze: { say: ['Hier gibt es kein Seil.'] },
    Drücke: { say: ['Quiiiek!'] },
  },
  diskette: {
    'Schau an': { say: ['Eine 3,5-Zoll-Diskette.', '1,44 MB! Unvorstellbar viel Platz.'] },
  },
};

// Benutze X mit Y / Gib X an Y
export const PAIRS: Record<string, Reaction> = {
  'diskette+pc': { say: ['Ich kopiere schnell Monkey Island 2.', 'Nur noch 10 Disketten ...'] },
  'joystick+pc': { say: ['Joystick kalibriert.', 'Strike Commander kann kommen!'] },
  'gummihuhn+fenster': { say: ['Draußen ist kein Seil gespannt.', 'Leider.'] },
  'gummihuhn+pc': { say: ['Das Gummihuhn passt nicht', 'ins Diskettenlaufwerk.'] },
  'gummihuhn+markus': { say: ['Quiiiek!'] },
};

export const FALLBACK: Record<Verb, string[]> = {
  'Schau an': ['Nichts Besonderes.'],
  Nimm: ['Das kann ich nicht nehmen.'],
  Öffne: ['Das lässt sich nicht öffnen.'],
  Schließe: ['Das lässt sich nicht schließen.'],
  Drücke: ['Das bewegt sich nicht.'],
  Ziehe: ['Das bewegt sich nicht.'],
  'Rede mit': ['Darauf bekomme ich wohl keine Antwort.'],
  Benutze: ['Das funktioniert so nicht.'],
  Gib: ['Ich glaube nicht, dass das hilft.'],
};

// Gespräch mit dem PC (Sound-Blaster-Sprachausgabe à la Dr. Sbaitso)
export interface DialogOption {
  id: string;
  text: string;
}

export const DIALOG_START = 'HALLO MARKUS. ICH BIN DR. BLASTER. WIE KANN ICH DIR HELFEN?';

export const DIALOG_OPTIONS: DialogOption[] = [
  { id: 'who', text: 'Erzähl dem Besucher, wer ich bin.' },
  { id: 'contact', text: 'Wie kann man mich erreichen?' },
  { id: 'secret', text: 'Was ist das Geheimnis von Marxzell?' },
  { id: 'upgrade', text: 'Zeit für ein Upgrade!' },
  { id: 'bye', text: 'Tschüss.' },
];
