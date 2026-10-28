import React, { useMemo } from 'react';

export type Palette = Record<string, string>;

interface Run {
  x: number;
  y: number;
  w: number;
  c: string;
}

// Wandelt ein Zeichenraster in waagerechte Farbläufe um ('.' = transparent)
const toRuns = (rows: string[], palette: Palette): Run[] => {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let w = 1;
      while (row[x + w] === ch) w++;
      if (ch !== '.' && ch !== ' ' && palette[ch]) runs.push({ x, y, w, c: palette[ch] });
      x += w;
    }
  });
  return runs;
};

export const PixelRuns: React.FC<{ rows: string[]; palette: Palette; x?: number; y?: number }> = ({
  rows,
  palette,
  x = 0,
  y = 0,
}) => {
  const runs = useMemo(() => toRuns(rows, palette), [rows, palette]);
  return (
    <g transform={x || y ? `translate(${x} ${y})` : undefined}>
      {runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </g>
  );
};

interface PixelArtProps {
  rows: string[];
  palette: Palette;
  scale?: number;
  className?: string;
  title?: string;
}

const PixelArt: React.FC<PixelArtProps> = ({ rows, palette, scale = 2, className, title }) => {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <PixelRuns rows={rows} palette={palette} />
    </svg>
  );
};

export default PixelArt;
