import {
  Position,
  Direction,
  GameState,
  PacMan,
  Ghost,
  GhostMode,
  CellType,
  GameBoard,
  CollisionResult,
  GameConfig
} from './gameTypes';

export const GAME_CONFIG: GameConfig = {
  cellSize: 20,
  boardWidth: 21,
  boardHeight: 23,
  pacManSpeed: 2,
  ghostSpeed: 1.5,
  vulnerableTime: 8000,
  dotPoints: 10,
  powerPelletPoints: 50,
  ghostPoints: 200
};

export const INITIAL_MAZE: GameBoard = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,4,4,4,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,0,0,0,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export function createInitialGameState(): GameState {
  return {
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false,
    isPaused: false,
    gameOver: false
  };
}

export function createInitialPacMan(): PacMan {
  return {
    position: { x: 10, y: 15 },
    direction: Direction.RIGHT,
    nextDirection: null,
    isMoving: false
  };
}

export function createInitialGhosts(): Ghost[] {
  return [
    {
      id: 'blinky',
      position: { x: 10, y: 9 },
      direction: Direction.UP,
      mode: GhostMode.CHASE,
      color: '#FF0000',
      targetPosition: { x: 10, y: 9 },
      isVulnerable: false,
      vulnerableTimer: 0
    },
    {
      id: 'pinky',
      position: { x: 9, y: 10 },
      direction: Direction.DOWN,
      mode: GhostMode.SCATTER,
      color: '#FFB8FF',
      targetPosition: { x: 9, y: 10 },
      isVulnerable: false,
      vulnerableTimer: 0
    },
    {
      id: 'inky',
      position: { x: 10, y: 10 },
      direction: Direction.UP,
      mode: GhostMode.SCATTER,
      color: '#00FFFF',
      targetPosition: { x: 10, y: 10 },
      isVulnerable: false,
      vulnerableTimer: 0
    },
    {
      id: 'clyde',
      position: { x: 11, y: 10 },
      direction: Direction.DOWN,
      mode: GhostMode.SCATTER,
      color: '#FFB852',
      targetPosition: { x: 11, y: 10 },
      isVulnerable: false,
      vulnerableTimer: 0
    }
  ];
}

export function getDirectionVector(direction: Direction): Position {
  switch (direction) {
    case Direction.UP: return { x: 0, y: -1 };
    case Direction.DOWN: return { x: 0, y: 1 };
    case Direction.LEFT: return { x: -1, y: 0 };
    case Direction.RIGHT: return { x: 1, y: 0 };
  }
}

export function isValidMove(position: Position, direction: Direction, board: GameBoard): boolean {
  const vector = getDirectionVector(direction);
  const newPos = {
    x: position.x + vector.x,
    y: position.y + vector.y
  };

  if (newPos.x < 0 || newPos.x >= GAME_CONFIG.boardWidth ||
      newPos.y < 0 || newPos.y >= GAME_CONFIG.boardHeight) {
    return false;
  }

  const cell = board[newPos.y][newPos.x];
  return cell !== CellType.WALL;
}

export function movePacMan(pacMan: PacMan, board: GameBoard): PacMan {
  if (pacMan.nextDirection && isValidMove(pacMan.position, pacMan.nextDirection, board)) {
    pacMan.direction = pacMan.nextDirection;
    pacMan.nextDirection = null;
  }

  if (isValidMove(pacMan.position, pacMan.direction, board)) {
    const vector = getDirectionVector(pacMan.direction);
    return {
      ...pacMan,
      position: {
        x: pacMan.position.x + vector.x,
        y: pacMan.position.y + vector.y
      },
      isMoving: true
    };
  }

  return { ...pacMan, isMoving: false };
}

export function checkCollisions(pacMan: PacMan, ghosts: Ghost[], board: GameBoard): CollisionResult {
  const pos = pacMan.position;
  const cell = board[pos.y][pos.x];
  
  const hitGhost = ghosts.find(ghost => 
    ghost.position.x === pos.x && ghost.position.y === pos.y
  );

  return {
    dot: cell === CellType.DOT,
    powerPellet: cell === CellType.POWER_PELLET,
    ghost: hitGhost || null,
    wall: cell === CellType.WALL
  };
}

export function consumeDot(board: GameBoard, position: Position): GameBoard {
  const newBoard = board.map(row => [...row]);
  if (newBoard[position.y][position.x] === CellType.DOT ||
      newBoard[position.y][position.x] === CellType.POWER_PELLET) {
    newBoard[position.y][position.x] = CellType.EMPTY;
  }
  return newBoard;
}

export function makeGhostsVulnerable(ghosts: Ghost[]): Ghost[] {
  return ghosts.map(ghost => ({
    ...ghost,
    isVulnerable: true,
    vulnerableTimer: GAME_CONFIG.vulnerableTime,
    mode: GhostMode.FRIGHTENED
  }));
}

export function updateGhostVulnerability(ghosts: Ghost[], deltaTime: number): Ghost[] {
  return ghosts.map(ghost => {
    if (ghost.isVulnerable) {
      const newTimer = ghost.vulnerableTimer - deltaTime;
      if (newTimer <= 0) {
        return {
          ...ghost,
          isVulnerable: false,
          vulnerableTimer: 0,
          mode: GhostMode.CHASE
        };
      }
      return { ...ghost, vulnerableTimer: newTimer };
    }
    return ghost;
  });
}

export function calculateScore(collision: CollisionResult): number {
  let points = 0;
  
  if (collision.dot) {
    points += GAME_CONFIG.dotPoints;
  }
  
  if (collision.powerPellet) {
    points += GAME_CONFIG.powerPelletPoints;
  }
  
  if (collision.ghost && collision.ghost.isVulnerable) {
    points += GAME_CONFIG.ghostPoints;
  }
  
  return points;
}

export function isGameWon(board: GameBoard): boolean {
  return !board.some(row => 
    row.some(cell => cell === CellType.DOT || cell === CellType.POWER_PELLET)
  );
}