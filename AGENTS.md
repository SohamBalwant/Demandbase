# DemandLend — Project Context for Agents

> This file provides persistent context for AI agents working on this project.
> Updated: 2026-11-19

## Project Overview

**DemandLend** is a campus resource-sharing platform where users can list physical
items they own (at any price, including free) for others to borrow for a set
duration. Think OLX meets a community lending library — with AI-powered search,
real-time chat, reputation scoring, demand calendar, and community circles.

**Context**: Built for an on-campus hackathon. No scaling concerns. Must produce
a **working live demo**. Speed of development > production-readiness.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack in one codebase, fast iteration |
| Language | TypeScript | Type safety without overhead |
| Styling | Tailwind CSS + Custom Design System | Beautiful, modern, modular components |
| Auth | Firebase Auth & Tab-Isolated Demo Context | `sessionStorage` user isolation for side-by-side Edge testing |
| Database | Cloud Firestore & Persistent Demo Cache | Real-time cross-tab sync via `storage` events |
| Storage | Firebase Storage & Media CDN | Item photos, condition documentation images |
| AI | Gemini API (`gemini-3.1-flash-lite`) | Semantic search, smart listing auto-fill, demand matching, chatbot |
| Maps | Leaflet & Campus Radar Map | Walking-distance proximity visualization |
| Dates & Times | Native Temporal & Utils | Date + hour level availability, return reminders, buffer calculation |
| State | React Context + Persistent Cache | Simple, reactive, cross-tab testing ready |

## Key Architecture Decisions

1. **Single Next.js codebase** — no separate backend. API routes handle server logic.
2. **Persistent Unified Data Provider** — Real-time reactive data with zero-friction live demo testing.
3. **Availability & Overlap Collision Detection** — Real-time booking collision prevention taking into account lister inspection/turnaround buffer hours.
4. **Smart Date & Hour Pickers** — Constrains minimum selectable start date and hour, with 1-click auto-adjust prompt.
5. **Multi-Tab Isolation** — `sessionStorage` for active user auth allows testing multiple accounts in different tabs of the same browser without cross-contamination.
6. **No payment integration** — payment method (UPI/cash) is metadata only, not processed.
7. **Security deposit is tracked, not processed** — escrow status is tracked (held -> returned/claimed).
8. **AI features call Gemini from API routes** — keeps the API key server-side only (`gemini-3.1-flash-lite`).

## Implemented Pages & AI Routes

```
src/app/
├── page.tsx            → Landing page with AI semantic search & category filters
├── listings/
│   ├── page.tsx        → Catalog with Grid & Radar Map views + In-Use Availability Badges
│   ├── new/page.tsx    → Post item with Gemini AI auto-fill & Lister Turnaround Buffer Setting
│   └── [id]/page.tsx   → Item detail, transparency availability notice, borrow modal with hour picker & auto-adjust
├── calendar/page.tsx   → Public demand calendar + AI auto-match & "I Can Fulfill This" direct chat
├── chat/
│   ├── page.tsx        → Conversations list
│   └── [id]/page.tsx   → Direct messaging & condition photo documentation
├── dashboard/page.tsx  → User hub: lent/borrowed items, return reminders, ratings
├── groups/page.tsx     → Campus circles with 6-char join codes
├── profile/[id]/page.tsx → Public profile with 1-5 star reputation breakdown
├── auth/
│   ├── login/page.tsx  → Sign in + 1-click test account switcher
│   └── register/page.tsx → Simple register (no OTP needed)
└── api/ai/
    ├── search/route.ts → Gemini semantic query interpretation
    ├── describe/route.ts → Gemini photo & rough notes auto-listing
    ├── match/route.ts  → Gemini demand-supply matcher
    └── chat/route.ts   → Gemini campus sharing concierge
```

## Current Progress

- [x] Git repo initialized and pushed to GitHub
- [x] .env and .gitignore created
- [x] UI/UX Pro Max design intelligence applied
- [x] Project scaffolding (Next.js 14 + Tailwind + TypeScript)
- [x] Authentication & 1-Click Test User Switcher with multi-tab session isolation
- [x] Listings CRUD + Gemini AI Auto-Fill & Fair Pricing (`gemini-3.1-flash-lite`)
- [x] AI Semantic Search (`/api/ai/search`)
- [x] Interactive Campus Radar Map View
- [x] Availability Scheduling, Hour Timing & Collision Prevention
- [x] Lister Turnaround / Inspection Buffer Hours Setting (0h, 1h, 2h, 4h, 24h)
- [x] Borrowing Flow & Condition Documentation Before/After Handoff
- [x] Real-Time Chat & Handoff Coordination
- [x] 1-5 Star Reputation Scoring & Reviews
- [x] Public Demand Calendar + AI Demand-Supply Matcher + "I Can Fulfill This" Chat
- [x] Private Community Circles with Join Codes
- [x] Return Reminders & Notifications
- [x] Gemini AI Floating Chatbot Assistant
- [x] Production Build Verified (`next build` succeeds with 17 static/dynamic routes)
