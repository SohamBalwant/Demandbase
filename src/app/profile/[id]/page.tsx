"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Calendar,
  Package,
  Repeat,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DEMO_USERS } from "@/lib/demo-data";
import { ListingCard } from "@/components/listings/ListingCard";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser } = useAuth();
  const { listings, reviews } = useData();

  // Find target user from local storage or demo list
  const allUsers = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("demandbase_all_users") || "[]")
    : [];
  const targetUser =
    allUsers.find((u: any) => u.uid === userId) ||
    DEMO_USERS.find((u) => u.uid === userId) ||
    (currentUser?.uid === userId ? currentUser : DEMO_USERS[0]);

  const userListings = listings.filter((l) => l.userId === targetUser.uid);
  const userReviews = reviews.filter((r) => r.revieweeId === targetUser.uid);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </Link>

      {/* Profile Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={targetUser.avatar}
            alt={targetUser.displayName}
            className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover border-2 border-indigo-200 bg-slate-100 shadow-sm"
          />

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {targetUser.displayName}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Verified Student
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              {targetUser.location.address}
            </p>

            <p className="text-xs text-slate-700 pt-1 leading-relaxed max-w-xl">
              {targetUser.bio || "Active campus borrower & lender."}
            </p>
          </div>
        </div>

        {/* Reputation Score & Stats Cards */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-center">
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-3">
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-600">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              <span>{targetUser.stats.avgRating.toFixed(1)}</span>
            </div>
            <p className="text-[11px] font-bold text-amber-800 mt-0.5">
              Reputation Score ({userReviews.length || targetUser.stats.totalReviews} reviews)
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-2xl font-black text-indigo-600">{userListings.length}</span>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Active Listings</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-2xl font-black text-emerald-600">
              {targetUser.stats.itemsLent}
            </span>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Items Lent</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-2xl font-black text-teal-600">
              {targetUser.stats.itemsBorrowed}
            </span>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Items Borrowed</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Reputation Ratings & Peer Reviews ({userReviews.length})
        </h2>

        {userReviews.length > 0 ? (
          <div className="space-y-3">
            {userReviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {rev.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{rev.reviewerName}</span>
                      <span className="text-[10px] text-slate-400 block capitalize">
                        Role: {rev.role} • {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No written reviews yet for this user. Ratings update automatically after completed borrows!
          </div>
        )}
      </div>

      {/* User's Active Listings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Available Gear from {targetUser.displayName} ({userListings.length})
        </h2>

        {userListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {userListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No active listings currently posted by this user.
          </div>
        )}
      </div>
    </div>
  );
}
