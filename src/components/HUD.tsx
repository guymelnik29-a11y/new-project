// GTA-style In-Game HUD: Minimap, Speedometer, Money ticker, Mission tracker & Interaction prompt

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { GameEconomy, MISSIONS_CATALOG } from '../game/economy/GameEconomy';
import { SoundFX } from '../game/audio/SoundFX';
import { Radio, Smartphone, Map as MapIcon, Compass, Gauge, Zap } from 'lucide-react';

interface HUDProps {
  engine: GameEngine | null;
  onOpenPhone: () => void;
  onOpenMap: () => void;
}

export const HUD: React.FC<HUDProps> = ({ engine, onOpenPhone, onOpenMap }) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = useState(GameEconomy.getStats());
  const [speedKmH, setSpeedKmH] = useState(0);
  const [gear, setGear] = useState(1);
  const [nitro, setNitro] = useState(100);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [radioInfo, setRadioInfo] = useState(SoundFX.getRadioState());
  const [timeStr, setTimeStr] = useState('14:30');
  const [missionTimer, setMissionTimer] = useState(0);

  // Subscribe to economy changes
  useEffect(() => {
    const unsub = GameEconomy.subscribe(() => {
      setStats(GameEconomy.getStats());
      setMissionTimer(GameEconomy.missionRemainingTime);
    });
    return () => {
      unsub();
    };
  }, []);

  // Update loop for speedometer, minimap and prompt
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (engine) {
        setPrompt(engine.interactionPrompt);

        // Format time of day
        const hours = Math.floor(engine.timeOfDay);
        const mins = Math.floor((engine.timeOfDay % 1) * 60);
        setTimeStr(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);

        if (engine.isDriving && engine.activeVehicle) {
          setSpeedKmH(engine.activeVehicle.speedKmH);
          setGear(engine.activeVehicle.currentGear);
          setNitro(Math.round(engine.activeVehicle.nitroLevel));
        } else {
          setSpeedKmH(0);
        }

        // Draw 2D Minimap Radar
        drawMinimap();
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const drawMinimap = () => {
    const canvas = minimapCanvasRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 4;

    ctx.clearRect(0, 0, w, h);

    // Save for circular clipping mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Dark Map Background
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, w, h);

    const playerPos = engine.isDriving && engine.activeVehicle ? engine.activeVehicle.position : engine.player.position;
    const playerYaw = engine.isDriving && engine.activeVehicle ? engine.activeVehicle.rotation.y : engine.player.rotation.y;

    // Map Scale (1 world unit = 0.65 pixels)
    const scale = 0.65;

    ctx.save();
    // Rotate map around player direction (GTA style radar orientation)
    ctx.translate(cx, cy);
    ctx.rotate(playerYaw);
    ctx.translate(-playerPos.x * scale, -playerPos.z * scale);

    // 1. Draw Ocean
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(-600 * scale, 240 * scale, 1200 * scale, 400 * scale);

    // 2. Draw Central Park
    ctx.fillStyle = '#10ac84';
    ctx.fillRect(-140 * scale, -140 * scale, 160 * scale, 160 * scale);

    // 3. Draw Roads (Avenues & Streets)
    ctx.strokeStyle = '#576574';
    ctx.lineWidth = 14 * scale;

    const avenues = [-180, -90, 0, 90, 180];
    avenues.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x * scale, -240 * scale);
      ctx.lineTo(x * scale, 240 * scale);
      ctx.stroke();
    });

    const streets = [-180, -90, 0, 90, 180];
    streets.forEach(z => {
      ctx.beginPath();
      ctx.moveTo(-240 * scale, z * scale);
      ctx.lineTo(240 * scale, z * scale);
      ctx.stroke();
    });

    // Elevated Highway
    ctx.strokeStyle = '#ff9f43';
    ctx.lineWidth = 16 * scale;
    ctx.beginPath();
    ctx.moveTo(-230 * scale, -40 * scale);
    ctx.lineTo(230 * scale, -40 * scale);
    ctx.stroke();

    // 4. Draw Landmarks (Apartments, Dealership, Garage, Airport)
    engine.city.landmarks.forEach(lm => {
      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lm.position.x * scale, lm.position.z * scale, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 5. Draw Active Mission Waypoint (Flashing yellow/green)
    if (stats.activeMissionId) {
      const mission = MISSIONS_CATALOG.find(m => m.id === stats.activeMissionId);
      if (mission) {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(mission.targetPosition[0] * scale, mission.targetPosition[2] * scale, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.restore();

    // Draw Radar Border Ring
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Center Player Arrow Marker
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // North Compass indicator
    const northAngle = -playerYaw;
    const nx = cx + Math.sin(northAngle) * (radius - 12);
    const ny = cy - Math.cos(northAngle) * (radius - 12);
    ctx.fillStyle = '#00ffee';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
  };

  const handleNextRadio = () => {
    const current = radioInfo.station;
    const next = (current + 1) % 3;
    SoundFX.toggleRadio(next);
    setRadioInfo(SoundFX.getRadioState());
  };

  const activeMission = MISSIONS_CATALOG.find(m => m.id === stats.activeMissionId);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 overflow-hidden font-rajdhani">
      {/* TOP BAR: Money Counter, Level, Time & Quick App Buttons */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: District & Status */}
        <div className="flex flex-col space-y-1">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-2 flex items-center space-x-3 text-white shadow-lg">
            <span className="text-xl">🏙️</span>
            <div>
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                {stats.currentDistrict}
              </div>
              <div className="text-sm font-semibold text-gray-200">
                {stats.isInsideInterior ? 'Inside Property' : 'Open World'}
              </div>
            </div>
          </div>

          {/* Time & Weather */}
          <div className="bg-black/50 backdrop-blur-md rounded-md px-3 py-1 text-xs text-gray-300 font-mono w-max border border-white/10">
            🕒 {timeStr} | Level {stats.level}
          </div>
        </div>

        {/* Top Right: Money Display & Action Buttons */}
        <div className="flex flex-col items-end space-y-2">
          {/* Cash Balance Display */}
          <div className="bg-black/75 backdrop-blur-md border-2 border-emerald-500/60 rounded-xl px-5 py-2.5 flex items-center space-x-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-2xl font-bold text-emerald-400">$</span>
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {stats.money.toLocaleString()}
            </span>
          </div>

          {/* Top Control Buttons (Pointer-events enabled) */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            {/* Phone Button */}
            <button
              onClick={onOpenPhone}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2.5 rounded-lg border border-white/20 transition-transform active:scale-95 shadow-md flex items-center space-x-1.5 cursor-pointer"
              title="Smartphone (Tab)"
            >
              <Smartphone size={18} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Phone [Tab]</span>
            </button>

            {/* Map Button */}
            <button
              onClick={onOpenMap}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2.5 rounded-lg border border-white/20 transition-transform active:scale-95 shadow-md flex items-center space-x-1.5 cursor-pointer"
              title="Full Map (M)"
            >
              <MapIcon size={18} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Map [M]</span>
            </button>

            {/* Radio Station Switcher */}
            <button
              onClick={handleNextRadio}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2.5 rounded-lg border border-white/20 transition-transform active:scale-95 shadow-md flex items-center space-x-1.5 cursor-pointer"
              title="In-Game Radio (R)"
            >
              <Radio size={18} className={radioInfo.isPlaying ? "text-pink-500 animate-pulse" : "text-gray-400"} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {radioInfo.isPlaying ? radioInfo.stationName : 'Radio Off [R]'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER: Context Interaction Prompt */}
      {prompt && (
        <div className="self-center my-auto transition-all animate-bounce">
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-[0_0_25px_rgba(6,182,212,0.8)] border border-cyan-300 tracking-wide">
            {prompt}
          </div>
        </div>
      )}

      {/* ACTIVE MISSION TRACKER BANNER */}
      {activeMission && (
        <div className="self-start mb-2 bg-black/80 backdrop-blur-md border-l-4 border-amber-400 rounded-r-lg px-4 py-2.5 max-w-md shadow-xl text-white">
          <div className="text-xs uppercase text-amber-400 font-bold tracking-wider flex items-center justify-between">
            <span>CURRENT OBJECTIVE</span>
            <span className={`font-mono text-sm ${missionTimer <= 15 ? 'text-red-500 animate-pulse font-black' : 'text-gray-200'}`}>
              ⏱️ {missionTimer}s
            </span>
          </div>
          <div className="text-base font-bold text-white mt-0.5">{activeMission.title}</div>
          <div className="text-xs text-gray-300 mt-1">{activeMission.description}</div>
          <div className="text-xs text-emerald-400 font-bold mt-1">Reward: ${activeMission.reward.toLocaleString()}</div>
        </div>
      )}

      {/* BOTTOM BAR: GTA Minimap (Bottom-Left) & Speedometer (Bottom-Right) */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Minimap Radar */}
        <div className="relative">
          <canvas
            ref={minimapCanvasRef}
            width={180}
            height={180}
            className="rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)]"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-500/40 rounded-full px-3 py-0.5 text-[10px] text-cyan-300 uppercase tracking-widest font-mono">
            GPS RADAR
          </div>
        </div>

        {/* Bottom Right: Digital Speedometer (Shown when driving) */}
        {stats.isDriving ? (
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.7)] text-white w-44">
            <div className="text-5xl font-black font-mono tracking-tighter text-cyan-300">
              {Math.abs(speedKmH)}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400 font-bold -mt-1">
              KM / H
            </div>

            {/* Gear & RPM indicator */}
            <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-white/10 text-xs">
              <span className="text-gray-400">GEAR</span>
              <span className="font-bold font-mono text-amber-400 text-sm">
                {speedKmH < 0 ? 'R' : gear}
              </span>
            </div>

            {/* Nitro Gauge */}
            <div className="w-full mt-2">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                <span className="flex items-center space-x-1">
                  <Zap size={11} /> <span>NITRO [Shift]</span>
                </span>
                <span>{nitro}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100"
                  style={{ width: `${nitro}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Controls helper reminder when on foot */
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs text-gray-300 space-y-1">
            <div><span className="text-cyan-400 font-bold">WASD</span> : Move</div>
            <div><span className="text-cyan-400 font-bold">Shift</span> : Sprint</div>
            <div><span className="text-cyan-400 font-bold">Space</span> : Jump</div>
            <div><span className="text-cyan-400 font-bold">F</span> : Enter / Exit Vehicle</div>
            <div><span className="text-cyan-400 font-bold">E</span> : Interact</div>
          </div>
        )}
      </div>
    </div>
  );
};
