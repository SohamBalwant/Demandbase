"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Repeat,
  Star,
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Camera,
  PlusCircle,
  Eye,
  Trash2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    listings,
    requests,
    updateRequestStatus,
    documentCondition,
    deleteListing,
    addReview,
  } = useData();

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [conditionPhase, setConditionPhase] = useState<"before" | "after">("before");
  const [conditionNotes, setConditionNotes] = useState("");
  const [conditionImg, setConditionImg] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please sign in to view your hub</h2>
      </div>
    );
  }

  // Filter requests
  const incomingRequests = requests.filter((r) => r.lenderId === user.uid);
  const myBorrowRequests = requests.filter((r) => r.borrowerId === user.uid);
  const myListings = listings.filter((l) => l.userId === user.uid);

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId) return;

    documentCondition(
      selectedReqId,
      conditionPhase,
      [conditionImg || "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80"],
      conditionNotes || "Item inspected and documented cleanly."
    );

    setConditionModalOpen(false);
    setConditionNotes("");
    setConditionImg("");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId) return;
    const req = requests.find((r) => r.id === selectedReqId);
    if (!req) return;

    const isLender = req.lenderId === user.uid;

    addReview({
      requestId: req.id,
      listingId: req.listingId,
      reviewerId: user.uid,
      reviewerName: user.displayName,
      revieweeId: isLender ? req.borrowerId : req.lenderId,
      revieweeName: isLender ? req.borrowerName : req.lenderName,
      role: isLender ? "lender" : "borrower",
      rating: reviewRating,
      comment: reviewComment.trim() || "Smooth and pleasant transaction!",
    });

    setReviewModalOpen(false);
    setReviewComment("");
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Top Welcome & User Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-card">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-400/40 bg-white"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{user.displayName}</h1>
            <p className="text-xs text-indigo-200">{user.location.address}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-300 font-bold">
              <span>★ {user.stats.avgRating.toFixed(1)} Rating</span>
              <span className="text-indigo-300">•</span>
              <span className="text-indigo-200 font-normal">
                {user.stats.totalTransactions} Completed Shares
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/listings/new"
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Item</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center">
          <span className="text-2xl font-black text-indigo-600">{myListings.length}</span>
          <p className="text-xs text-slate-500 mt-0.5">Active Listings</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center">
          <span className="text-2xl font-black text-emerald-600">{user.stats.itemsLent}</span>
          <p className="text-xs text-slate-500 mt-0.5">Items Lent Out</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center">
          <span className="text-2xl font-black text-teal-600">{user.stats.itemsBorrowed}</span>
          <p className="text-xs text-slate-500 mt-0.5">Items Borrowed</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center">
          <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
            <Star className="h-5 w-5 fill-amber-400" />
            {user.stats.avgRating.toFixed(1)}
          </span>
          <p className="text-xs text-slate-500 mt-0.5">Reputation Score</p>
        </div>
      </div>

      {/* Section 1: Incoming Borrow Requests (You as Lender) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <span>Borrow Requests for Your Gear ({incomingRequests.length})</span>
          </h2>
        </div>

        {incomingRequests.length > 0 ? (
          <div className="space-y-3">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{req.listingTitle}</h3>
                    <p className="text-xs text-slate-500">
                      Requested by <strong className="text-slate-800">{req.borrowerName}</strong> • {formatDate(req.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-auto rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                      req.status === "active"
                        ? "bg-indigo-100 text-indigo-700"
                        : req.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : req.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  &quot;{req.message}&quot;
                </p>

                {/* Return Reminders & Condition state */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/70">
                    <span className="text-slate-400 font-semibold block text-[11px]">
                      Borrow Period:
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatDate(req.borrowDates.from)} → {formatDate(req.borrowDates.to)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/70">
                    <span className="text-slate-400 font-semibold block text-[11px]">
                      Deposit Escrow:
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ₹{req.securityDeposit.amount} ({req.securityDeposit.status})
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <Link
                    href={`/chat/${req.chatId}`}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Open Chat</span>
                  </Link>

                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateRequestStatus(req.id, "accepted", "held")}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, "declined")}
                        className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === "accepted" && (
                    <button
                      onClick={() => {
                        setSelectedReqId(req.id);
                        setConditionPhase("before");
                        setConditionModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Document Handover Condition</span>
                    </button>
                  )}

                  {req.status === "active" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedReqId(req.id);
                          setConditionPhase("after");
                          setConditionModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Document Return Condition</span>
                      </button>
                      <button
                        onClick={() => {
                          updateRequestStatus(req.id, "completed", "returned");
                          setSelectedReqId(req.id);
                          setReviewModalOpen(true);
                        }}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Mark Item Returned & Rate
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No active borrow requests for your gear yet.
          </div>
        )}
      </div>

      {/* Section 2: My Borrow Requests (Items you are borrowing) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Repeat className="h-5 w-5 text-emerald-600" />
          <span>Items You Are Borrowing ({myBorrowRequests.length})</span>
        </h2>

        {myBorrowRequests.length > 0 ? (
          <div className="space-y-3">
            {myBorrowRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{req.listingTitle}</h3>
                    <p className="text-xs text-slate-500">
                      Lender: <strong className="text-slate-800">{req.lenderName}</strong>
                    </p>
                  </div>
                  <span className="rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 text-xs font-bold capitalize">
                    {req.status}
                  </span>
                </div>

                {/* Return reminder banner */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Return deadline: {formatDate(req.borrowDates.to)}</span>
                  </div>
                  <span className="font-bold">Automated reminder active</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link
                    href={`/chat/${req.chatId}`}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat with {req.lenderName}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            You haven&apos;t borrowed any items yet.{" "}
            <Link href="/listings" className="text-indigo-600 font-semibold underline">
              Browse listings
            </Link>
          </div>
        )}
      </div>

      {/* Section 3: My Posted Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-700" />
            <span>Your Listed Inventory ({myListings.length})</span>
          </h2>
        </div>

        {myListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5">
                      {item.price === 0 ? "FREE" : `₹${item.price}/day`}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                      Status: {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 border-t flex items-center justify-between gap-2">
                  <Link
                    href={`/listings/${item.id}`}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Link>
                  <button
                    onClick={() => deleteListing(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            You have not posted any items yet.
          </div>
        )}
      </div>

      {/* Condition Documentation Modal */}
      {conditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Document Condition ({conditionPhase === "before" ? "Handover Before" : "Return After"})
            </h3>
            <p className="text-xs text-slate-500">
              Take or attach photos showing the physical state, working condition, and accessories.
            </p>

            <form onSubmit={handleDocumentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={conditionImg}
                  onChange={(e) => setConditionImg(e.target.value)}
                  placeholder="Paste direct photo link or leave empty for demo image..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Condition Notes
                </label>
                <textarea
                  rows={3}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="E.g. Clean body, all accessories verified, power cord intact..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConditionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Save Timestamped Documentation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (1-5 Star Reputation Scoring) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Leave Reputation Review (1 - 5 Stars)
            </h3>
            <p className="text-xs text-slate-500">
              Rate your experience. Reviews directly update user profile scores and campus trust!
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Feedback Comment
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about punctuality, item care, and communication..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
