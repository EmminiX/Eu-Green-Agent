"use client";
import React, { useEffect, useRef } from "react";
import { useMobileDetect } from "@/hooks/use-mobile-detect";

interface WaveNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Position {
  x: number;
  y: number;
}

interface WaveConfig {
  debug: boolean;
  friction: number;
  trails: number;
  size: number;
  dampening: number;
  tension: number;
}

class Wave {
  private phase: number;
  private offset: number;
  private frequency: number;
  private amplitude: number;
  private currentValue: number;

  constructor(config: { phase?: number; offset?: number; frequency?: number; amplitude?: number } = {}) {
    this.phase = config.phase || 0;
    this.offset = config.offset || 0;
    this.frequency = config.frequency || 0.001;
    this.amplitude = config.amplitude || 1;
    this.currentValue = 0;
  }

  update(): number {
    this.phase += this.frequency;
    this.currentValue = this.offset + Math.sin(this.phase) * this.amplitude;
    return this.currentValue;
  }

  value(): number {
    return this.currentValue;
  }
}

class TrailLine {
  private spring: number;
  private friction: number;
  private nodes: WaveNode[];

  constructor(config: { spring: number }, waveConfig: WaveConfig, position: Position) {
    this.spring = config.spring + 0.1 * Math.random() - 0.05;
    this.friction = waveConfig.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];

    for (let i = 0; i < waveConfig.size; i++) {
      const node: WaveNode = {
        x: position.x,
        y: position.y,
        vx: 0,
        vy: 0
      };
      this.nodes.push(node);
    }
  }

  update(position: Position, waveConfig: WaveConfig): void {
    const spring = this.spring;
    const firstNode = this.nodes[0];
    
    firstNode.vx += (position.x - firstNode.x) * spring;
    firstNode.vy += (position.y - firstNode.y) * spring;

    for (let i = 0; i < this.nodes.length; i++) {
      const currentNode = this.nodes[i];
      
      if (i > 0) {
        const previousNode = this.nodes[i - 1];
        currentNode.vx += (previousNode.x - currentNode.x) * spring;
        currentNode.vy += (previousNode.y - currentNode.y) * spring;
        currentNode.vx += previousNode.vx * waveConfig.dampening;
        currentNode.vy += previousNode.vy * waveConfig.dampening;
      }

      currentNode.vx *= this.friction;
      currentNode.vy *= this.friction;
      currentNode.x += currentNode.vx;
      currentNode.y += currentNode.vy;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.nodes.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

    for (let i = 1; i < this.nodes.length - 2; i++) {
      const currentNode = this.nodes[i];
      const nextNode = this.nodes[i + 1];
      const midX = 0.5 * (currentNode.x + nextNode.x);
      const midY = 0.5 * (currentNode.y + nextNode.y);
      ctx.quadraticCurveTo(currentNode.x, currentNode.y, midX, midY);
    }

    if (this.nodes.length >= 2) {
      const secondLast = this.nodes[this.nodes.length - 2];
      const last = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
    }

    ctx.stroke();
    ctx.closePath();
  }
}

export const CanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isRunningRef = useRef(false);
  const isMobile = useMobileDetect();
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const position: Position = { x: 0, y: 0 };
    let lines: TrailLine[] = [];
    
    const waveConfig: WaveConfig = {
      debug: true,
      friction: 0.5,
      trails: isMobile ? 20 : 80,
      size: isMobile ? 20 : 50,
      dampening: 0.025,
      tension: 0.99,
    };

    const colorWave = new Wave({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    });

    const resizeCanvas = () => {
      canvas.width = window.innerWidth - 20;
      canvas.height = window.innerHeight;
    };

    const initializeTrails = () => {
      lines = [];
      for (let i = 0; i < waveConfig.trails; i++) {
        lines.push(new TrailLine({ 
          spring: 0.45 + (i / waveConfig.trails) * 0.025 
        }, waveConfig, position));
      }
    };

    const updatePosition = (event: MouseEvent | TouchEvent) => {
      if ('touches' in event) {
        if (event.touches.length > 0) {
          position.x = event.touches[0].pageX;
          position.y = event.touches[0].pageY;
        }
      } else {
        position.x = event.clientX;
        position.y = event.clientY;
      }
      // Don't call preventDefault on passive touch events
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        position.x = event.touches[0].pageX;
        position.y = event.touches[0].pageY;
      }
    };

    const startAnimation = (event: MouseEvent | TouchEvent) => {
      updatePosition(event);
      initializeTrails();
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        render();
      }
    };

    const render = (currentTime: number = 0) => {
      if (!isRunningRef.current || !ctx) return;

      // Limit frame rate on mobile (30fps vs 60fps)
      const targetFrameTime = isMobile ? 33 : 16; // 30fps on mobile, 60fps on desktop
      if (currentTime - lastFrameTimeRef.current < targetFrameTime) {
        animationRef.current = window.requestAnimationFrame(render);
        return;
      }
      lastFrameTimeRef.current = currentTime;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `hsla(${Math.round(colorWave.update())},100%,50%,${isMobile ? 0.015 : 0.025})`;
      ctx.lineWidth = isMobile ? 8 : 10;

      for (const line of lines) {
        line.update(position, waveConfig);
        line.draw(ctx);
      }

      animationRef.current = window.requestAnimationFrame(render);
    };

    const handleFocus = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        render();
      }
    };

    const handleBlur = () => {
      isRunningRef.current = true; // Keep running even when blurred
    };

    // Initialize
    resizeCanvas();
    isRunningRef.current = true;

    // Event listeners with proper passive configuration
    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("touchmove", updatePosition, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("mousemove", startAnimation, { once: true });
    document.addEventListener("touchstart", startAnimation, { once: true, passive: true });
    document.body.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      isRunningRef.current = false;
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
      
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("touchmove", updatePosition);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mousemove", startAnimation);
      document.removeEventListener("touchstart", startAnimation);
      document.body.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    />
  );
};