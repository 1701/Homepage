import React from 'react';
import { PERSON } from '../content';

interface IntroProps {
  onStart: (withSound: boolean, direct?: boolean) => void;
  initialSound: boolean;
}

const Intro: React.FC<IntroProps> = ({ onStart, initialSound }) => (
  <div className="intro">
    <p className="intro-name">{PERSON.name}</p>
    <h1 className="intro-title">Eine Zeitreise durch meine Rechner</h1>
    <p className="intro-years">1986 – 1999</p>
    <div className="intro-actions">
      <button type="button" className="power-button" onClick={() => onStart(true)} autoFocus={initialSound}>
        <span className="power-icon" aria-hidden="true">⏻</span> Einschalten
        <small>mit Ton</small>
      </button>
      <button type="button" className="power-button quiet" onClick={() => onStart(false)}>
        Ohne Ton
      </button>
    </div>
    <button type="button" className="intro-direct" onClick={() => onStart(false, true)}>
      Eilig? Direkt zu den Links →
    </button>
  </div>
);

export default Intro;
