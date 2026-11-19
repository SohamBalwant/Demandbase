"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_USERS } from "@/lib/demo-data";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const success = await login(email.trim(), password);
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
          <h1 className="text-2xl font-extrabold text-slate-900 pt-2">Welcome Back</h1>
          <p className="text-xs text-slate-500">
            Sign in to DemandLend with your campus email
          </p>
        </div>

        {/* 1-Click Demo Quick Login for Judges */}
        <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            ⚡ Quick Demo Accounts (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.slice(0, 2).map((demo) => (
              <button
                key={demo.uid}
                type="button"
                onClick={() => {
                  switchUser(demo.uid);
                  router.push("/dashboard");
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-200 text-left hover:border-indigo-400 hover:shadow-xs transition-all"
              >
                <img src={demo.avatar} alt={demo.displayName} className="h-7 w-7 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate">{demo.displayName.split(" ")[0]}</p>
                  <p className="text-[9px] text-slate-400">★ {demo.stats.avgRating}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@campus.edu"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            {loading ? "Signing in..." : "Sign In to DemandLend"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Don&apos;t have an account yet?{" "}
          <Link href="/auth/register" className="font-semibold text-indigo-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
