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

const CanvasNetwork = forwardRef(function CanvasNetwork({ width = 600, height = 400, agents = [], events = [] }, ref) {
  const canvasRef = useRef(null);
  // Agents are stored in a ref to avoid re-renders
  const agentsRef = useRef([]);
  const connectionsRef = useRef([]);

  // Initialize agent data only once
  useEffect(() => {
    agentsRef.current = agents.map(agent => ({
      ...agent,
      pulse: 0,
    }));
    // initialize connections
    const conns = [];
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        conns.push({ from: agents[i].id, to: agents[j].id, pulse: 0 });
      }
    }
    connectionsRef.current = conns;
  }, [agents]);

  const requestRef = useRef();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // background gradient
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.2
    );
    gradient.addColorStop(0, '#1b0d3f');
    gradient.addColorStop(1, '#050017');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // draw connection lines with pulse intensity
    connectionsRef.current.forEach(conn => {
      const from = agentsRef.current.find(a => a.id === conn.from);
      const to = agentsRef.current.find(a => a.id === conn.to);
      if (!from || !to) return;
      const activity = conn.pulse;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,255,220,${activity / 20})`;
      ctx.lineWidth = activity > 0 ? 2 : 1;
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      if (conn.pulse > 0) conn.pulse -= 0.3;
    });

    agentsRef.current.forEach(agent => {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#a855f7';
      ctx.beginPath();
      ctx.fillStyle = '#7c3aed';
      ctx.arc(agent.x, agent.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (agent.pulse > 0) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,255,220,${agent.pulse / 20})`;
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

  // React to incoming AgentSync events
  useEffect(() => {
    if (!events.length) return;
    const data = events[0];
    const fromId = data._agentId;
    if (fromId) {
      debouncedActivity(fromId);
      const targetId = data.targetAgent;
      connectionsRef.current.forEach(conn => {
        if (
          conn.from === fromId ||
          conn.to === fromId ||
          (targetId && ((conn.from === fromId && conn.to === targetId) || (conn.from === targetId && conn.to === fromId)))
        ) {
          const important =
            /model|strategy/i.test(data.stepType || data.type || '') || targetId;
          conn.pulse = important ? 20 : 10;
        }
      });
    }
  }, [events, debouncedActivity]);

  return <canvas ref={canvasRef} width={width} height={height} />;
});

export default CanvasNetwork;
