import type React from 'react';
import { useCallback, useState } from 'react';
import type { IconName } from './icons';

export interface Program {
  id: string;
  title: string;
  icon: IconName;
  w: number;
  h: number;
  x?: number;
  y?: number;
  menu?: string[];
  body: React.ReactNode;
  bodyClass?: string;
  // eigener Skin ohne Windows-Rahmen (z. B. Winamp)
  skin?: string;
  onClose?: () => void;
}

export interface MessageButton {
  label: string;
  action?: () => void;
}

export interface Message {
  title: string;
  text: string[];
  icon?: 'info' | 'warn' | 'question';
  buttons: MessageButton[];
}

export interface StartItem {
  label: string;
  icon: IconName;
  action?: () => void;
  sub?: StartItem[];
}

export interface DesktopIcon {
  id: string;
  label: string;
  icon: IconName;
  open: () => void;
}

export interface WinState {
  id: string;
  x: number;
  y: number;
  min: boolean;
}

export interface WindowManager {
  open: (id: string) => void;
  close: (id: string) => void;
  message: (m: Message) => void;
  wins: WinState[];
  setWins: React.Dispatch<React.SetStateAction<WinState[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useWindowManager = (initial: string[] = []): WindowManager => {
  const [wins, setWins] = useState<WinState[]>(() => initial.map((id, i) => ({ id, x: -1 - i, y: -1, min: false })));
  const [messages, setMessages] = useState<Message[]>([]);

  const open = useCallback((id: string) => {
    setWins((ws) => {
      const existing = ws.find((w) => w.id === id);
      const rest = ws.filter((w) => w.id !== id);
      return [...rest, existing ? { ...existing, min: false } : { id, x: -1 - ws.length, y: -1, min: false }];
    });
  }, []);

  const close = useCallback((id: string) => setWins((ws) => ws.filter((w) => w.id !== id)), []);
  const message = useCallback((m: Message) => setMessages((ms) => [...ms, m]), []);

  return { open, close, message, wins, setWins, messages, setMessages };
};
