"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [locationAddress, setLocationAddress] = useState("North Campus, Engineering Hostel");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    const success = await register(name.trim(), email.trim(), password, locationAddress);
    setLoading(false);
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="container max-w-md py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Join DemandLend</h1>
          <p className="text-xs text-slate-500">
            No complex OTP needed — start sharing and borrowing immediately
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Soham Balwant"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Campus Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. soham@campus.edu"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              Campus Hostel or Building *
            </label>
            <input
              type="text"
              required
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="e.g. Hostel 4, Room 214 or Engineering Block A"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xs"
          >
            {loading ? "Creating Account..." : "Create Account & Start Sharing"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
