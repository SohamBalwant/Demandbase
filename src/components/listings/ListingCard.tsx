"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Star, Clock, Sparkles } from "lucide-react";
import { Listing } from "@/types";
import { CONDITIONS } from "@/lib/constants";
import { formatCurrency, formatDate, formatShortDateTime } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

interface ListingCardProps {
  listing: Listing;
  aiReason?: string;
}

export function ListingCard({ listing, aiReason }: ListingCardProps) {
  const { getListingAvailability } = useData();
  const availability = getListingAvailability(listing.id);
  const conditionMeta = CONDITIONS.find((c) => c.id === listing.condition);
  const isFree = listing.price === 0;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-card hover:shadow-card-hover hover:border-indigo-200 transition-all duration-300 overflow-hidden active:scale-[0.99]"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={listing.images[0] || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80"}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
          {isFree ? (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-black tracking-wide text-white shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-300" />
              FREE
            </span>
          ) : (
            <span className="rounded-lg bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              ₹{listing.price}
              <span className="text-[10px] font-normal text-slate-300">/day</span>
            </span>
          )}

          {listing.groupId && (
            <span className="rounded-lg bg-violet-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
              Hostel Circle
            </span>
          )}
        </div>

        {/* Condition Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md shadow-xs ${
              conditionMeta?.badgeClass || "bg-white/90 text-slate-700 border-slate-200"
            }`}
          >
            {conditionMeta?.label || listing.condition}
          </span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-xs">
            <MapPin className="h-3 w-3 text-indigo-600" />
            {listing.distanceKm !== undefined ? `${listing.distanceKm} km away` : "Nearby"}
          </span>
        </div>

        {/* Dynamic Status Badge (e.g. 🟡 In Use · Available Nov 22, 6:00 PM) */}
        {availability?.isCurrentlyLent && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="flex items-center gap-1 rounded-md bg-amber-500/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              In Use · Available {formatShortDateTime(availability.nextAvailableDate)}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Availability Banner under image */}
        {availability?.isCurrentlyLent ? (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200/80 px-2 py-1 text-[11px] text-amber-900">
            <span className="flex items-center gap-1.5 font-medium truncate max-w-[140px]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
              With {availability.activeBorrowerName?.split(" ")[0]}
            </span>
            <span className="font-bold text-amber-800 text-[10px]">
              Free {formatShortDateTime(availability.nextAvailableDate)}
            </span>
          </div>
        ) : (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Ready for instant pickup</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>

        {/* AI Reason callout if search matched */}
        {aiReason && (
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 p-1.5 text-[11px] text-indigo-700 font-medium">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-500 mt-0.5" />
            <span className="line-clamp-1">{aiReason}</span>
          </div>
        )}

        {/* Security deposit & Handoff metadata */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {listing.securityDeposit > 0 ? (
              <span>Escrow: ₹{listing.securityDeposit}</span>
            ) : (
              <span className="text-emerald-700 font-medium">Zero Deposit</span>
            )}
          </span>

          <span className="capitalize text-slate-400">
            {listing.paymentMethod.toUpperCase()}
          </span>
        </div>

        {/* Lister Profile Footer */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <img
              src={listing.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.userName}`}
              alt={listing.userName}
              className="h-6 w-6 rounded-full object-cover bg-slate-100 border"
            />
            <span className="text-xs font-medium text-slate-700 max-w-[110px] truncate">
              {listing.userName}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{listing.userRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
