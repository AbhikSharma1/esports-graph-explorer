import { useEffect, useState } from "react";
import { User, Users, Trophy, Swords, X, Shield, Zap, Globe, Hash, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { api } from "../api";
import { SidePanelSkeleton } from "./Skeleton";

// ── Small helpers ─────────────────────────────────────────────────────────────

function Tag({ text, variant = "default" }) {
  const styles = {
    default:  "bg-white/[0.06] text-slate-300 border-white/[0.08]",
    indigo:   "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    amber:    "bg-amber-500/10 text-amber-300 border-amber-500/20",
    emerald:  "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    red:      "bg-red-500/10 text-red-300 border-red-500/20",
    yellow:   "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    purple:   "bg-purple-500/10 text-purple-300 border-purple-500/20",
    blue:     "bg-blue-500/10 text-blue-300 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border tracking-wide ${styles[variant]}`}>
      {text}
    </span>
  );
}

function StatBox({ icon: Icon, label, value, accent = "#6366f1" }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1.5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${accent}60, transparent)` }} />
      <Icon size={13} style={{ color: accent }} className="opacity-80" />
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none">{label}</p>
      <p className="text-sm font-bold text-white leading-none">{value}</p>
    </div>
  );
}

function WinRateBar({ rate }) {
  const pct = Math.round(rate * 100);
  const color = pct >= 70 ? "#10b981" : pct >= 55 ? "#6366f1" : "#f59e0b";
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} style={{ color }} />
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Win Rate</p>
        </div>
        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="winrate-bar">
        <div className="winrate-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
      </div>
    </div>
  );
}

// ── Player profile tab ────────────────────────────────────────────────────────

function PlayerProfile({ profile }) {
  return (
    <div className="space-y-3">
      {/* Handle + nationality hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mb-1">Handle</p>
            <p className="text-xl font-esports font-bold text-white">@{profile.handle}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Country</p>
            <p className="text-lg font-bold text-slate-200">{profile.nationality}</p>
          </div>
        </div>
      </div>

      {/* Win rate bar */}
      <WinRateBar rate={profile.winRate} />

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox icon={Swords}   label="Role"    value={profile.role}          accent="#ec4899" />
        <StatBox icon={Hash}     label="Jersey"  value={`#${profile.jerseyNumber}`} accent="#6366f1" />
        <StatBox icon={Calendar} label="Joined"  value={profile.joinedDate}    accent="#64748b" />
        <StatBox icon={Globe}    label="Region"  value={profile.team?.region || "—"} accent="#10b981" />
      </div>

      {/* Team card */}
      {profile.team && (
        <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={13} className="text-amber-400" />
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Current Team</p>
          </div>
          <p className="text-base font-esports font-bold text-white">{profile.team.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">Est. {profile.team.establishedYear} · {profile.team.tag}</p>
        </div>
      )}

      {/* Tournament history */}
      {profile.tournaments?.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-2 px-0.5">
            Tournament History
          </p>
          <div className="space-y-1.5">
            {profile.tournaments.map((t, i) => {
              const tierVariant = { "S+": "yellow", S: "purple", A: "blue" }[t.tier] || "default";
              const placementColor = t.placement === 1 ? "text-yellow-400" : t.placement === 2 ? "text-slate-300" : t.placement === 3 ? "text-amber-600" : "text-slate-500";
              return (
                <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 hover:border-white/10 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{t.year} · ${Number(t.prizePool).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <Tag text={`T${t.tier}`} variant={tierVariant} />
                    <span className={`text-sm font-bold font-esports ${placementColor}`}>#{t.placement}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rivals tab ────────────────────────────────────────────────────────────────

function RivalsTab({ rivals }) {
  if (rivals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Shield size={20} className="text-slate-600" />
        </div>
        <p className="text-sm text-slate-500">No rivals found</p>
      </div>
    );
  }

  // Group by tournament
  const grouped = rivals.reduce((acc, r) => {
    (acc[r.tournament] = acc[r.tournament] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/[0.06] border border-indigo-500/15 rounded-xl px-3.5 py-2.5">
        <p className="text-xs text-indigo-300 leading-relaxed">
          Teams that competed in the same tournaments — found via a 3-hop graph traversal.
        </p>
      </div>

      {Object.entries(grouped).map(([tournament, rows]) => (
        <div key={tournament}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={11} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest truncate">{tournament}</p>
          </div>
          <div className="space-y-1">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 hover:border-white/10 transition-colors">
                <ChevronRight size={12} className="text-slate-600 shrink-0" />
                <span className="text-sm text-slate-200 font-medium flex-1">{r.rivalTeam}</span>
                <Tag text={r.rivalRegion} variant="default" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Team scrim panel ──────────────────────────────────────────────────────────

function ScrimPanel({ scrims }) {
  if (!scrims || scrims.directPartners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Zap size={20} className="text-slate-600" />
        </div>
        <p className="text-sm text-slate-500">No scrim data found</p>
      </div>
    );
  }

  const intensityVariant = { High: "red", Medium: "yellow", Low: "default" };

  return (
    <div className="space-y-3">
      <div className="bg-purple-500/[0.06] border border-purple-500/15 rounded-xl px-3.5 py-2.5">
        <p className="text-xs text-purple-300 leading-relaxed">
          Direct scrim partners and their 2nd-degree connections — a 2-hop graph query.
        </p>
      </div>

      {scrims.directPartners.map((partner) => (
        <div key={partner.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/10 transition-colors">
          {/* Partner header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
              <p className="text-sm font-semibold text-white">{partner.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{partner.matchesPlayed} matches</span>
              <Tag text={partner.intensity} variant={intensityVariant[partner.intensity] || "default"} />
            </div>
          </div>

          {/* 2nd-degree */}
          {partner.secondDegree.length > 0 && (
            <div className="px-3.5 py-2.5 space-y-1.5">
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">2nd-degree</p>
              {partner.secondDegree.map((sd) => (
                <div key={sd.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-px h-3 bg-white/10 ml-0.5" />
                    <span className="text-xs text-slate-400">{sd.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-600">{sd.matchesPlayed} matches</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tournament detail ─────────────────────────────────────────────────────────

function TournamentDetail({ props }) {
  const tierVariant = { "S+": "yellow", S: "purple", A: "blue" };
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/15 rounded-xl p-4 text-center">
        <Trophy size={28} className="text-emerald-400 mx-auto mb-2" />
        <p className="text-lg font-esports font-bold text-white">{props?.name}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Tag text={`Tier ${props?.tier}`} variant={tierVariant[props?.tier] || "default"} />
          <Tag text={String(props?.year)} variant="default" />
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Prize Pool</p>
        <p className="text-2xl font-esports font-bold text-emerald-400">
          ${Number(props?.prizePool || 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ── GameRole detail ───────────────────────────────────────────────────────────

function GameRoleDetail({ props }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
        <Swords size={28} className="text-pink-400" />
      </div>
      <div className="text-center">
        <p className="text-xl font-esports font-bold text-white">{props?.title}</p>
        <p className="text-xs text-slate-500 mt-1">Specialist Role</p>
      </div>
    </div>
  );
}

// ── Main SidePanel ────────────────────────────────────────────────────────────

const labelMeta = {
  Player:     { icon: User,    color: "text-indigo-400",  accent: "#6366f1", label: "Player"     },
  Team:       { icon: Users,   color: "text-amber-400",   accent: "#f59e0b", label: "Team"       },
  Tournament: { icon: Trophy,  color: "text-emerald-400", accent: "#10b981", label: "Tournament" },
  GameRole:   { icon: Swords,  color: "text-pink-400",    accent: "#ec4899", label: "Role"       },
};

export function SidePanel({ selected, onClose }) {
  const [profile, setProfile] = useState(null);
  const [rivals,  setRivals]  = useState([]);
  const [scrims,  setScrims]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!selected) return;
    setProfile(null); setRivals([]); setScrims(null); setActiveTab("profile");

    const label = selected.labels?.[0] || selected.group;

    async function fetchData() {
      setLoading(true);
      try {
        if (label === "Player") {
          const [p, r] = await Promise.all([
            api.getPlayer(selected.props?.name || selected.label),
            api.getRivals(selected.props?.name || selected.label),
          ]);
          setProfile(p);
          setRivals(r);
        } else if (label === "Team") {
          setScrims(await api.getScrims(selected.props?.name || selected.label));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selected]);

  if (!selected) return null;

  const label = selected.labels?.[0] || selected.group;
  const name  = selected.props?.name || selected.props?.title || selected.label;
  const meta  = labelMeta[label] || labelMeta.Player;
  const Icon  = meta.icon;

  const tabs = label === "Player" ? ["profile", "rivals"] : null;

  return (
    <aside className="slide-in w-[320px] shrink-0 flex flex-col bg-[#080b18] border-l border-white/[0.07] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.06]">
        {/* Accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${meta.accent}80, transparent 60%)` }} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${meta.accent}18`, border: `1px solid ${meta.accent}30` }}>
              <Icon size={16} style={{ color: meta.accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: meta.accent }}>
                {meta.label}
              </p>
              <p className="text-base font-esports font-bold text-white truncate leading-tight">{name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white transition-all shrink-0 mt-0.5"
          >
            <X size={13} />
          </button>
        </div>

        {/* Tabs for Player */}
        {tabs && (
          <div className="flex gap-1 mt-4 bg-white/[0.03] rounded-lg p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-md transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <SidePanelSkeleton />
        ) : (
          <>
            {label === "Player" && profile && activeTab === "profile" && <PlayerProfile profile={profile} />}
            {label === "Player" && activeTab === "rivals" && <RivalsTab rivals={rivals} />}
            {label === "Team" && <ScrimPanel scrims={scrims} />}
            {label === "Tournament" && <TournamentDetail props={selected.props} />}
            {label === "GameRole" && <GameRoleDetail props={selected.props} />}
          </>
        )}
      </div>
    </aside>
  );
}
