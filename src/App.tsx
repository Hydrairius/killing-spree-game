import { useState, useCallback } from 'react';
import { GameController } from './game/gameController';
import { generateGameSeed } from './game/rng';
import type { GameState } from './game/types';
import { Lobby } from './ui/Lobby';
import { GameBoard } from './ui/GameBoard';
import './App.css';

const controller = new GameController();

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleStartGame = useCallback((playerCount: number, momentumBonus: boolean, aiDifficulty: 'easy' | 'medium' | 'hard') => {
    const seed = generateGameSeed();
    const state = controller.start(playerCount, momentumBonus, seed, aiDifficulty);
    setGameState(state);
  }, []);

  const handleAction = useCallback((action: Parameters<GameController['processAction']>[0]) => {
    const newState = controller.processAction(action);
    if (newState) {
      setGameState(newState);
    }
  }, []);

  const handleBackToLobby = useCallback(() => {
    setGameState(null);
  }, []);

  if (gameState) {
    return (
      <GameBoard
        state={gameState}
        onAction={handleAction}
        onBackToLobby={handleBackToLobby}
        controller={controller}
      />
    );
  }

  return <Lobby onStartGame={handleStartGame} />;
}

export default App;
