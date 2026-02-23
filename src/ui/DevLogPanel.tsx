import { useState } from 'react';
import './DevLogPanel.css';

export interface DevLogEntry {
  id: number;
  time: string;
  msg: string;
  tag?: 'action' | 'state' | 'ai' | 'warn' | 'error';
}

interface DevLogPanelProps {
  entries: DevLogEntry[];
  onClear: () => void;
}

export function DevLogPanel({ entries, onClear }: DevLogPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`dev-log-panel ${collapsed ? 'dev-log-collapsed' : ''}`}>
      <div className="dev-log-header" onClick={() => setCollapsed((c) => !c)}>
        <span className="dev-log-title">DevLog</span>
        <span className="dev-log-count">{entries.length}</span>
        <button
          type="button"
          className="dev-log-clear"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          Clear
        </button>
        <span className="dev-log-toggle">{collapsed ? '▼' : '▲'}</span>
      </div>
      {!collapsed && (
        <div className="dev-log-messages">
          {entries.length === 0 ? (
            <div className="dev-log-empty">No entries yet</div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className={`dev-log-entry dev-log-${e.tag ?? 'default'}`}>
                <span className="dev-log-time">{e.time}</span>
                <span className="dev-log-msg">{e.msg}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
