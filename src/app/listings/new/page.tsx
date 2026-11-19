"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Plus,
  ShieldCheck,
  MapPin,
  Check,
  AlertCircle,
  HelpCircle,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { CATEGORIES, CONDITIONS, HANDOFF_METHODS, PAYMENT_METHODS } from "@/lib/constants";
import { Category, ItemCondition, HandoffMethod, PaymentMethod } from "@/types";

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addListing, groups } = useData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("tools");
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [isFree, setIsFree] = useState(true);
  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [handoffMethod, setHandoffMethod] = useState<HandoffMethod>("meet_middle");
  const [handoffDetails, setHandoffDetails] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [roughNotes, setRoughNotes] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [submitError, setSubmitError] = useState("");

  const samplePhotoPresets = [
    { label: "Power Tool", url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80" },
    { label: "Electronics", url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80" },
    { label: "Kitchen Gear", url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80" },
    { label: "Sports Equipment", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80" },
  ];

  const handleAiAutoFill = async () => {
    setIsAiLoading(true);
    setAiTip("");
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roughNotes: roughNotes || title || "Campus item in good condition",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.condition) setCondition(data.condition);
        if (data.suggestedPrice !== undefined) {
          if (data.suggestedPrice === 0) {
            setIsFree(true);
            setPrice(0);
          } else {
            setIsFree(false);
            setPrice(data.suggestedPrice);
          }
        }
        if (data.suggestedDeposit !== undefined) setSecurityDeposit(data.suggestedDeposit);
        if (data.tips) setAiTip(data.tips);

        if (!imageUrl) {
          const lower = (roughNotes || data.title).toLowerCase();
          if (lower.includes("powerbank") || lower.includes("charger") || lower.includes("battery")) {
            setImageUrl("https://images.unsplash.com/photo-1609592807963-448f2fa20e98?auto=format&fit=crop&w=800&q=80");
          } else if (data.category === "electronics") {
            setImageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80");
          } else if (data.category === "tools") {
            setImageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80");
          } else if (data.category === "kitchen") {
            setImageUrl("https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80");
          } else if (data.category === "sports") {
            setImageUrl("https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80");
          }
        }
      }
    } catch (err) {
      console.error("AI auto-fill failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError("Please fill in the item title and description.");
      return;
    }

    if (!user) {
      setSubmitError("Please sign in to post an item.");
      return;
    }

    const created = addListing({
      userId: user.uid,
      userName: user.displayName,
      userAvatar: user.avatar,
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      images: [
        imageUrl.trim() ||
        "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
      ],
      price: isFree ? 0 : Number(price),
      securityDeposit: Number(securityDeposit) || 0,
      location: user.location,
      availability: {
        from: new Date().toISOString(),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      paymentMethod,
      handoffMethod,
      handoffDetails: handoffDetails.trim() || "Coordinates via chat",
      groupId: groupId ? groupId : null,
      status: "available",
    });

    router.push(`/listings/${created.id}`);
  };

  return (
    <div className="container max-w-3xl py-10">
      {/* Title */}
      <div className="pb-6 border-b">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Post an Idle Item to Share
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Turn your unused equipment, kitchen tools, or study gear into campus goodwill (or daily rent)
        </p>
      </div>

      {/* Gemini AI Smart Assistant Banner */}
      <div className="mt-6 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-amber-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              AI Smart Listing Generator
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Type rough notes (e.g. &quot;Bosch drill 550W, with bits box, like new&quot;) and let Gemini auto-generate the title, description, category, and fair pricing!
            </p>

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={roughNotes}
                onChange={(e) => setRoughNotes(e.target.value)}
                placeholder="E.g. Sony Bluetooth speaker, loud bass, perfect for hostel party..."
                className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAiLoading}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shrink-0 shadow-xs"
              >
                {isAiLoading ? (
                  <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-300" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                )}
                <span>Auto-Fill with AI</span>
              </button>
            </div>

            {aiTip && (
              <div className="mt-2.5 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>AI Inspection Tip: {aiTip}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Item Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Item Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Bosch GSB 550W Impact Drill Kit with Bits"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Item Condition *
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Description & Usage Notes *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's included, operating tips, condition highlights, or any accessories provided..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Photo URL & Quick Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Item Photo URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste direct image link (Unsplash or web photo)..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick presets for hackathon demo */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-600 font-medium">Demo image presets:</span>
            {samplePhotoPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {imageUrl && (
            <div className="mt-3 relative h-36 w-48 rounded-xl overflow-hidden border">
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Price & Security Deposit */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Lending Rate
              </span>
              <p className="text-[11px] text-slate-500">
                Choose to offer for free to build community goodwill, or set a small daily fee.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => {
                  setIsFree(e.target.checked);
                  if (e.target.checked) setPrice(0);
                }}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Share for FREE
              </span>
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Price (₹ / day)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Security Deposit Escrow */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Security Deposit Escrow (₹)
              </label>
              <span className="text-[11px] text-slate-600">Tracked in escrow</span>
            </div>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                placeholder="0 = No deposit required"
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Handoff & Payment Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Handoff Method *
            </label>
            <select
              value={handoffMethod}
              onChange={(e) => setHandoffMethod(e.target.value as HandoffMethod)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {HANDOFF_METHODS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Preference
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Handoff Details */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Pickup / Meetup Landmark
          </label>
          <input
            type="text"
            value={handoffDetails}
            onChange={(e) => setHandoffDetails(e.target.value)}
            placeholder="E.g. Central Library Canteen or Hostel 3 Ground Floor Reception"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Community Circle Visibility */}
        {groups.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Audience / Circle Visibility
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Public Campus (Visible to Everyone)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  Private Circle: {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-card-hover hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
}
