import React, { useState } from 'react';
import {
  Disc,
  Radio,
  Shield,
  Zap,
  Sparkles,
  Layers,
  Rocket,
  Compass,
  History,
  CheckCircle2,
  Atom,
  Globe,
} from 'lucide-react';
import { sound } from '../../sound';
import {
  STARGATE_NETWORK,
  StargateAddress,
} from '../../stargateData';
import { PlayerResources, PlayerProfile } from '../../types';
import { StargateDialerPanel } from './stargate/StargateDialerPanel';
import { StargateAddressDirectory } from './stargate/StargateAddressDirectory';
import { SubspaceJumpGatePanel } from './stargate/SubspaceJumpGatePanel';
import { SupergateCrystalsPanel } from './stargate/SupergateCrystalsPanel';
import { StargateNpcRacesView } from './StargateNpcRacesView';
import { GateTokensSystemView } from './stargate/GateTokensSystemView';

interface StargateNetworkViewProps {
  resources: PlayerResources;
  onUpdateResources: (res: Partial<PlayerResources>) => void;
  profile?: PlayerProfile;
  onUpdateProfile?: (updates: Partial<PlayerProfile>) => void;
  onNavigate?: (route: string) => void;
}

type TabType =
  | 'stargate-dhd'
  | 'address-directory'
  | 'jump-gates'
  | 'supergate-crystals'
  | 'alien-races'
  | 'gate-tokens';

export const StargateNetworkView: React.FC<StargateNetworkViewProps> = ({
  resources,
  onUpdateResources,
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  const [gates, setGates] = useState<StargateAddress[]>(STARGATE_NETWORK);
  const [selectedGateId, setSelectedGateId] = useState<string>('sg_atlantis');
  const [activeWormhole, setActiveWormhole] = useState<string | null>('sg_atlantis');
  const [irisClosed, setIrisClosed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('stargate-dhd');
  const [feedback, setFeedback] = useState<string | null>(
    'Aetherion transit network online: relay handshake established with the Lysara Reach.'
  );
  const [logs, setLogs] = useState<string[]>([
    'Subspace event horizon stabilized between Solari Prime and the Lysara Reach.',
    'Jump-gate relay capacitors synchronized across four orbital stations.',
  ]);

  const activeGate = gates.find((g) => g.id === selectedGateId) || gates[0];

  const handleLogDebrief = (message: string) => {
    setFeedback(message);
    setLogs((prev) => [message, ...prev.slice(0, 7)]);
  };

  const handleEstablishWormhole = (target: StargateAddress) => {
    setActiveWormhole(target.id);
    setSelectedGateId(target.id);
    setGates((prev) =>
      prev.map((g) =>
        g.id === target.id
          ? { ...g, status: 'connected' }
          : g.status === 'connected'
          ? { ...g, status: 'offline' }
          : g
      )
    );
    handleLogDebrief(`Wormhole established with ${target.name}! Event horizon open and stable.`);
  };

  const handleDisconnectWormhole = () => {
    setActiveWormhole(null);
    setGates((prev) => prev.map((g) => ({ ...g, status: 'offline' })));
    handleLogDebrief('Transit shield closed. Event horizon collapsed. Wormhole safely disengaged.');
  };

  const handleToggleIris = () => {
    setIrisClosed((prev) => {
      const next = !prev;
      handleLogDebrief(
        next
          ? 'Transit shield closed! Incoming matter and energy signatures will be blocked at the event horizon.'
          : 'Transit shield opened! Event horizon clear for interstellar travel and incoming personnel.'
      );
      return next;
    });
  };

  return (
    <div id="stargate-network-view" className="space-y-6 text-slate-100">
      {/* Aetherion transit command header */}
      <div className="relative overflow-hidden border border-cyan-900/70 bg-slate-950 p-5 md:p-7 shadow-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 78% 45%, rgba(34,211,238,.28), transparent 28%), linear-gradient(115deg, transparent 30%, rgba(30,64,175,.18), transparent 70%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="text-[10px] font-bold text-cyan-300 tracking-[2.5px] uppercase mb-2 font-mono">AETHERION TRANSIT COMMAND // RELAY CONTROL</div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex flex-wrap items-center gap-3">
              <span>Stargate & Jump Gate Network</span>
              <span className={`text-xs px-2.5 py-0.5 font-mono uppercase font-bold border ${activeWormhole ? "bg-cyan-300/10 text-cyan-200 border-cyan-400/50" : "bg-slate-800 text-slate-400 border-slate-600"}`}>
                {activeWormhole ? "EVENT HORIZON ACTIVE" : "NETWORK IDLE"}
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">Select a destination, align the glyph sequence, and open a stabilized transit corridor. Manage the dialing interface, relay network, shielding, and exotic-energy upgrades from one command console.</p>
          </div>
          <div className="relative mx-auto md:mx-0 w-40 h-40 shrink-0" role="img" aria-label="Holographic transit dial with nine illuminated glyph nodes">
            <div className="absolute inset-2 rounded-full border border-cyan-400/50 shadow-[0_0_35px_rgba(34,211,238,0.18)]" />
            <div className="absolute inset-5 rounded-full border border-blue-400/40 rotate-12" />
            <div className="absolute inset-8 rounded-full border border-cyan-300/40 -rotate-12" />
            <div className="absolute inset-[3.7rem] rounded-full bg-cyan-400/10 border border-cyan-200/60 flex items-center justify-center"><span className="text-[10px] text-cyan-200 font-mono tracking-widest">A-09</span></div>
            {Array.from({ length: 9 }, (_, i) => {
              const angle = (i * 40 - 90) * (Math.PI / 180);
              const active = activeWormhole !== null && i < 7;
              return <span key={i} className={`absolute w-3 h-3 rounded-full border ${active ? "bg-cyan-300 border-white shadow-[0_0_12px_rgba(103,232,249,0.9)]" : "bg-slate-800 border-cyan-700"}`} style={{ left: `calc(50% + ${Math.cos(angle) * 66}px - 6px)`, top: `calc(50% + ${Math.sin(angle) * 66}px - 6px)` }} />;
            })}
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-900/80 border border-slate-700"><span className="text-[9px] text-slate-400 uppercase block font-bold">Wormhole Status</span><strong className={`text-xs font-bold block ${activeWormhole ? "text-cyan-300" : "text-slate-500"}`}>{activeWormhole ? "CONNECTED" : "DISCONNECTED"}</strong></div>
          <div className="p-3 bg-slate-900/80 border border-slate-700"><span className="text-[9px] text-slate-400 uppercase block font-bold">Transit Shield</span><strong className={`text-xs font-bold block ${irisClosed ? "text-amber-300" : "text-emerald-300"}`}>{irisClosed ? "SHIELD CLOSED" : "SHIELD OPEN"}</strong></div>
          <div className="p-3 bg-slate-900/80 border border-slate-700"><span className="text-[9px] text-slate-400 uppercase block font-bold">Selected Destination</span><strong className="text-xs font-bold block text-cyan-100">{activeGate?.name ?? "No destination selected"}</strong></div>
        </div>
      </div>
      {/* Live Feedback & Alert Notification */}
      {feedback && (
        <div
          id="stargate-feedback-banner"
          className="p-3.5 bg-slate-900 border border-cyan-900 border-l-4 border-l-cyan-400 text-xs font-mono font-semibold flex justify-between items-center shadow-sm"
        >
          <div className="flex items-center gap-2 text-slate-100">
            <Radio size={14} className="text-sky-600 animate-pulse shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs text-[#777777] hover:text-[#111111] font-bold cursor-pointer ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#dedede] pb-3">
        {[
          {
            id: 'stargate-dhd',
            label: '1. Transit Dial Console',
            icon: Disc,
          },
          {
            id: 'address-directory',
            label: '2. Destination Registry',
            icon: Compass,
          },
          {
            id: 'jump-gates',
            label: '3. Jump Gate Relays',
            icon: Rocket,
          },
          {
            id: 'supergate-crystals',
            label: '4. Exotic Energy Matrix',
            icon: Atom,
          },
          {
            id: 'alien-races',
            label: '5. Alien Civilization Dossier',
            icon: Globe,
          },
          {
            id: 'gate-tokens',
            label: '6. Transit Tokens & Anomalies',
            icon: Sparkles,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              onClick={() => {
                sound.play('click');
                setActiveTab(tab.id as TabType);
              }}
              className={`py-2 px-3.5 text-xs font-bold uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-cyan-300 text-slate-950 border-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-cyan-400 hover:text-cyan-100'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-slate-950' : 'text-cyan-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Stargate & DHD Dialer Console */}
      {activeTab === 'stargate-dhd' && (
        <StargateDialerPanel
          activeGate={activeGate}
          activeWormhole={activeWormhole}
          irisClosed={irisClosed}
          onToggleIris={handleToggleIris}
          onEstablishWormhole={handleEstablishWormhole}
          onDisconnectWormhole={handleDisconnectWormhole}
          resources={resources}
        />
      )}

      {/* Tab 2: Stargate Address Directory & SG Teams */}
      {activeTab === 'address-directory' && (
        <StargateAddressDirectory
          gates={gates}
          selectedGateId={selectedGateId}
          onSelectGate={(gate) => {
            setSelectedGateId(gate.id);
            setActiveTab('stargate-dhd');
          }}
          activeWormhole={activeWormhole}
          resources={resources}
          onUpdateResources={onUpdateResources}
          onLogDebrief={handleLogDebrief}
          onIncrementStargateCount={() => {
            // increment career stats if applicable
            if (profile && onUpdateProfile) {
              onUpdateProfile({});
            }
          }}
        />
      )}

      {/* Tab 3: Subspace Jump Gate Network (Fleet Relays) */}
      {activeTab === 'jump-gates' && (
        <SubspaceJumpGatePanel
          resources={resources}
          onUpdateResources={onUpdateResources}
          onLogDebrief={handleLogDebrief}
        />
      )}

      {/* Tab 4: Ori Supergate & Ancient Crystals */}
      {activeTab === 'supergate-crystals' && (
        <SupergateCrystalsPanel
          resources={resources}
          onUpdateResources={onUpdateResources}
          onLogDebrief={handleLogDebrief}
        />
      )}

      {/* Tab 5: 18 Stargate Alien Races Dossier */}
      {activeTab === 'alien-races' && (
        <StargateNpcRacesView
          playerProfile={profile || {
            id: 'p1',
            username: 'Commander',
            displayName: 'Commander',
            race: 'tauri',
            governmentId: 'sgc_treaty',
            rankName: 'Major General',
            rankLevel: 5,
            glory: 1000,
            reputation: 1000,
            defconLevel: 2,
            vacationUntil: null,
            ascended: false,
            lastTurnAt: new Date().toISOString(),
          }}
          resources={resources}
          onNavigate={onNavigate}
        />
      )}

      {/* Tab 6: Gate Tokens, Anomalies & Raids */}
      {activeTab === 'gate-tokens' && (
        <GateTokensSystemView
          resources={resources}
          onUpdateResources={onUpdateResources}
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          onNavigate={onNavigate}
        />
      )}

      {/* Bottom Subspace Telemetry Transit Logs */}
      <div className="border border-[#dedede] bg-white p-5 space-y-2">
        <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
          <div className="flex items-center gap-2">
            <History size={14} className="text-[#555555]" />
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider font-mono">
              Galactic Gate Network Transit Telemetry Logs
            </h4>
          </div>
          <span className="text-[10px] text-[#777777] font-mono">Real-time Subspace Feed</span>
        </div>

        <div className="space-y-1 font-mono text-xs text-[#555555]">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 py-0.5">
              <span className="text-[10px] text-[#999999] shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[#333333]">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
