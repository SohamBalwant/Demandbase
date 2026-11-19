# DemandLend 🤝

> **Campus Resource Lending Network** — Free & peer-to-peer physical item sharing with Gemini AI, interactive campus radar, smart collision-aware scheduling, and timestamped condition safeguards.

Built for the on-campus hackathon.

---

## 🌟 Key Features

1. **AI-Powered Semantic Search & Discovery**:
   - Natural language queries via Gemini AI (`"something to fix my dorm shelf"` -> matches Bosch Impact Drill).
   - Category filtering, price filters (including 100% FREE items), and sort by proximity or ratings.

2. **Availability Scheduling & Collision Prevention**:
   - **Dynamic Availability Badges**: Listing cards and item pages show real-time in-use status (e.g., `🟡 In Use · Available 22 Nov, 8:00 PM`).
   - **Hour-Level Precision**: Select specific pickup and return hours of the day (e.g. 10:00 AM to 6:00 PM).
   - **Lister Turnaround Buffer**: Listers can specify 0h, 1h, 2h, 4h, or 24h buffers between borrowers for inspection and recharging.
   - **Collision Prevention & Auto-Adjust**: Automatically prevents double-booking while keeping future advance dates open; provides 1-click **"Adjust Dates"** prompt.

3. **Smart Listing Creation (`/listings/new`)**:
   - Auto-fill item details, condition, fair market pricing, and safety tips using Gemini AI (`gemini-3.1-flash-lite`).

4. **Public Demand Calendar (`/calendar`)**:
   - Need an item not currently listed? Post your need on the campus calendar.
   - Other students can click **"I Can Fulfill This!"** to instantly open a chat thread and offer their item.
   - AI supply-demand auto-matcher matches open requests with existing campus listings.

5. **Real-Time Campus Chat & Condition Check-In (`/chat/[id]`)**:
   - Coordinate meetups, discuss pickup spots, and track escrow status.
   - **Timestamped Condition Documentation**: Upload before/after handoff photos to safeguard against damage disputes.

6. **Private Community Circles (`/groups`)**:
   - Create private circles (e.g. Hostel 4, Robocon Club, Design Studio) with shareable 6-character join codes.

7. **Multi-Tab Demo Switcher**:
   - Tab-isolated authentication (`sessionStorage`) allows testing two students (e.g. Soham and Priya) simultaneously in separate browser tabs with instant real-time data sync.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **AI**: Google Gemini API (`gemini-3.1-flash-lite`) via `@google/genai`
- **Icons**: Lucide React
- **Sync**: Real-time cross-tab storage event listeners

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/balwantsoham/Demandbase.git
   cd Demandbase
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
