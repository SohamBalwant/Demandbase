"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Camera,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { CONDITIONS, HANDOFF_METHODS } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime, formatShortDateTime } from "@/lib/utils";

const HOUR_OPTIONS = [
  { value: "08:00", label: "08:00 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM (Noon)" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getListingById, createRequest, getListingAvailability, checkAvailabilityConflict } = useData();

  const listingId = params?.id as string;
  const listing = getListingById(listingId);
  const availability = listing ? getListingAvailability(listing.id) : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("2026-11-21");
  const [fromTime, setFromTime] = useState("10:00");
  const [toDate, setToDate] = useState("2026-11-25");
  const [toTime, setToTime] = useState("18:00");
  const [requestMessage, setRequestMessage] = useState(
    "Hi! I'd love to borrow this item for the selected dates. I'll take great care of it!"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If item is currently lent, default the modal's min selectable start date to the next available date
  const minStartDate = availability?.nextAvailableDate
    ? availability.nextAvailableDate.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  // Full ISO datetime strings
  const requestedFromISO = `${fromDate}T${fromTime}:00`;
  const requestedToISO = `${toDate}T${toTime}:00`;

  // Real-time date range overlap check
  const conflict = listing
    ? checkAvailabilityConflict(listing.id, requestedFromISO, requestedToISO)
    : { hasConflict: false };

  // 1-Click Auto-Adjust Handler
  const handleAutoAdjust = () => {
    if (!conflict.suggestedFromDate) return;
    const d = new Date(conflict.suggestedFromDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    setFromDate(`${year}-${month}-${day}`);
    setFromTime(`${hours}:00`);

    // Ensure toDate is at least after fromDate
    const currentTo = new Date(`${toDate}T${toTime}:00`);
    if (currentTo <= d) {
      const nextDay = new Date(d.getTime() + 2 * 24 * 60 * 60 * 1000);
      const nYear = nextDay.getFullYear();
      const nMonth = String(nextDay.getMonth() + 1).padStart(2, "0");
      const nDay = String(nextDay.getDate()).padStart(2, "0");
      setToDate(`${nYear}-${nMonth}-${nDay}`);
      setToTime("18:00");
    }
  };

  if (!listing) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Listing not found</h2>
        <p className="text-xs text-slate-500 mt-1">This item might have been closed or removed.</p>
        <Link
          href="/listings"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }

  const conditionMeta = CONDITIONS.find((c) => c.id === listing.condition);
  const handoffMeta = HANDOFF_METHODS.find((h) => h.id === listing.handoffMethod);
  const isOwner = user?.uid === listing.userId;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or choose an account first!");
      return;
    }
    if (isOwner) {
      alert("You cannot borrow your own listed item!");
      return;
    }

    if (conflict.hasConflict) {
      alert("Please resolve the scheduling conflict before submitting your request.");
      return;
    }

    const startDateTime = new Date(`${fromDate}T${fromTime}:00`);
    const endDateTime = new Date(`${toDate}T${toTime}:00`);

    if (endDateTime <= startDateTime) {
      alert("Return date & time must be after the pickup date & time.");
      return;
    }

    setIsSubmitting(true);
    const req = createRequest({
      listingId: listing.id,
      borrowDates: {
        from: startDateTime.toISOString(),
        to: endDateTime.toISOString(),
      },
      message: requestMessage.trim(),
    });

    setIsSubmitting(false);
    setIsModalOpen(false);

    if (req) {
      router.push(`/chat/${req.chatId}`);
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      {/* Back button */}
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              {listing.price === 0 ? (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  FREE TO BORROW
                </span>
              ) : (
                <span className="rounded-xl bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-sm font-bold text-white shadow-md">
                  ₹{listing.price}
                  <span className="text-xs font-normal text-slate-300"> / day</span>
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Dynamic Status Badge on Photo */}
              {availability?.isCurrentlyLent && (
                <span className="flex items-center gap-1.5 rounded-xl bg-amber-500/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md">
                  <Clock className="h-3.5 w-3.5" />
                  In Use · Available {formatShortDateTime(availability.nextAvailableDate)}
                </span>
              )}

              <span
                className={`rounded-xl border px-3 py-1 text-xs font-bold backdrop-blur-md shadow-xs ${
                  conditionMeta?.badgeClass || "bg-white text-slate-800"
                }`}
              >
                {conditionMeta?.label || listing.condition}
              </span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <span>{listing.category}</span>
              <span>•</span>
              <span className="capitalize">{listing.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {listing.title}
            </h1>

            {/* Transparency Banner on the Item Page */}
            {availability?.isCurrentlyLent ? (
              <div className="mt-3.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      Currently with {availability.activeBorrowerName} until {formatDateTime(availability.currentReturnDate)}.
                    </span>
                    <p className="text-amber-800 mt-0.5">
                      Next available slot starts <strong>{formatDateTime(availability.nextAvailableDate)}</strong> (includes {availability.bufferHours}h owner inspection buffer).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Available for immediate booking · Owner turnaround buffer: {availability?.bufferHours || 2}h</span>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-600" />
                {listing.location.address} ({listing.distanceKm || 0.4} km)
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Listed {formatDate(listing.createdAt)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Item Details & Description
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Handoff & Logistics Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Logistics & Handoff Agreement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Meetup Option:</span>
                <span className="font-bold text-slate-800 text-sm">{handoffMeta?.label}</span>
                <p className="text-slate-500 mt-1">{listing.handoffDetails}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Payment Method:</span>
                <span className="font-bold text-slate-800 text-sm uppercase">
                  {listing.paymentMethod === "upi" ? "UPI (GPay / PhonePe / Paytm)" : "Cash on Meetup"}
                </span>
                <p className="text-slate-500 mt-1">No payment processing needed; settled directly.</p>
              </div>
            </div>
          </div>

          {/* Condition Documentation Safeguard */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Timestamped Condition Check-In
                </h4>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  When handoff occurs, both parties document condition with photos in the chat.
                  This ensures the item is returned in the exact same state and protects both lender and borrower!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Escrow, Lender Profile & CTA */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card space-y-5">
            <div>
              <span className="text-xs text-slate-400 font-semibold">Lending Rate</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900">
                  {listing.price === 0 ? "FREE" : `₹${listing.price}`}
                </span>
                {listing.price > 0 && <span className="text-xs text-slate-500">/ day</span>}
              </div>
            </div>

            {/* Availability Detail Box in Action Card */}
            {availability?.isCurrentlyLent ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>In Use by {availability.activeBorrowerName}</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Return:</span>
                    <span className="font-semibold">{formatDateTime(availability.currentReturnDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inspection Buffer:</span>
                    <span className="font-semibold">+{availability.bufferHours} hours</span>
                  </div>
                  <div className="pt-1.5 border-t border-amber-200/80 flex justify-between font-bold text-emerald-800 text-xs">
                    <span>Earliest Available:</span>
                    <span>{formatShortDateTime(availability.nextAvailableDate)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Available for Instant Pickup</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Advance bookings welcome! Lister buffer: {availability?.bufferHours || 2} hours.
                </p>
              </div>
            )}

            {/* Security Deposit Escrow Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Security Deposit
                </span>
                <span>
                  {listing.securityDeposit > 0 ? `₹${listing.securityDeposit}` : "None Required"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Held in escrow status during the active borrow period and automatically marked returned upon safe return.
              </p>
            </div>

            {/* Request Button */}
            {!isOwner ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-card-hover hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
              >
                <Calendar className="h-4 w-4" />
                <span>Request to Borrow</span>
              </button>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center text-xs font-bold text-amber-800">
                This is your listing
              </div>
            )}
          </div>

          {/* Lister Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              About the Lender
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={listing.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.userName}`}
                alt={listing.userName}
                className="h-12 w-12 rounded-2xl object-cover bg-slate-100 border"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{listing.userName}</h4>
                <p className="text-xs text-slate-500">Verified Campus Member</p>
                <div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{listing.userRating.toFixed(1)} / 5.0</span>
                  <span className="text-slate-400 font-normal ml-1">Reputation Score</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t text-xs">
              <Link
                href={`/profile/${listing.userId}`}
                className="text-indigo-600 font-semibold hover:underline block text-center"
              >
                View Lender Profile & Reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal with Smart Date Constraints & Auto-Adjust */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-floating border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Borrow Request: {listing.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select pickup and return date & hour of the day.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              {/* Smart Date & Hour Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pickup Date & Hour */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pickup Date & Hour *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      min={minStartDate}
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="w-28 shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {availability?.isCurrentlyLent && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Prior dates greyed out while in use
                    </span>
                  )}
                </div>

                {/* Return Date & Hour */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Return Date & Hour *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      min={fromDate}
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="w-28 shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Overlap Conflict Alert & Auto-Adjust Button */}
              {conflict.hasConflict ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-xs text-rose-900">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        Item is booked until {formatDateTime(conflict.conflictingSlot?.returnDate)}.
                      </span>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        Would you like to adjust your dates to{" "}
                        <strong>{formatShortDateTime(conflict.suggestedFromDate)}</strong> –{" "}
                        <strong>{formatShortDateTime(requestedToISO)}</strong>?
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-rose-700 font-medium">
                      Includes {conflict.conflictingSlot?.bufferHours}h turnaround buffer
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoAdjust}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Adjust Dates</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>These dates & hours are available! No scheduling conflict.</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Message to {listing.userName}
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and explain your intended use..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span className="font-bold text-slate-900">
                    {listing.price === 0 ? "FREE" : `₹${listing.price} / day`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit (Escrow status):</span>
                  <span className="font-bold text-slate-900">
                    {listing.securityDeposit > 0 ? `₹${listing.securityDeposit}` : "₹0"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Lister Buffer:</span>
                  <span>{availability?.bufferHours || 2} hours reserved after return</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || conflict.hasConflict}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all"
                >
                  {isSubmitting ? "Sending..." : "Submit & Open Chat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
