"use client";

import { useState, useMemo } from "react";
import { Level } from "./LevelList";

interface CompletedEntry {
  level: Level;
  role: "Verifier" | "Victor";
}

interface PlayerStats {
  username: string;
  points: number;
  hardest: Level | null;
  completions: CompletedEntry[];
}

export default function Leaderboard({ levels }: { levels: Level[] }) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  const players = useMemo(() => {
    const map = new Map<string, PlayerStats>();

    const awardLevel = (
      username: string,
      level: Level,
      points: number,
      role: "Verifier" | "Victor"
    ) => {
      const cleanName = username.trim();
      if (!cleanName) return;

      const existing = map.get(cleanName) || {
        username: cleanName,
        points: 0,
        hardest: null,
        completions: [],
      };

      // Prevent double points if verifier is also listed as a victor
      if (existing.completions.some((c) => c.level.id === level.id)) return;

      existing.points += points;
      existing.completions.push({ level, role });

      if (!existing.hardest || level.rank < existing.hardest.rank) {
        existing.hardest = level;
      }

      map.set(cleanName, existing);
    };

    levels.forEach((level) => {
      const levelPoints = Math.max(10, Math.round(1000 / level.rank));

      // Award points to Verifier
      if (level.verifier) {
        awardLevel(level.verifier, level, levelPoints, "Verifier");
      }

      // Award points to Victors
      (level.victors || []).forEach((victor) => {
        awardLevel(victor.username, level, levelPoints, "Victor");
      });
    });

    return Array.from(map.values()).sort((a, b) => b.points - a.points);
  }, [levels]);

  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <button
          key={player.username}
          onClick={() => setSelectedPlayer(player)}
          className="w-full text-left p-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex justify-between items-center transition text-white"
        >
          <div>
            <span className="text-neutral-400 font-mono mr-3">
              #{index + 1}
            </span>
            <span className="font-bold text-lg">{player.username}</span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">
            {player.points} pts
          </span>
        </button>
      ))}

      {/* PLAYER STATS MODAL */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl max-w-md w-full space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h2 className="text-2xl font-bold">{selectedPlayer.username}</h2>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-neutral-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Total Points</p>
                <p className="text-xl font-bold text-emerald-400">
                  {selectedPlayer.points}
                </p>
              </div>
              <div className="p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400">Levels Completed</p>
                <p className="text-xl font-bold">
                  {selectedPlayer.completions.length}
                </p>
              </div>
            </div>

            {selectedPlayer.hardest && (
              <div className="p-3 bg-neutral-800/60 border border-neutral-700 rounded-lg">
                <p className="text-xs text-neutral-400">Hardest Completion</p>
                <p className="font-bold text-amber-400">
                  #{selectedPlayer.hardest.rank} — {selectedPlayer.hardest.name}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-neutral-400 mb-2 font-semibold">
                Completed & Verified Levels
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {selectedPlayer.completions
                  .sort((a, b) => a.level.rank - b.level.rank)
                  .map(({ level, role }) => (
                    <div
                      key={level.id}
                      className="text-sm bg-neutral-800 px-3 py-2 rounded flex justify-between items-center"
                    >
                      <div>
                        <span>
                          #{level.rank} {level.name}
                        </span>
                        {role === "Verifier" && (
                          <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-900/70 text-purple-300 border border-purple-700">
                            Verifier
                          </span>
                        )}
                      </div>
                      <span className="text-neutral-400 font-mono text-xs">
                        {level.level_id || ""}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}