'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Direction,
  GameState,
  PacMan,
  Ghost,
  GameBoard,
  CellType
} from '@/lib/gameTypes';
import {
  GAME_CONFIG,
  INITIAL_MAZE,
  createInitialGameState,
  createInitialPacMan,
  createInitialGhosts,
  movePacMan,
  checkCollisions,
  consumeDot,
  makeGhostsVulnerable,
  updateGhostVulnerability,
  calculateScore,
  isGameWon
} from '@/lib/gameLogic';

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [pacMan, setPacMan] = useState<PacMan>(createInitialPacMan());
  const [ghosts, setGhosts] = useState<Ghost[]>(createInitialGhosts());
  const [board, setBoard] = useState<GameBoard>(INITIAL_MAZE.map(row => [...row]));

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    let newDirection: Direction | null = null;
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDirection = Direction.UP;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDirection = Direction.DOWN;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDirection = Direction.LEFT;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDirection = Direction.RIGHT;
        break;
      case ' ':
        event.preventDefault();
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        return;
    }

    if (newDirection) {
      event.preventDefault();
      setPacMan(prev => ({ ...prev, nextDirection: newDirection }));
    }
  }, [gameState.isPlaying, gameState.isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const drawBoard = (ctx: CanvasRenderingContext2D) => {
    const cellSize = GAME_CONFIG.cellSize;
    
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = board[y][x];
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;

        switch (cell) {
          case CellType.WALL:
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            break;
          case CellType.DOT:
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case CellType.POWER_PELLET:
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
      }
    }
  };

  const drawPacMan = (ctx: CanvasRenderingContext2D) => {
    const cellSize = GAME_CONFIG.cellSize;
    const centerX = pacMan.position.x * cellSize + cellSize / 2;
    const centerY = pacMan.position.y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 2;

    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    if (pacMan.isMoving) {
      const mouthAngle = Math.PI / 3;
      switch (pacMan.direction) {
        case Direction.RIGHT:
          startAngle = mouthAngle / 2;
          endAngle = Math.PI * 2 - mouthAngle / 2;
          break;
        case Direction.LEFT:
          startAngle = Math.PI - mouthAngle / 2;
          endAngle = Math.PI + mouthAngle / 2;
          break;
        case Direction.UP:
          startAngle = Math.PI * 1.5 - mouthAngle / 2;
          endAngle = Math.PI * 1.5 + mouthAngle / 2;
          break;
        case Direction.DOWN:
          startAngle = Math.PI * 0.5 - mouthAngle / 2;
          endAngle = Math.PI * 0.5 + mouthAngle / 2;
          break;
      }
    }
    
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
  };

  const drawGhosts = (ctx: CanvasRenderingContext2D) => {
    const cellSize = GAME_CONFIG.cellSize;
    
    ghosts.forEach(ghost => {
      const centerX = ghost.position.x * cellSize + cellSize / 2;
      const centerY = ghost.position.y * cellSize + cellSize / 2;
      const radius = cellSize / 2 - 2;

      ctx.fillStyle = ghost.isVulnerable ? '#0000FF' : ghost.color;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY - radius / 2, radius, Math.PI, 0);
      ctx.lineTo(centerX + radius, centerY + radius / 2);
      ctx.lineTo(centerX + radius / 2, centerY + radius);
      ctx.lineTo(centerX, centerY + radius / 2);
      ctx.lineTo(centerX - radius / 2, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 4, 0, Math.PI * 2);
      ctx.arc(centerX + radius / 3, centerY - radius / 3, radius / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 6, 0, Math.PI * 2);
      ctx.arc(centerX + radius / 3, centerY - radius / 3, radius / 6, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#FFFF00';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);
    ctx.fillText(`Lives: ${gameState.lives}`, 10, 60);
    ctx.fillText(`Level: ${gameState.level}`, 10, 90);

    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.textAlign = 'left';
    }

    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText('Press R to restart', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
      ctx.textAlign = 'left';
    }
  };

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    
    if (deltaTime >= 150) {
      const newPacMan = movePacMan(pacMan, board);
      const collision = checkCollisions(newPacMan, ghosts, board);
      
      let newBoard = board;
      const newGameState = { ...gameState };
      let newGhosts = [...ghosts];

      if (collision.dot || collision.powerPellet) {
        newBoard = consumeDot(board, newPacMan.position);
        newGameState.score += calculateScore(collision);
        
        if (collision.powerPellet) {
          newGhosts = makeGhostsVulnerable(ghosts);
        }
      }

      if (collision.ghost) {
        if (collision.ghost.isVulnerable) {
          newGameState.score += GAME_CONFIG.ghostPoints;
          newGhosts = newGhosts.map(g => 
            g.id === collision.ghost!.id 
              ? { ...g, position: { x: 10, y: 9 }, isVulnerable: false, vulnerableTimer: 0 }
              : g
          );
        } else {
          newGameState.lives -= 1;
          if (newGameState.lives <= 0) {
            newGameState.gameOver = true;
          }
        }
      }

      newGhosts = updateGhostVulnerability(newGhosts, deltaTime);

      if (isGameWon(newBoard)) {
        newGameState.level += 1;
        newBoard = INITIAL_MAZE.map(row => [...row]);
      }

      setPacMan(newPacMan);
      setBoard(newBoard);
      setGameState(newGameState);
      setGhosts(newGhosts);
      
      lastTimeRef.current = currentTime;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, pacMan, ghosts, board]);

  useEffect(() => {
    if (gameState.isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBoard(ctx);
    drawPacMan(ctx);
    drawGhosts(ctx);
    drawUI(ctx);
  });

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true, gameOver: false }));
  };

  const restartGame = () => {
    setGameState(createInitialGameState());
    setPacMan(createInitialPacMan());
    setGhosts(createInitialGhosts());
    setBoard(INITIAL_MAZE.map(row => [...row]));
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.boardWidth * GAME_CONFIG.cellSize}
          height={GAME_CONFIG.boardHeight * GAME_CONFIG.cellSize}
          className="border border-blue-500 bg-black max-w-full h-auto"
        />
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {!gameState.isPlaying ? (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600 text-sm sm:text-base"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button
          onClick={restartGame}
          className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 text-sm sm:text-base"
        >
          Restart
        </button>
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-400">
        <p className="mb-1">Desktop: Arrow keys or WASD • Space to pause</p>
        <p className="sm:hidden">Mobile: Tap the buttons below to move</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:hidden mt-4">
        <div></div>
        <button
          onTouchStart={() => setPacMan(prev => ({ ...prev, nextDirection: Direction.UP }))}
          className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold active:bg-gray-600"
        >
          ↑
        </button>
        <div></div>
        <button
          onTouchStart={() => setPacMan(prev => ({ ...prev, nextDirection: Direction.LEFT }))}
          className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold active:bg-gray-600"
        >
          ←
        </button>
        <button
          onTouchStart={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
          className="w-12 h-12 bg-yellow-600 text-black rounded-lg font-bold active:bg-yellow-700 text-xs"
        >
          ⏸
        </button>
        <button
          onTouchStart={() => setPacMan(prev => ({ ...prev, nextDirection: Direction.RIGHT }))}
          className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold active:bg-gray-600"
        >
          →
        </button>
        <div></div>
        <button
          onTouchStart={() => setPacMan(prev => ({ ...prev, nextDirection: Direction.DOWN }))}
          className="w-12 h-12 bg-gray-700 text-white rounded-lg font-bold active:bg-gray-600"
        >
          ↓
        </button>
        <div></div>
      </div>
    </div>
  );
}