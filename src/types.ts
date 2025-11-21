export const AppState = {
    BOOTING: 'BOOTING',
    RUNNING: 'RUNNING',
    ERROR: 'ERROR'
} as const;

export type AppState = typeof AppState[keyof typeof AppState];

export interface LinkItem {
    label: string;
    url?: string;
    action?: () => void;
    type: 'external' | 'internal';
}

export interface BootLine {
    text: string;
    delay: number;
    color?: string;
}
