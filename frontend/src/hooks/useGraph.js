import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const COLOR_MAP = {
  Player:     "#6366f1",
  Team:       "#f59e0b",
  Tournament: "#10b981",
  GameRole:   "#ec4899",
};

export function useGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  // Use a ref to track the reload counter so we can re-trigger the effect
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api.getAll()
      .then(({ nodes, links }) => {
        if (!alive) return;
        setGraphData({
          nodes: nodes.map((n) => ({
            id:    String(n.id),
            label: n.props.name || n.props.title || String(n.id),
            group: n.labels[0],
            color: COLOR_MAP[n.labels[0]] || "#94a3b8",
            props: n.props,
          })),
          // Give every link a unique id so react-force-graph can track them
          links: links.map((l, i) => ({
            id:     `e${i}`,
            source: String(l.source),
            target: String(l.target),
            type:   l.type,
          })),
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    // Cleanup: mark stale so an in-flight fetch doesn't update state after unmount
    return () => { alive = false; };
  }, [tick]); // re-runs whenever tick changes (i.e. when reload() is called)

  const reload = () => setTick((t) => t + 1);

  return { graphData, loading, error, reload };
}
