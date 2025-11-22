import React, { useEffect, useState } from 'react';
import type { BootLine } from '../types';

interface BootSequenceProps {
  onComplete: () => void;
}

const SEQUENCE: BootLine[] = [
  { text: "*** COMMODORE 64 BASIC V2 ***", delay: 800, color: "text-blue-400" },
  { text: "64K RAM SYSTEM  38911 BASIC BYTES FREE", delay: 600, color: "text-blue-300" },
  { text: "INIT VIC-II VIDEO... [OK]", delay: 300, color: "text-blue-300" },
  { text: "INIT CPU MOS TECHNOLOGY 6510 [OK]", delay: 300, color: "text-blue-300" },
  { text: "CHECKING SID 6581... [OK]", delay: 300, color: "text-blue-300" },
  { text: "READY.", delay: 500, color: "text-blue-300" },
  { text: "LOAD \"*\",8,1", delay: 1500, color: "text-green-400" },
  { text: "RUN", delay: 800, color: "text-green-400" },
  { text: "LOADING THREEPWOOD_VIBES... [OK]", delay: 800 },
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
