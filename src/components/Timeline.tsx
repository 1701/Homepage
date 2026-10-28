import React from 'react';
import { ERAS, type EraId } from '../content';

interface TimelineProps {
  current: EraId | null;
  sound: boolean;
  onSelect: (id: EraId) => void;
  onSkip: () => void;
  onToggleSound: () => void;
  onImprint: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ current, sound, onSelect, onSkip, onToggleSound, onImprint }) => (
  <nav className="timeline" aria-label="Zeitreise">
    <ol className="timeline-eras">
      {ERAS.map((era) => (
        <li key={era.id}>
          <button
            type="button"
            className={`timeline-era ${current === era.id ? 'active' : ''}`}
            aria-current={current === era.id ? 'step' : undefined}
            onClick={() => onSelect(era.id)}
          >
            <span className="timeline-year">{era.year}</span>
            <span className="timeline-label">{era.label}</span>
          </button>
        </li>
      ))}
    </ol>
    <div className="timeline-tools">
      <button type="button" className="timeline-tool" onClick={onSkip} title="Laufende Sequenz überspringen (ESC)">
        ESC <span className="timeline-tool-long">Überspringen</span>
      </button>
      <button type="button" className="timeline-tool" onClick={onToggleSound} aria-pressed={sound} title="Ton an/aus">
        {sound ? '♪ Ton an' : '♪ Ton aus'}
      </button>
      <button type="button" className="timeline-tool" onClick={onImprint}>
        Impressum
      </button>
    </div>
  </nav>
);

export default Timeline;
