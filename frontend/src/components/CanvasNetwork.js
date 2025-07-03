import { useEffect, useRef, useCallback } from 'react';

// Small debounce hook
export function useDebounce(fn, delay) {
  const timeoutRef = useRef();
  const callback = useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
  return callback;
}

import { forwardRef } from 'react';

const CanvasNetwork = forwardRef(function CanvasNetwork({ width = 600, height = 400, agents = [] }, ref) {
  const canvasRef = useRef(null);
  // Agents are stored in a ref to avoid re-renders
  const agentsRef = useRef([]);

  // Initialize agent data only once
  useEffect(() => {
    agentsRef.current = agents.map(agent => ({
      ...agent,
      pulse: 0,
    }));
  }, [agents]);

  const requestRef = useRef();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    agentsRef.current.forEach(agent => {
      // draw node
      ctx.beginPath();
      ctx.fillStyle = '#4f46e5'; // indigo-600
      ctx.arc(agent.x, agent.y, 6, 0, Math.PI * 2);
      ctx.fill();
      // draw pulse if active
      if (agent.pulse > 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99,102,241,' + agent.pulse / 20 + ')';
        ctx.lineWidth = 2;
        ctx.arc(agent.x, agent.y, 6 + agent.pulse, 0, Math.PI * 2);
        ctx.stroke();
        agent.pulse -= 0.5;
      }
    });

    requestRef.current = requestAnimationFrame(draw);
  }, [width, height]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [draw]);

  const debouncedActivity = useDebounce(id => {
    const agent = agentsRef.current.find(a => a.id === id);
    if (agent) {
      agent.pulse = 10;
    }
  }, 200);

  // Expose update function via ref
  useEffect(() => {
    canvasRef.current.updateActivity = debouncedActivity;
  }, [debouncedActivity]);

  return <canvas ref={canvasRef} width={width} height={height} />;
});

export default CanvasNetwork;
