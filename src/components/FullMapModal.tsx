// Full City Map Modal (M Key / Map Icon)
// Shows complete 2D map with district zones and landmarks

import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { GameEconomy, MISSIONS_CATALOG } from '../game/economy/GameEconomy';
import { X, Navigation } from 'lucide-react';

interface FullMapModalProps {
  engine: GameEngine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FullMapModal: React.FC<FullMapModalProps> = ({ engine, isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stats = GameEconomy.getStats();

  useEffect(() => {
    if (!isOpen || !engine || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark Map Base
    ctx.fillStyle = '#141a21';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = 1.35; // world to canvas pixels

    // 1. Ocean (South & West)
    ctx.fillStyle = '#0984e3';
    ctx.fillRect(0, cy + 180 * scale, w, h - (cy + 180 * scale));

    // 2. Beach Strip
    ctx.fillStyle = '#f5cd79';
    ctx.fillRect(0, cy + 150 * scale, w, 30 * scale);

    // 3. Central Park & Grass
    ctx.fillStyle = '#10ac84';
    ctx.fillRect(cx - 140 * scale, cy - 140 * scale, 160 * scale, 160 * scale);

    // Park Lake
    ctx.fillStyle = '#00cec9';
    ctx.beginPath();
    ctx.arc(cx - 60 * scale, cy - 60 * scale, 35 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 4. Roads (North-South Avenues & East-West Streets)
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 14 * scale;

    const avenues = [-180, -90, 0, 90, 180];
    avenues.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(cx + x * scale, 30);
      ctx.lineTo(cx + x * scale, h - 30);
      ctx.stroke();
    });

    const streets = [-180, -90, 0, 90, 180];
    streets.forEach(z => {
      ctx.beginPath();
      ctx.moveTo(30, cy + z * scale);
      ctx.lineTo(w - 30, cy + z * scale);
      ctx.stroke();
    });

    // Elevated Highway
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 16 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 230 * scale, cy - 40 * scale);
    ctx.lineTo(cx + 230 * scale, cy - 40 * scale);
    ctx.stroke();

    // 5. District Labels
    ctx.font = 'bold 14px Chakra Petch, sans-serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.textAlign = 'center';

    ctx.fillText('DOWNTOWN FINANCIAL', cx + 70 * scale, cy - 60 * scale);
    ctx.fillText('SOUTH BEACH & RESIDENTIAL', cx - 110 * scale, cy + 130 * scale);
    ctx.fillText('SUNSET HILLS MANSIONS', cx + 160 * scale, cy + 110 * scale);
    ctx.fillText('INTERNATIONAL AIRPORT', cx + 180 * scale, cy - 80 * scale);
    ctx.fillText('CENTRAL PARK', cx - 60 * scale, cy - 30 * scale);

    // 6. Draw City Landmarks
    engine.city.landmarks.forEach(lm => {
      const lx = cx + lm.position.x * scale;
      const lz = cy + lm.position.z * scale;

      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lx, lz, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(lm.name, lx, lz - 11);
    });

    // 7. Active Mission Waypoint
    if (stats.activeMissionId) {
      const m = MISSIONS_CATALOG.find(mi => mi.id === stats.activeMissionId);
      if (m) {
        const mx = cx + m.targetPosition[0] * scale;
        const mz = cy + m.targetPosition[2] * scale;
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(mx, mz, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('★ MISSION TARGET', mx, mz + 22);
      }
    }

    // 8. Draw Player Marker
    const playerPos = engine.isDriving && engine.activeVehicle ? engine.activeVehicle.position : engine.player.position;
    const playerYaw = engine.isDriving && engine.activeVehicle ? engine.activeVehicle.rotation.y : engine.player.rotation.y;

    const px = cx + playerPos.x * scale;
    const pz = cy + playerPos.z * scale;

    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(playerYaw);
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 10);
    ctx.lineTo(0, 4);
    ctx.lineTo(-9, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#ff4757';
    ctx.fillText('YOU', px, pz + 20);
  }, [isOpen, engine, stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 font-rajdhani">
      <div className="bg-zinc-950 border border-cyan-500/50 rounded-3xl w-full max-w-4xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white relative flex flex-col items-center">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400">
              <Navigation size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wide">CITY MAP & GPS NAVIGATION</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">
                CITY LIFE – עיר בלי גבולות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* 2D Canvas Map */}
        <div className="relative border-2 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} width={800} height={520} className="w-full max-h-[65vh] object-contain" />
        </div>

        {/* Map Legend */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-300 mt-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>You</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Apartments</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Dealership</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Missions</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span>Tuning Garage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
