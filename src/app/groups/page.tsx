"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, PlusCircle, KeyRound, Building, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function GroupsPage() {
  const { user } = useAuth();
  const { groups, createGroup, joinGroup } = useData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [groupType, setGroupType] = useState<"building" | "hostel" | "community" | "custom">("hostel");

  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinResult, setJoinResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) return;

    createGroup({
      name: name.trim(),
      description: description.trim(),
      type: groupType,
      adminId: user.uid,
      adminName: user.displayName,
      location: location.trim() || "Campus Precinct",
    });

    setCreateModalOpen(false);
    setName("");
    setDescription("");
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinGroup(joinCodeInput.trim());
    setJoinResult(res);
    if (res.success) {
      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinResult(null);
        setJoinCodeInput("");
      }, 1500);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <Users className="h-3.5 w-3.5" />
            <span>Campus Community Circles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Private Groups & Hostels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Share high-trust resources exclusively with your building residents or department club
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <KeyRound className="h-4 w-4 text-indigo-600" />
            <span>Join via Code</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Circle</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {groups.map((group) => {
          const isMember = user ? group.members.includes(user.uid) : false;

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {group.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.memberCount} Members
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2">{group.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {group.description}
                </p>

                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 flex items-center justify-between">
                  <span>Location: <strong>{group.location}</strong></span>
                  <span className="text-[11px] text-slate-400">Admin: {group.adminName}</span>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <div className="text-[11px]">
                  <span className="text-slate-400">Code: </span>
                  <code className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {group.joinCode}
                  </code>
                </div>

                {isMember ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Joined
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      joinGroup(group.joinCode);
                      alert(`Joined ${group.name}!`);
                    }}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-xs font-bold"
                  >
                    Join Circle
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Campus Community Circle</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Circle Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Hostel 4 Techies, Mechanical Block Club..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="hostel">Hostel Residence</option>
                  <option value="building">Department / Building</option>
                  <option value="community">Campus Club / Society</option>
                  <option value="custom">General Community</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What items or projects are shared in this circle?"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Location / Zone
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g. Hostel Zone East"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join via Code Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-slate-900">Join Circle via Code</h3>
            <p className="text-xs text-slate-500">
              Enter the 6-character alphanumeric code provided by your hostel or group admin.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="E.g. H4H5CAMP"
                  className="w-full rounded-xl border-2 border-indigo-200 p-3 text-center text-sm font-mono font-bold tracking-widest text-indigo-700 uppercase focus:outline-none focus:border-indigo-600"
                />
              </div>

              {joinResult && (
                <div
                  className={`rounded-xl p-2.5 text-xs text-center font-medium ${
                    joinResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {joinResult.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Verify & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
