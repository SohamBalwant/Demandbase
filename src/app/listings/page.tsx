"use client";

import React, { useState } from "react";
import { Search, Filter, Map, Grid, Sparkles, SlidersHorizontal } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { ListingCard } from "@/components/listings/ListingCard";
import { MapView } from "@/components/shared/MapView";
import { CATEGORIES, CONDITIONS } from "@/lib/constants";
import { Category, ItemCondition } from "@/types";

export default function BrowseListingsPage() {
  const { listings } = useData();
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | "all">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "under100" | "under300">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "price_asc" | "rating" | "newest">("distance");

  const filtered = listings.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (selectedCondition !== "all" && item.condition !== selectedCondition) return false;
    if (priceFilter === "free" && item.price !== 0) return false;
    if (priceFilter === "under100" && (item.price > 100 || item.price === 0)) return false;
    if (priceFilter === "under300" && item.price > 300) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "rating") return b.userRating - a.userRating;
    if (sortBy === "distance") return (a.distanceKm || 0) - (b.distanceKm || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="container py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Campus Resource Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and borrow {listings.length} verified physical items within walking distance
          </p>
        </div>

        {/* View mode toggle (Grid vs Map) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "grid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "map" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, keyword, or brand..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories ({listings.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price / Type Filter */}
        <div>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Items Only</option>
            <option value="under100">Budget (Under ₹100/day)</option>
            <option value="under300">Under ₹300/day</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500 pb-3">
        <span>
          Showing <strong className="text-slate-900">{sorted.length}</strong> items
        </span>

        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="distance">Nearest Distance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="rating">Lender Rating</option>
            <option value="newest">Recently Listed</option>
          </select>
        </div>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === "map" ? (
        <div className="mt-2">
          <MapView listings={sorted} />
        </div>
      ) : sorted.length > 0 ? (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sorted.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-bold text-slate-700">No listings match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the price or category filters.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setPriceFilter("all");
              setSelectedCondition("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
