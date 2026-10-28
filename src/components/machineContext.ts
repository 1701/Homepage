import { createContext, useContext } from 'react';

export interface ScreenMode {
  w: number;
  h: number;
  // Pixel-Seitenverhältnis (VGA 320x200 auf 4:3-Röhre = 1.2)
  aspect?: number;
}

export interface ScreenInfo {
  w: number;
  h: number;
  scale: number;
  fluid: boolean;
}

export type Power = 'off' | 'on' | 'turning-off' | 'turning-on';

export interface Leds {
  hdd: boolean;
  drive: boolean;
  turbo: boolean;
}

export interface MachineCtx {
  leds: Leds;
  setLeds: React.Dispatch<React.SetStateAction<Leds>>;
}

export const MachineContext = createContext<MachineCtx>({
  leds: { hdd: false, drive: false, turbo: true },
  setLeds: () => {},
});

export const useMachine = () => useContext(MachineContext);
