"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Victor {
  username: string;
  video_url?: string;
}

export interface Level {
  id: string;
  name: string;
  creator: string;
  verifier?: string;
  rank: number;
  level_id?: string;
  victors?: Victor[];
}

export default function LevelList({
  initialLevels,
  isAdmin,
}: {
  initialLevels: Level[];
  isAdmin: boolean;
}) {
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [newVictorName, setNewVictorName] = useState("");
  const [newVictorVideo, setNewVictorVideo] = useState("");

  // DELETE LEVEL
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level?")) return;

    const { error } = await supabase.from("levels").delete().eq("id", id);
    if (error) {
      alert("Error deleting level: " + error.message);
    } else {
      setLevels(levels.filter((lvl) => lvl.id !== id));
    }
  };

  // SAVE EDITED LEVEL
  const handleSaveEdit = async () => {
    if (!editingLevel) return;

    const { error } = await supabase
      .from("levels")
      .update({
        name: editingLevel.name,
        creator: editingLevel.creator,
        verifier: editingLevel.verifier || "",
        rank: editingLevel.rank,
        level_id: editingLevel.level_id || "",
        victors: editingLevel.victors || [],
      })
      .eq("id", editingLevel.id);

    if (error) {
      alert("Error updating level: " + error.message);
    } else {
      setLevels(
        levels
          .map((lvl) => (lvl.id === editingLevel.id ? editingLevel : lvl))
          .sort((a, b) => a.rank - b.rank)
      );
      setEditingLevel(null);
    }
  };

  // ADD VICTOR IN MODAL
  const addVictorToDraft = () => {
    if (!editingLevel || !newVictorName.trim()) return;
    const updatedVictors = [
      ...(editingLevel.victors || []),
      { username: newVictorName.trim(), video_url: newVictorVideo.trim() },
    ];
    setEditingLevel({ ...editingLevel, victors: updatedVictors });
    setNewVictorName("");
    setNewVictorVideo("");
  };

  // REMOVE VICTOR IN MODAL
  const removeVictorFromDraft = (index: number) => {
    if (!editingLevel) return;
    const updatedVictors = (editingLevel.victors || []).filter(
      (_, i) => i !== index
    );
    setEditingLevel({ ...editingLevel, victors: updatedVictors });
  };

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <div
          key={level.id}
          className="p-4 border border-neutral-800 rounded-lg bg-neutral-900 flex justify-between items-start gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              #{level.rank} — {level.name}
            </h3>
            <p className="text-sm text-neutral-400">
              Creator: <span className="text-neutral-200">{level.creator}</span>{" "}
              • Verifier:{" "}
              <span className="text-neutral-200">
                {level.verifier || "N/A"}
              </span>{" "}
              • ID:{" "}
              <span className="font-mono text-neutral-300">
                {level.level_id || "N/A"}
              </span>
            </p>

            {/* Victors List */}
            {level.victors && level.victors.length > 0 && (
              <div className="pt-1 text-sm text-neutral-300">
                <span className="text-neutral-400 font-semibold">Victors: </span>
                {level.victors.map((v, idx) => (
                  <span key={idx}>
                    {v.video_url ? (
                      <a
                        href={v.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {v.username}
                      </a>
                    ) : (
                      <span>{v.username}</span>
                    )}
                    {idx < level.victors!.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setEditingLevel(level)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-sm font-medium transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(level.id)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {/* EDIT LEVEL MODAL */}
      {editingLevel && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl max-w-md w-full space-y-4 text-white">
            <h2 className="text-xl font-bold">Edit Level</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400">Level Name</label>
                <input
                  className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
                  value={editingLevel.name}
                  onChange={(e) =>
                    setEditingLevel({ ...editingLevel, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400">Creator</label>
                  <input
                    className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
                    value={editingLevel.creator}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        creator: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Verifier</label>
                  <input
                    className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
                    placeholder="Verifier name"
                    value={editingLevel.verifier || ""}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        verifier: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400">Rank</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
                    value={editingLevel.rank}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        rank: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Level ID</label>
                  <input
                    className="w-full p-2 rounded bg-neutral-800 border border-neutral-700"
                    placeholder="e.g. 94821044"
                    value={editingLevel.level_id || ""}
                    onChange={(e) =>
                      setEditingLevel({
                        ...editingLevel,
                        level_id: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Manage Victors */}
            <div className="border-t border-neutral-800 pt-3 space-y-2">
              <label className="text-xs font-semibold text-neutral-300">
                Victors
              </label>
              <div className="flex gap-2">
                <input
                  placeholder="Username"
                  className="w-1/2 p-2 text-sm rounded bg-neutral-800 border border-neutral-700"
                  value={newVictorName}
                  onChange={(e) => setNewVictorName(e.target.value)}
                />
                <input
                  placeholder="Proof URL (optional)"
                  className="w-1/2 p-2 text-sm rounded bg-neutral-800 border border-neutral-700"
                  value={newVictorVideo}
                  onChange={(e) => setNewVictorVideo(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addVictorToDraft}
                  className="px-3 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
                >
                  +
                </button>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {(editingLevel.victors || []).map((v, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-neutral-800 px-2.5 py-1.5 rounded"
                  >
                    <span>{v.username}</span>
                    <button
                      onClick={() => removeVictorFromDraft(i)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingLevel(null)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}