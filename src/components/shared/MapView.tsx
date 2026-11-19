"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, ExternalLink, Sparkles } from "lucide-react";
import { Listing } from "@/types";

interface MapViewProps {
  listings: Listing[];
  onSelectListing?: (listing: Listing) => void;
}

export function MapView({ listings, onSelectListing }: MapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(listings[0]?.id || null);
  const activeListing = listings.find((l) => l.id === selectedId) || listings[0];

  return (
    <div className="relative w-full h-[480px] rounded-2xl border border-slate-200 bg-slate-900/5 overflow-hidden flex flex-col md:flex-row shadow-sm">
      {/* Visual Campus Interactive Grid / Map Container */}
      <div className="relative flex-1 bg-gradient-to-br from-indigo-50 via-slate-100 to-emerald-50/40 p-4 overflow-hidden flex items-center justify-center">
        {/* Subtle grid pattern for campus zoning */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        {/* Campus Landmark zones indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
          <Navigation className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
          <span>Interactive Campus Radar Map</span>
        </div>

        {/* Central radius circle */}
        <div className="absolute h-80 w-80 rounded-full border border-indigo-200/60 bg-indigo-500/5 animate-pulse-subtle pointer-events-none" />
        <div className="absolute h-52 w-52 rounded-full border border-emerald-200/60 bg-emerald-500/5 pointer-events-none" />

        {/* Plot Listing Pins */}
        <div className="relative w-full h-full max-w-lg max-h-[360px]">
          {listings.slice(0, 8).map((listing, idx) => {
            // Distribute pins across the campus radar
            const angles = [30, 75, 120, 195, 240, 290, 340, 160];
            const radii = [30, 45, 38, 48, 35, 42, 28, 40];
            const angle = angles[idx % angles.length] * (Math.PI / 180);
            const radius = radii[idx % radii.length];
            const topPercent = 50 + radius * Math.sin(angle);
            const leftPercent = 50 + radius * Math.cos(angle);

            const isSelected = listing.id === selectedId;

            return (
              <button
                key={listing.id}
                onClick={() => {
                  setSelectedId(listing.id);
                  if (onSelectListing) onSelectListing(listing);
                }}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all shadow-md ${
                  isSelected
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110 z-30"
                    : "bg-white text-slate-800 border border-slate-200 hover:scale-105 hover:border-indigo-400"
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-amber-300" : "text-indigo-600"}`} />
                <span>{listing.price === 0 ? "FREE" : `₹${listing.price}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side preview drawer for selected item */}
      {activeListing && (
        <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-sm">
          <div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border">
              <img
                src={activeListing.images[0]}
                alt={activeListing.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-2 left-2 rounded-lg bg-slate-900/90 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-white">
                {activeListing.price === 0 ? "FREE" : `₹${activeListing.price}/day`}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                {activeListing.category}
              </span>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mt-0.5">
                {activeListing.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                {activeListing.description}
              </p>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800">{activeListing.location.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Lender:</span>
                <span className="font-semibold text-slate-800">
                  {activeListing.userName} (★ {activeListing.userRating.toFixed(1)})
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/listings/${activeListing.id}`}
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <span>View Full Details & Borrow</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
