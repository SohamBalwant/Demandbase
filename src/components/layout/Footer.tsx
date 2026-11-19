import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-300 py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">DemandLend</span>
              <p className="text-xs text-slate-400">The Campus Collaborative Lending Hub</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <Link href="/listings" className="hover:text-white transition-colors">
              Browse Listings
            </Link>
            <Link href="/calendar" className="hover:text-white transition-colors">
              Public Demand Calendar
            </Link>
            <Link href="/groups" className="hover:text-white transition-colors">
              Community Circles
            </Link>
            <Link href="/listings/new" className="hover:text-white transition-colors">
              Post an Item
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
