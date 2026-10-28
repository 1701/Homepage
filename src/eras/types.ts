import type { EraId } from '../content';
import type { ScreenInfo } from '../components/machineContext';

export interface EraProps {
  screen: ScreenInfo;
  next: () => void;
  goTo: (id: EraId) => void;
  // true, wenn die Epoche direkt über die Zeitleiste angesprungen wurde
  quick: boolean;
  openImprint: () => void;
}
