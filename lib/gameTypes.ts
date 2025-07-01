export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
}

export interface PacMan {
  position: Position;
  direction: Direction;
  nextDirection: Direction | null;
  isMoving: boolean;
}

export interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  mode: GhostMode;
  color: string;
  targetPosition: Position;
  isVulnerable: boolean;
  vulnerableTimer: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export enum GhostMode {
  CHASE = 'CHASE',
  SCATTER = 'SCATTER',
  FRIGHTENED = 'FRIGHTENED',
  EATEN = 'EATEN'
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_PELLET = 3,
  GHOST_DOOR = 4
}

export interface GameConfig {
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
  pacManSpeed: number;
  ghostSpeed: number;
  vulnerableTime: number;
  dotPoints: number;
  powerPelletPoints: number;
  ghostPoints: number;
}

export type GameBoard = CellType[][];

export interface CollisionResult {
  dot: boolean;
  powerPellet: boolean;
  ghost: Ghost | null;
  wall: boolean;
}