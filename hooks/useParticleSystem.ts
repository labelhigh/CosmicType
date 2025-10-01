import React, { useEffect, useRef } from 'react';
import { Settings, Particle, ParticleState, Theme, Shape } from '../types';
import { CHAR_SETS, FONT_SIZE_BASE, TEXT_HOLD_DURATION } from '../constants';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};


export const useParticleSystem = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  settings: Settings,
  targetText: string
) => {
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastTargetText = useRef<string>('');
  const lastShape = useRef<Shape>(Shape.None);

  // 3D state
  const rotationX = useRef(0.2);
  const rotationY = useRef(0);
  const targetRotationX = useRef(0.2);
  const targetRotationY = useRef(0);
  const isDragging = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const zoomRef = useRef(1.0);
  
  const isInitialized = useRef(false);
  const lastSettings = useRef(settings);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const needsReInit = !isInitialized.current || 
                        lastSettings.current.language !== settings.language || 
                        lastSettings.current.particleCount !== settings.particleCount;

    const getSpread = () => {
        if (!canvas) return { spreadX: 500, spreadY: 500, spreadZ: 500 };
        return {
            spreadX: canvas.width * 1.5,
            spreadY: canvas.height * 1.5,
            spreadZ: Math.max(canvas.width, canvas.height),
        };
    };

    const initializeParticles = () => {
        const charSet = CHAR_SETS[settings.language];
        particlesRef.current = [];
        const { spreadX, spreadY, spreadZ } = getSpread();
        for (let i = 0; i < settings.particleCount; i++) {
            const x = (Math.random() - 0.5) * spreadX;
            const y = (Math.random() - 0.5) * spreadY;
            const z = (Math.random() - 0.5) * spreadZ;
            particlesRef.current.push({
                x, y, z,
                vx: 0, vy: 0, vz: 0,
                homeX: x, homeY: y, homeZ: z,
                targetX: null, targetY: null, targetZ: null,
                char: charSet[Math.floor(Math.random() * charSet.length)],
                state: ParticleState.Wandering,
                color: '#fff',
                size: Math.random() * 0.7 + 0.3, // Randomized base size
                alpha: 1,
                holdTime: 0,
            });
        }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (needsReInit) {
        initializeParticles();
        isInitialized.current = true;
      } else {
        const { spreadX, spreadY, spreadZ } = getSpread();
        particlesRef.current.forEach(p => {
          p.homeX = (Math.random() - 0.5) * spreadX;
          p.homeY = (Math.random() - 0.5) * spreadY;
          p.homeZ = (Math.random() - 0.5) * spreadZ;
        });
      }
    };
    
    const updateParticle = (p: Particle) => {
        let targetX = p.homeX;
        let targetY = p.homeY;
        let targetZ = p.homeZ;

        if (p.state === ParticleState.Assembling && p.targetX !== null && p.targetY !== null && p.targetZ !== null) {
            targetX = p.targetX;
            targetY = p.targetY;
            targetZ = p.targetZ;
        } else if (p.state === ParticleState.Holding && p.targetX !== null && p.targetY !== null && p.targetZ !== null) {
            if (p.holdTime !== Infinity) {
              p.holdTime -= 16;
              if (p.holdTime <= 0) p.state = ParticleState.Dissipating;
            }
            targetX = p.targetX;
            targetY = p.targetY;
            targetZ = p.targetZ;
        }

        // When a particle is dissipating, it moves back to its home position.
        // Once it's close enough, we reset its state to Wandering and give it a new random character.
        // This ensures the text "dissolves" back into the random cloud.
        if (p.state === ParticleState.Dissipating) {
            const dx = p.x - p.homeX;
            const dy = p.y - p.homeY;
            const dz = p.z - p.homeZ;
            if ((dx*dx + dy*dy + dz*dz) < 100) { // If close to home
                p.state = ParticleState.Wandering;
                const charSet = CHAR_SETS[settings.language];
                p.char = charSet[Math.floor(Math.random() * charSet.length)];
            }
        }

        const ease = p.state === ParticleState.Wandering ? 0.01 : 0.08;
        p.vx = lerp(p.vx, targetX - p.x, ease);
        p.vy = lerp(p.vy, targetY - p.y, ease);
        p.vz = lerp(p.vz, targetZ - p.z, ease);

        p.x += p.vx * settings.speed;
        p.y += p.vy * settings.speed;
        p.z += p.vz * settings.speed;
        
        if (settings.theme === Theme.Matrix && p.state === ParticleState.Wandering) {
            p.y += p.size * 0.5 * settings.speed;
            if (p.y > getSpread().spreadY / 2) {
                p.y = -getSpread().spreadY / 2;
            }
        }
    };
    
    const animate = () => {
      const { theme, trailIntensity, backgroundColor } = settings;

      // Handle fading trail effect
      switch (theme) {
        case Theme.Matrix:
          const matrixClearAlpha = 0.3 - (trailIntensity * 0.28);
          const rgbMatrix = hexToRgb(backgroundColor) || { r: 0, g: 0, b: 0 };
          ctx.fillStyle = `rgba(${rgbMatrix.r}, ${rgbMatrix.g}, ${rgbMatrix.b}, ${matrixClearAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        case Theme.Ink:
          const inkClearAlpha = 1 - trailIntensity;
          ctx.fillStyle = `rgba(240, 232, 216, ${inkClearAlpha})`; // #f0e8d8
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
        default: // Default and Fire themes
          const defaultClearAlpha = 1 - trailIntensity;
          const rgbDefault = hexToRgb(backgroundColor) || { r: 0, g: 0, b: 0 };
          ctx.fillStyle = `rgba(${rgbDefault.r}, ${rgbDefault.g}, ${rgbDefault.b}, ${defaultClearAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
      }
      
      rotationX.current = lerp(rotationX.current, targetRotationX.current, 0.05);
      rotationY.current = lerp(rotationY.current, targetRotationY.current, 0.05);
      if (!isDragging.current) {
        targetRotationY.current += settings.rotation * 0.001;
      }

      const baseFov = canvas.width * 0.7;
      const fov = baseFov / zoomRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const sinX = Math.sin(rotationX.current);
      const cosX = Math.cos(rotationX.current);
      const sinY = Math.sin(rotationY.current);
      const cosY = Math.cos(rotationY.current);

      particlesRef.current.forEach(p => {
        updateParticle(p);

        // 3D Rotation
        const rY_x = p.x * cosY - p.z * sinY;
        const rY_z = p.x * sinY + p.z * cosY;

        const rX_y = p.y * cosX - rY_z * sinX;
        const rX_z = p.y * sinX + rY_z * cosX;

        // Perspective Projection
        const scale = fov / (fov + rX_z);
        const projX = rY_x * scale + centerX;
        const projY = rX_y * scale + centerY;

        if (scale > 0) {
            // Inlined drawParticle logic for performance
            if (projX < 0 || projX > canvas.width || projY < 0 || projY > canvas.height) return;

            const isAssembledParticle = p.state !== ParticleState.Wandering;
            const size = (isAssembledParticle ? FONT_SIZE_BASE * 4.0 : FONT_SIZE_BASE * p.size) * scale * settings.particleSize;
            const alpha = scale;
            
            let color;
            ctx.shadowBlur = 0;

            switch (settings.theme) {
              case Theme.Matrix:
                color = isAssembledParticle ? `rgba(200, 255, 200, ${alpha})` : `rgba(0, 255, 70, ${alpha})`;
                break;
              case Theme.Fire:
                const r = 255;
                const g = isAssembledParticle ? 255 : Math.floor(200 - p.z * 0.1);
                const b = isAssembledParticle ? 150 : 0;
                color = `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`;
                ctx.shadowBlur = isAssembledParticle ? 20 : 10;
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
                break;
              case Theme.Ink:
                color = isAssembledParticle ? `rgba(0, 0, 0, ${alpha * 0.9})` : `rgba(30, 30, 30, ${alpha * 0.7})`;
                ctx.shadowBlur = 2;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                break;
              default: // Default Theme
                if (isAssembledParticle) {
                  color = `rgba(255, 255, 255, ${alpha})`;
                  ctx.shadowBlur = 20;
                  ctx.shadowColor = 'rgba(200, 225, 255, 1)';
                } else {
                  color = `rgba(200, 225, 255, ${alpha * (p.size * 0.5 + 0.5)})`;
                  ctx.shadowBlur = p.size > 0.8 ? 3 : 0;
                  ctx.shadowColor = 'rgba(150, 200, 255, 0.5)';
                }
                break;
            }
            
            ctx.fillStyle = color;
            ctx.font = `${size}px "Noto Sans SC", sans-serif`;
            ctx.fillText(p.char, projX, projY);
        }
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleMouseDown = (e: MouseEvent) => {
        isDragging.current = true;
        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
    };
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouseX.current;
        const dy = e.clientY - lastMouseY.current;
        targetRotationY.current += dx * 0.005;
        targetRotationX.current -= dy * 0.005;
        // Clamp vertical rotation
        targetRotationX.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX.current));
        lastMouseX.current = e.clientX;
        lastMouseY.current = e.clientY;
    };
    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomRef.current -= e.deltaY * 0.001;
        // Clamp zoom level
        zoomRef.current = Math.max(0.5, Math.min(5, zoomRef.current));
    };
    
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    lastSettings.current = settings;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [canvasRef, settings]);


  // Effect for shape changes
  useEffect(() => {
    if (settings.shape === lastShape.current) return;
    lastShape.current = settings.shape;
    
    if (settings.shape === Shape.None) {
        if (!targetText) { // Only dissipate if no text is taking over
             particlesRef.current.forEach(p => {
                if (p.state !== ParticleState.Wandering) p.state = ParticleState.Dissipating;
            });
        }
        return;
    }

    // A shape is selected, so dissipate any existing text/shape
    particlesRef.current.forEach(p => { if (p.state !== ParticleState.Wandering) p.state = ParticleState.Dissipating; });

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const numPoints = Math.min(particlesRef.current.length, Math.floor(settings.particleCount * 0.9));
    let shapePoints: {x: number, y: number, z: number}[] = [];
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    switch(settings.shape) {
        case Shape.Sphere:
            for (let i = 0; i < numPoints; i++) {
                const phi = Math.acos(-1 + (2 * i) / numPoints);
                const theta = Math.sqrt(numPoints * Math.PI) * phi;
                shapePoints.push({ x: radius * Math.cos(theta) * Math.sin(phi), y: radius * Math.sin(theta) * Math.sin(phi), z: radius * Math.cos(phi) });
            }
            break;
        case Shape.Torus:
            const majorRadius = radius;
            const minorRadius = radius * 0.4;
            for (let i = 0; i < numPoints; i++) {
                const u = (Math.random()) * 2 * Math.PI;
                const v = (Math.random()) * 2 * Math.PI;
                shapePoints.push({ x: (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u), y: (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u), z: minorRadius * Math.sin(v) });
            }
            break;
        case Shape.Cube:
            const sideLength = radius * 1.5;
            const halfSide = sideLength / 2;
            const pointsPerFace = Math.floor(numPoints / 6);
            for(let i = 0; i < 6; i++) {
                for (let j = 0; j < pointsPerFace; j++) {
                    const r1 = Math.random() * sideLength - halfSide;
                    const r2 = Math.random() * sideLength - halfSide;
                    if (i === 0) shapePoints.push({ x: r1, y: r2, z: halfSide });
                    else if (i === 1) shapePoints.push({ x: r1, y: r2, z: -halfSide });
                    else if (i === 2) shapePoints.push({ x: halfSide, y: r1, z: r2 });
                    else if (i === 3) shapePoints.push({ x: -halfSide, y: r1, z: r2 });
                    else if (i === 4) shapePoints.push({ x: r1, y: halfSide, z: r2 });
                    else if (i === 5) shapePoints.push({ x: r1, y: -halfSide, z: r2 });
                }
            }
            break;
    }

    const availableParticles = [...particlesRef.current].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(numPoints, shapePoints.length); i++) {
        const p = availableParticles[i];
        const point = shapePoints[i];
        p.state = ParticleState.Assembling;
        p.targetX = point.x;
        p.targetY = point.y;
        p.targetZ = point.z;
        p.holdTime = Infinity;
        setTimeout(() => { if(p.state === ParticleState.Assembling) p.state = ParticleState.Holding; }, 1500);
    }
  }, [settings.shape, settings.particleCount, canvasRef, targetText]);

  // Effect for text changes
  useEffect(() => {
    if (targetText && lastTargetText.current !== targetText) {
      lastTargetText.current = targetText;

      const timerId = setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
  
        particlesRef.current.forEach(p => {
            if (p.state !== ParticleState.Wandering) {
                p.state = ParticleState.Dissipating;
            }
        });
  
        const fontSize = Math.min(canvas.width / (targetText.length + 2), 100);
        ctx.font = `bold ${fontSize}px "Noto Sans SC", sans-serif`;
        const textMetrics = ctx.measureText(targetText);
        const textWidth = textMetrics.width;
  
        const startX = -textWidth / 2;
  
        let currentX = startX;
        
        const availableParticles = [...particlesRef.current].sort(() => 0.5 - Math.random());
        let particleIndex = 0;
  
        for (let i = 0; i < targetText.length; i++) {
          const char = targetText[i];
          if (char === ' ') {
              currentX += fontSize * 0.5;
              continue;
          };
  
          const charMetrics = ctx.measureText(char);
          const charWidth = charMetrics.width;
  
          if(particleIndex >= availableParticles.length) break;
          const p = availableParticles[particleIndex++];
  
          p.char = char;
          p.state = ParticleState.Assembling;
          p.targetX = currentX + charWidth / 2;
          p.targetY = 0;
          p.targetZ = 200; // Bring text to the front
          p.holdTime = TEXT_HOLD_DURATION;
          
          setTimeout(() => {
              if(p.state === ParticleState.Assembling) {
                  p.state = ParticleState.Holding;
              }
          }, 1500);
  
          currentX += charWidth;
        }
      }, 50); // A small delay to ensure canvas is ready for measurement

      return () => clearTimeout(timerId);

    } else if (!targetText && lastTargetText.current) {
        lastTargetText.current = '';
        if (settings.shape === Shape.None) {
            particlesRef.current.forEach(p => {
                if (p.state !== ParticleState.Wandering) {
                    p.state = ParticleState.Dissipating;
                }
            });
        }
    }
  }, [targetText, canvasRef, settings.particleCount, settings.shape]); // Re-run if particle count or shape changes
};