import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  color?: string;
  activeColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  height = 36,
  color = '#475569',
  activeColor = '#6366f1',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const heights = new Array(barCount).fill(4);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = Math.floor(canvas.width / barCount) - 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        let targetHeight = 4;
        if (isPlaying) {
          // Dynamic harmonic audio waveform simulation
          const wave1 = Math.sin(phase + i * 0.35);
          const wave2 = Math.cos(phase * 1.5 + i * 0.2);
          const normalized = (Math.abs(wave1 * 0.7 + wave2 * 0.3));
          targetHeight = Math.max(6, normalized * (canvas.height * 0.85));
        }

        // Smooth transition
        heights[i] += (targetHeight - heights[i]) * 0.2;

        const x = i * (barWidth + 2);
        const barH = heights[i];
        const y = centerY - barH / 2;

        // Gradient for vibrant look
        const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
        if (isPlaying) {
          gradient.addColorStop(0, '#818cf8'); // indigo-400
          gradient.addColorStop(0.5, '#6366f1'); // indigo-500
          gradient.addColorStop(1, '#06b6d4'); // cyan-500
        } else {
          gradient.addColorStop(0, '#64748b');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 2);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.08;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 6}
      height={height}
      className="rounded-md opacity-90 transition-opacity"
    />
  );
};
