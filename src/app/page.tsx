"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  Repeat,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Wrench,
  Cpu,
  Utensils,
  Dumbbell,
  BookOpen,
  Music,
  Bike,
  PlusCircle,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { ListingCard } from "@/components/listings/ListingCard";
import { CATEGORIES } from "@/lib/constants";
import { Category } from "@/types";

export default function HomePage() {
  const { listings } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [filterType, setFilterType] = useState<"all" | "free" | "top_rated">("all");
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<{ id: string; reason: string }[] | null>(null);

  const quickPrompts = [
    "Drill to hang shelves",
    "Projector for movie night",
    "Mixer grinder for food",
    "Badminton rackets",
    "Formal blazer",
  ];

  const handleAISearch = async (queryToRun?: string) => {
    const q = queryToRun || searchQuery;
    if (!q.trim()) {
      setAiSearchResults(null);
      return;
    }
    setIsSearchingAI(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, listings }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSearchResults(data.results || []);
      }
    } catch (e) {
      console.error("AI search failed:", e);
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Filter listings
  let displayedListings = listings;

  if (aiSearchResults !== null && aiSearchResults.length > 0) {
    const matchedIds = new Set(aiSearchResults.map((r) => r.id));
    displayedListings = listings.filter((l) => matchedIds.has(l.id));
  } else {
    if (selectedCategory !== "all") {
      displayedListings = displayedListings.filter((l) => l.category === selectedCategory);
    }
    if (filterType === "free") {
      displayedListings = displayedListings.filter((l) => l.price === 0);
    } else if (filterType === "top_rated") {
      displayedListings = displayedListings.filter((l) => l.userRating >= 4.8);
    }
  }

  const categoryIcons: Record<string, any> = {
    tools: Wrench,
    electronics: Cpu,
    kitchen: Utensils,
    sports: Dumbbell,
    books: BookOpen,
    musical_instruments: Music,
    vehicles: Bike,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-12 pb-16 border-b border-indigo-50">
        <div className="container relative z-10 max-w-5xl text-center">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-4 py-1.5 text-xs font-bold text-indigo-800 backdrop-blur-sm border border-indigo-200/60 mb-6 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Campus Resource Sharing • Free & Peer-to-Peer Lending</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            List what you don't use. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
              Borrow what you need.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Why buy a ₹3,000 power drill or a ₹15,000 projector for a 1-day need? Connect with
            verified campus peers, borrow nearby items, and build your community reputation score.
          </p>

          {/* AI-Powered Semantic Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center rounded-2xl border-2 border-indigo-200 bg-white p-2 shadow-floating focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) setAiSearchResults(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
                placeholder="Ask in plain English: 'tools to hang frames', 'projector for movie'..."
                className="w-full bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleAISearch()}
                disabled={isSearchingAI}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-indigo-700 hover:to-violet-800 active:scale-95 transition-all shrink-0"
              >
                {isSearchingAI ? (
                  <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>AI Search</span>
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-600 font-medium mr-1">Try:</span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(prompt);
                    handleAISearch(prompt);
                  }}
                  className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
              {aiSearchResults !== null && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAiSearchResults(null);
                  }}
                  className="text-xs text-rose-600 font-semibold underline ml-2"
                >
                  Clear AI filter
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/listings/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-card-hover hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post an Idle Item</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all"
            >
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span>Public Demand Calendar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="border-b bg-white py-4 shadow-xs">
        <div className="container overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setAiSearchResults(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === "all" && aiSearchResults === null
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Items ({listings.length})
            </button>
            {CATEGORIES.slice(0, 8).map((cat) => {
              const Icon = categoryIcons[cat.id] || Sparkles;
              const isSelected = selectedCategory === cat.id && aiSearchResults === null;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setAiSearchResults(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-amber-300" : "text-slate-500"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Listings Grid Section */}
      <section className="py-10 bg-slate-50/60 flex-1">
        <div className="container">
          {/* Header & Sub-filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {aiSearchResults !== null
                  ? `AI Search Results (${displayedListings.length})`
                  : selectedCategory === "all"
                  ? "Available Campus Gear"
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified student listings with instant borrow requests & condition check-in
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-xs">
              <button
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("free")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  filterType === "free" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Free Only
              </button>
              <button
                onClick={() => setFilterType("top_rated")}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  filterType === "top_rated" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ★ 4.8+ Lenders
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {displayedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedListings.map((listing) => {
                const matchInfo = aiSearchResults?.find((r) => r.id === listing.id);
                return (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    aiReason={matchInfo?.reason}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-bold text-slate-700">No matching items found</p>
              <p className="text-xs text-slate-500 mt-1">
                Post your need to the Public Demand Calendar so campus owners can reach out to you!
              </p>
              <Link
                href="/calendar"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Calendar className="h-4 w-4" />
                <span>Post in Demand Calendar</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How DemandLend Works */}
      <section className="py-14 bg-white border-t border-slate-100">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Campus Sharing Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered with OLX speed and built-in peer trust safeguards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Discover or Post</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Browse nearby items or use natural language AI search. Need something unlisted? Post on the Public Demand Calendar.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Chat & Document</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Coordinate pickup via built-in chat. Document item condition with before-and-after photos to guarantee peace of mind.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Return & Rate</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Automated return reminders keep everyone on schedule. Leave 1-5 star reviews to build your campus reputation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
