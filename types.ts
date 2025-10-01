export enum Language {
  TraditionalChinese = 'Traditional Chinese',
  SimplifiedChinese = 'Simplified Chinese',
  English = 'English',
  Japanese = 'Japanese',
  Mixed = 'Mixed',
}

export enum Theme {
  Default = 'Default',
  Matrix = 'Matrix',
  Fire = 'Fire',
  Ink = 'Ink Wash',
}

export enum Shape {
  None = 'None',
  Sphere = 'Sphere',
  Torus = 'Torus',
  Cube = 'Cube',
}

export interface Settings {
  speed: number;
  rotation: number;
  language: Language;
  theme: Theme;
  particleCount: number;
  trailIntensity: number;
  shape: Shape;
  particleSize: number;
  quoteIdleTime: number;
  backgroundColor: string;
}

export enum ParticleState {
    Wandering,
    Assembling,
    Holding,
    Dissipating,
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number; // Add velocity for z-axis
  homeX: number;
  homeY: number;
  homeZ: number;
  targetX: number | null;
  targetY: number | null;
  targetZ: number | null; // Add target for z-axis
  char: string;
  state: ParticleState;
  color: string;
  size: number;
  alpha: number;
  holdTime: number;
}