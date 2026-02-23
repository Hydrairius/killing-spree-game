import { useCallback, useState } from 'react';
import { HOW_TO_PLAY_TITLE, HOW_TO_PLAY_PAGES, type TutorialPage, type TutorialSection } from '../data/howToPlayContent';
import './HowToPlayModal.css';

interface HowToPlayModalProps {
  onClose: () => void;
}

function Section({ section }: { section: TutorialSection }) {
  const items = section.steps ?? section.bullets ?? [];
  const isSteps = !!section.steps;

  return (
    <section id={section.id} className="howto-section">
      <h3 className="howto-heading">{section.heading}</h3>
      {isSteps ? (
        <ol className="howto-list howto-steps">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="howto-list">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PageContent({ page }: { page: TutorialPage }) {
  return (
    <div className="howto-page-content">
      {page.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </div>
  );
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const [activePageId, setActivePageId] = useState<string>(HOW_TO_PLAY_PAGES[0].id);
  const activePage = HOW_TO_PLAY_PAGES.find((p) => p.id === activePageId) ?? HOW_TO_PLAY_PAGES[0];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  return (
    <div
      className="howto-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="howto-modal" onClick={(e) => e.stopPropagation()}>
        <header className="howto-header">
          <h2 id="howto-title" className="howto-title">
            {HOW_TO_PLAY_TITLE}
          </h2>
          <button
            type="button"
            className="howto-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <nav className="howto-tabs" role="tablist" aria-label="Tutorial pages">
          {HOW_TO_PLAY_PAGES.map((page) => (
            <button
              key={page.id}
              id={`howto-tab-${page.id}`}
              type="button"
              className={`howto-tab ${page.id === activePageId ? 'howto-tab-active' : ''}`}
              onClick={() => setActivePageId(page.id)}
              aria-selected={page.id === activePageId}
              aria-controls={`howto-page-${page.id}`}
              role="tab"
            >
              {page.icon && <span className="howto-tab-icon">{page.icon}</span>}
              {page.label}
            </button>
          ))}
        </nav>

        <div
          id={`howto-page-${activePageId}`}
          className="howto-content"
          role="tabpanel"
          aria-labelledby={`howto-tab-${activePageId}`}
        >
          <PageContent page={activePage} />
        </div>

        <footer className="howto-footer">
          <button type="button" className="howto-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
