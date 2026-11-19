"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  PlusCircle,
  Calendar,
  Users,
  MessageSquare,
  Search,
  Bell,
  User,
  ChevronDown,
  Repeat,
  PackageCheck,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DEMO_USERS } from "@/lib/demo-data";

export function Navbar() {
  const pathname = usePathname();
  const { user, switchUser, logout } = useAuth();
  const { unreadNotificationsCount, notifications, chats } = useData();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/listings", label: "Browse Items", icon: Search },
    { href: "/calendar", label: "Demand Calendar", icon: Calendar },
    { href: "/groups", label: "Campus Circles", icon: Users },
    {
      href: "/chat",
      label: "Messages",
      icon: MessageSquare,
      badge: chats.length > 0 ? chats.length : undefined,
    },
    { href: "/dashboard", label: "My Hub", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Demand<span className="text-indigo-600">Lend</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-600">
              Campus Lending Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / User Section */}
        <div className="flex items-center gap-2.5">
          {/* Post Item CTA Button */}
          <Link
            href="/listings/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 hover:shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Post an Item</span>
            <span className="sm:hidden">Post</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setUserDropdownOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-floating z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Notifications
                  </span>
                  <span className="text-xs text-indigo-600 font-medium">
                    {notifications.length} updates
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 py-1">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.linkTo}
                      onClick={() => setNotifDropdownOpen(false)}
                      className="block p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                  alt={user.displayName}
                  className="h-7 w-7 rounded-lg object-cover bg-slate-100 border"
                />
                <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                  {user.displayName.split(" ")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-3 shadow-floating z-50">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="h-10 w-10 rounded-xl object-cover border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-bold">
                        <span>★ {user.stats.avgRating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">
                          ({user.stats.totalTransactions} transactions)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                      <span>Switch Demo Account</span>
                      <span className="text-[9px] text-indigo-500 normal-case font-medium">1-Click</span>
                    </p>
                    <div className="space-y-1">
                      {DEMO_USERS.map((demo) => (
                        <button
                          key={demo.uid}
                          onClick={() => {
                            switchUser(demo.uid);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${user.uid === demo.uid
                              ? "bg-indigo-50 text-indigo-700 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Repeat className="h-3 w-3 text-slate-400" />
                            <span>{demo.displayName}</span>
                          </div>
                          <span className="text-[10px] text-amber-600 font-semibold">
                            ★ {demo.stats.avgRating}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                    <Link
                      href={`/profile/${user.uid}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      View Public Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <PackageCheck className="h-3.5 w-3.5 text-slate-400" />
                      Lent & Borrowed Items
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
