import { useState, Component } from "react";
import { Network, RefreshCw, AlertTriangle, Users, User, Trophy, GitBranch } from "lucide-react";
import { useGraph } from "./hooks/useGraph";
import { GraphCanvas } from "./components/GraphCanvas";
import { GraphLegend } from "./components/GraphLegend";
import { SearchBar } from "./components/SearchBar";
import { SidePanel } from "./components/SidePanel";
import { SkeletonBlock } from "./components/Skeleton";

// Catches any render crash and shows a message instead of a black screen
class ErrorBoundary extends Component {
  state = { crashed: false, msg: "" };
  static getDerivedStateFromError(err) { return { crashed: true, msg: err.message }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050810]">
          <div className="text-center max-w-sm">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Something crashed</p>
            <p className="text-xs text-slate-500 mb-4 font-mono break-all">{this.state.msg}</p>
            <button onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StatCard({ icon: Icon, label, value, accentClass, loading }) {
  return (
    <div className={`stat-card ${accentClass} flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5`}>
      {loading ? <SkeletonBlock className="w-20 h-8" /> : (
        <>
          <Icon size={15} className="text-slate-500 shrink-0" />
          <div>
            <p className="text-lg font-esports font-bold text-white leading-none">{value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-white font-semibold mb-1">Database Unreachable</h2>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <button onClick={onRetry} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-colors">
          Retry
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-purple-500/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading graph...</p>
        <p className="text-xs text-slate-600 mt-1">Fetching nodes & relationships</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <Network size={24} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">Graph is empty</p>
        <p className="text-sm text-slate-600 mt-1">Run <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">npm run seed</code> to populate</p>
      </div>
    </div>
  );
}

export default function App() {
  const { graphData, loading, error, reload } = useGraph();
  const [selected, setSelected] = useState(null);

  function handleNodeClick(node) {
    setSelected({ id: node.id, group: node.group, label: node.label, labels: [node.group], props: node.props });
  }

  const playerCount     = graphData.nodes.filter((n) => n.group === "Player").length;
  const teamCount       = graphData.nodes.filter((n) => n.group === "Team").length;
  const tournamentCount = graphData.nodes.filter((n) => n.group === "Tournament").length;

  return (
    <div className="h-screen bg-[#050810] text-white flex flex-col overflow-hidden">

      <header className="shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.07] bg-[#070a16]/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Network size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-esports font-bold text-white leading-none tracking-wide">ESPORTS GRAPH</h1>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Tournament Network Explorer</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <StatCard icon={User}      label="Players"     value={playerCount}            accentClass="accent-indigo"  loading={loading} />
          <StatCard icon={Users}     label="Teams"       value={teamCount}              accentClass="accent-amber"   loading={loading} />
          <StatCard icon={Trophy}    label="Tournaments" value={tournamentCount}        accentClass="accent-emerald" loading={loading} />
          <StatCard icon={GitBranch} label="Connections" value={graphData.links.length} accentClass="accent-slate"   loading={loading} />
        </div>

        <div className="flex items-center gap-2.5">
          <SearchBar onSelect={(r) => setSelected(r)} />
          <button onClick={reload} title="Reload graph"
            className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] flex items-center justify-center transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : "text-slate-500"} />
          </button>
        </div>
      </header>

      {/* min-h-0 is critical — without it flex children don't shrink and h-full resolves to 0 */}
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 relative min-w-0 min-h-0">
          {error   ? <ErrorState message={error} onRetry={reload} /> :
           loading ? <LoadingState /> :
           graphData.nodes.length === 0 ? <EmptyState /> : (
            <>
              <ErrorBoundary>
                <GraphCanvas graphData={graphData} onNodeClick={handleNodeClick} selectedId={selected?.id} />
              </ErrorBoundary>
              <GraphLegend />
              {!selected && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                  <div className="flex items-center gap-2 bg-[#0a0d1a]/90 backdrop-blur border border-white/[0.08] rounded-full px-4 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
                    <span className="text-xs text-slate-400">Click any node to inspect</span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {selected && <SidePanel selected={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
