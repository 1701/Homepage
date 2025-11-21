export enum AppState {
    BOOTING = 'BOOTING',
    RUNNING = 'RUNNING',
    ERROR = 'ERROR' // Just for flavor
}

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