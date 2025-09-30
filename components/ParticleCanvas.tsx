
import React, { useRef } from 'react';
import { Settings } from '../types';
import { useParticleSystem } from '../hooks/useParticleSystem';

interface ParticleCanvasProps {
  settings: Settings;
  targetText: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ settings, targetText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useParticleSystem(canvasRef, settings, targetText);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};
