const items = [
  { color: "#6366f1", label: "Player",     dot: "shadow-[0_0_6px_#6366f1]" },
  { color: "#f59e0b", label: "Team",       dot: "shadow-[0_0_6px_#f59e0b]" },
  { color: "#10b981", label: "Tournament", dot: "shadow-[0_0_6px_#10b981]" },
  { color: "#ec4899", label: "Game Role",  dot: "shadow-[0_0_6px_#ec4899]" },
];

export function GraphLegend() {
  return (
    <div className="absolute bottom-5 left-5 flex flex-col gap-2 bg-[#0a0d1a]/80 backdrop-blur-md border border-white/[0.07] rounded-2xl px-4 py-3">
      <p className="text-[10px] font-esports font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
        Node Types
      </p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`}
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-slate-400 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
