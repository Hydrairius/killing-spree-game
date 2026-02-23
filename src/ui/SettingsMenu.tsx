import { useState, useRef, useEffect } from 'react';
import { BugReportModal } from '../bugreport/BugReportModal';
import { BugReportsViewer } from '../bugreport/BugReportsViewer';
import { HowToPlayModal } from './HowToPlayModal';
import './SettingsMenu.css';

const isDev = import.meta.env.DEV;

interface SettingsMenuProps {
  gameState?: Record<string, unknown>;
}

export function SettingsMenu({ gameState }: SettingsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [showBugViewer, setShowBugViewer] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'F8') {
        e.preventDefault();
        setShowBugReport((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('click', onClickOutside);
      return () => document.removeEventListener('click', onClickOutside);
    }
  }, [menuOpen]);

  return (
    <>
      <div className="settings-menu-wrapper" ref={menuRef}>
        <button
          type="button"
          className="settings-menu-trigger"
          onClick={() => setMenuOpen((o) => !o)}
          title="Settings (F8 = Report Bug)"
          aria-label="Open settings"
        >
          ⚙
        </button>
        {menuOpen && (
          <div className="settings-menu-dropdown">
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => {
                setMenuOpen(false);
                setShowHowToPlay(true);
              }}
            >
              How to Play
            </button>
            <button
              type="button"
              className="settings-menu-item"
              onClick={() => {
                setMenuOpen(false);
                setShowBugReport(true);
              }}
            >
              Report Bug
            </button>
            {isDev && (
              <button
                type="button"
                className="settings-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setShowBugViewer(true);
                }}
              >
                Bug Reports
              </button>
            )}
          </div>
        )}
      </div>

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showBugReport && (
        <BugReportModal
          onClose={() => setShowBugReport(false)}
          gameState={gameState}
        />
      )}

      {showBugViewer && isDev && (
        <BugReportsViewer onClose={() => setShowBugViewer(false)} />
      )}
    </>
  );
}
