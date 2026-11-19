"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Search,
  Filter,
  User,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { CATEGORIES } from "@/lib/constants";
import { Category, CalendarDemand } from "@/types";
import { formatDate } from "@/lib/utils";

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { calendarDemands, addCalendarDemand, fulfillDemand, listings } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("tools");
  const [fromDate, setFromDate] = useState("2026-11-21");
  const [toDate, setToDate] = useState("2026-11-23");
  const [budgetPref, setBudgetPref] = useState<"free_only" | "up_to_amount" | "any">("free_only");
  const [maxBudget, setMaxBudget] = useState<number>(0);

  const [aiMatching, setAiMatching] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[] | null>(null);

  const openDemands = calendarDemands.filter((d) => d.status === "open");

  const handlePostDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please choose a user account or sign in first!");
      return;
    }
    if (!title.trim() || !description.trim()) return;

    addCalendarDemand({
      userId: user.uid,
      userName: user.displayName,
      title: title.trim(),
      description: description.trim(),
      category,
      neededFrom: new Date(fromDate).toISOString(),
      neededUntil: new Date(toDate).toISOString(),
      budgetPreference: budgetPref,
      maxBudget: budgetPref === "up_to_amount" ? Number(maxBudget) : null,
    });

    setModalOpen(false);
    setTitle("");
    setDescription("");
  };

  const handleRunAiMatching = async () => {
    setAiMatching(true);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demands: openDemands, listings }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiMatches(data.matches || []);
      }
    } catch (e) {
      console.error("AI matching failed:", e);
    } finally {
      setAiMatching(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-700 mb-2">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Public Campus Request Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Public Demand Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Need an item not currently listed? Post your need on the public calendar so owners can reach out!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunAiMatching}
            disabled={aiMatching}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2.5 text-xs font-bold text-indigo-700 shadow-xs transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{aiMatching ? "Matching..." : "AI Auto-Match"}</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-card-hover transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post a Need</span>
          </button>
        </div>
      </div>

      {/* AI Demand Matches Banner */}
      {aiMatches && aiMatches.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Gemini AI Found {aiMatches.length} Demand-Supply Matches!</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiMatches.map((m, i) => {
              const matchedListing = listings.find((l) => l.id === m.listingId);
              const matchedDemand = calendarDemands.find((d) => d.id === m.demandId);
              return (
                <div key={i} className="rounded-xl bg-white p-3 border border-indigo-100 text-xs space-y-1.5 shadow-xs">
                  <div className="font-bold text-slate-800">
                    Demand: &quot;{matchedDemand?.title}&quot;
                  </div>
                  <p className="text-slate-500 text-[11px]">{m.explanation}</p>
                  {matchedListing && (
                    <Link
                      href={`/listings/${matchedListing.id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-[11px] hover:underline pt-1"
                    >
                      <span>View item: {matchedListing.title}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Timeline List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Open Campus Requests ({openDemands.length})
        </h2>

        {openDemands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openDemands.map((demand) => {
              const isOwner = user?.uid === demand.userId;
              const categoryMeta = CATEGORIES.find((c) => c.id === demand.category);

              return (
                <div
                  key={demand.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-colors"
                >
                  <div>
                    {/* Top Metadata */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {categoryMeta?.label || demand.category}
                      </span>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        OPEN
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{demand.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {demand.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Needed: {formatDate(demand.neededFrom)} → {formatDate(demand.neededUntil)}
                      </span>
                      <span className="font-semibold text-slate-700">
                        Budget:{" "}
                        {demand.budgetPreference === "free_only"
                          ? "FREE ONLY"
                          : demand.budgetPreference === "up_to_amount"
                          ? `Up to ₹${demand.maxBudget}`
                          : "Any fair price"}
                      </span>
                    </div>
                  </div>

                  {/* Footer with requester & action */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                        {demand.userName.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-700 font-medium">{demand.userName}</span>
                    </div>

                    {!isOwner ? (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert("Please choose a user account or sign in first!");
                            return;
                          }
                          const chatId = fulfillDemand(demand);
                          if (chatId) {
                            router.push(`/chat/${chatId}`);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>I Can Fulfill This!</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">Your Need</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-bold text-slate-700">All campus needs have been fulfilled!</p>
            <p className="text-xs text-slate-500 mt-1">
              Have an urgent requirement? Click &quot;Post a Need&quot; above to list it on the calendar.
            </p>
          </div>
        )}
      </div>

      {/* Post Need Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-slate-900">Post Item Need to Calendar</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostDemand} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  What item do you need? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Camping Tent, Soldering Station, Convocation Blazer..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Details / Why you need it
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain requirements, event date, or preferred accessories..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Needed From
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Needed Until
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Budget Preference
                </label>
                <select
                  value={budgetPref}
                  onChange={(e) => setBudgetPref(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                >
                  <option value="free_only">Free Only</option>
                  <option value="up_to_amount">Willing to Pay Up to a Limit</option>
                  <option value="any">Any Fair Price</option>
                </select>
              </div>

              {budgetPref === "up_to_amount" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Max Daily Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Publish to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
