import React, { useEffect, useState } from 'react';
import type { BootLine } from '../types';

interface BootSequenceProps {
  onComplete: () => void;
}

const SEQUENCE: BootLine[] = [
  { text: "MS CORE 64 SYSTEM BIOS v11.03 (c) 1980", delay: 800, color: "text-green-400" },
  { text: "CHECKING PERIPHERALS...", delay: 400 },
  { text: "  > CPU: MOS TECHNOLOGY 6510 [OK]", delay: 300 },
  { text: "  > RAM: 64K [OK]", delay: 300 },
  { text: "  > VIDEO: SYNTHWAVE GPU ACCELERATOR DETECTED", delay: 500 },
  { text: "LOADING THREEPWOOD_VIBES...", delay: 1200 },
  { text: "MOUNTING DRIVE C: ...", delay: 600 },
  { text: "EXEC: AUTOEXEC.BAT", delay: 400 },
  { text: "INITIALIZING USER INTERFACE...", delay: 1000 },
];

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<BootLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= SEQUENCE.length) {
      const timeout = setTimeout(onComplete, 1000);
      return () => clearTimeout(timeout);
    }

    const currentLine = SEQUENCE[currentIndex];
    const timeout = setTimeout(() => {
      setLines((prev) => [...prev, currentLine]);
      setCurrentIndex((prev) => prev + 1);
    }, currentLine.delay);

    return () => clearTimeout(timeout);
  }, [currentIndex, onComplete]);

  return (
    // Changed bg-black to bg-transparent to inherit transparency from parent
    <div className="p-8 font-retro-body text-xl md:text-2xl h-full flex flex-col justify-start items-start bg-transparent text-gray-300 overflow-y-auto">
      {lines.map((line, idx) => (
        <div key={idx} className={`mb-1 ${line.color || 'text-gray-300'}`}>
          {line.text}
        </div>
      ))}
      <div className="animate-pulse mt-2 text-green-500">_</div>
    </div>
  );
};

export default BootSequence;
