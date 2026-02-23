import { useState } from 'react';
import { SettingsMenu } from './SettingsMenu';
import { HowToPlayModal } from './HowToPlayModal';
import './Lobby.css';

interface LobbyProps {
  onStartGame: (playerCount: number, momentumBonus: boolean, aiDifficulty: 'easy' | 'medium' | 'hard') => void;
}

export function Lobby({ onStartGame }: LobbyProps) {
  const [playerCount, setPlayerCount] = useState(4);
  const [momentumBonus, setMomentumBonus] = useState(true);
  const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>Killing Spree</h1>
        <SettingsMenu />
      </div>
      <p className="subtitle">Competitive PvP Card Game</p>
      <button
        type="button"
        className="lobby-how-to-play"
        onClick={() => setShowHowToPlay(true)}
      >
        How to Play
      </button>

      <div className="lobby-options">
        <label>
          Players (including you):
          <select
            value={playerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={momentumBonus}
            onChange={(e) => setMomentumBonus(e.target.checked)}
          />
          Momentum Bonus (Draw 2 + Heal 2 on eliminations)
        </label>

        <label>
          AI Difficulty:
          <select
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>

      <button
        className="start-btn"
        onClick={() => onStartGame(playerCount, momentumBonus, aiDifficulty)}
      >
        Start Game
      </button>

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}

