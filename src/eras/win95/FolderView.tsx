import React from 'react';
import { Icon } from './Desktop';
import type { IconName } from './icons';

const FolderView: React.FC<{ items: { label: string; icon: IconName; open: () => void }[]; status?: string }> = ({ items, status }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className="w95-sunken" style={{ flex: 1, overflow: 'auto' }}>
      <div className="w95-folder">
        {items.map((it) => (
          <button key={it.label} type="button" className="w95-deskicon" onDoubleClick={it.open} onKeyDown={(e) => e.key === 'Enter' && it.open()} onClick={(e) => e.detail === 0 || window.matchMedia('(pointer: coarse)').matches ? it.open() : undefined}>
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
    <div className="w95-statusbar">{status ?? `${items.length} Objekt(e)`}</div>
  </div>
);

export default FolderView;
