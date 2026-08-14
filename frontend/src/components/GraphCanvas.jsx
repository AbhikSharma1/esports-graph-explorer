import { useRef, useCallback, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export function GraphCanvas({ graphData, onNodeClick, selectedId }) {
  const fgRef        = useRef();
  const containerRef = useRef();
  const [size, setSize] = useState({ w: 800, h: 600 });

  // Measure container — use getBoundingClientRect for accurate post-layout size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ w: Math.floor(width), h: Math.floor(height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom to fit once after data first arrives
  useEffect(() => {
    if (graphData.nodes.length > 0 && size.w > 200) {
      const t = setTimeout(() => fgRef.current?.zoomToFit(600, 60), 800);
      return () => clearTimeout(t);
    }
  }, [graphData.nodes.length, size.w]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    // Skip nodes that haven't been positioned by the simulation yet
    if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) return;
    const isSelected = node.id === selectedId;
    const r = isSelected ? 10 : 7;

    // Glow halo
    const glowR = r + (isSelected ? 12 : 6);
    const grd = ctx.createRadialGradient(node.x, node.y, r * 0.4, node.x, node.y, glowR);
    grd.addColorStop(0, `${node.color}50`);
    grd.addColorStop(1, `${node.color}00`);
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowR, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();

    // Selection ring
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255,255,255,0.65)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Specular highlight
    const hl = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.35, 0, node.x, node.y, r);
    hl.addColorStop(0, "rgba(255,255,255,0.4)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = hl;
    ctx.fill();

    // Label
    if (globalScale > 0.5) {
      const fs = Math.min(Math.max(11 / globalScale, 2), 13);
      ctx.font = `600 ${fs}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillText(node.label, node.x + 0.5, node.y + r + 2.5);
      ctx.fillStyle = isSelected ? "#fff" : "rgba(226,232,240,0.9)";
      ctx.fillText(node.label, node.x, node.y + r + 2);
    }
  }, [selectedId]);

  return (
    <div ref={containerRef} className="graph-bg" style={{ position: "absolute", inset: 0 }}>
      <ForceGraph2D
        ref={fgRef}
        width={size.w}
        height={size.h}
        graphData={graphData}
        nodeId="id"
        nodeLabel=""
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        // Static colors — no functions that run per-frame and touch link.source/target
        linkColor="rgba(99,102,241,0.25)"
        linkWidth={1}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalArrowColor="rgba(99,102,241,0.4)"
        onNodeClick={onNodeClick}
        backgroundColor="transparent"
        cooldownTicks={120}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}
