"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { formatDate } from "@/lib/utils";

export default function ChatListPage() {
  const { user } = useAuth();
  const { chats } = useData();

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Please sign in to view messages</h2>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Direct Messages</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Coordinate handoffs, return deadlines, and condition documentation with campus peers
        </p>
      </div>

      {chats.length > 0 ? (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {chats.map((chat) => {
            const otherParticipantId = chat.participants.find((p) => p !== user.uid) || "";
            const otherParticipantName =
              chat.participantNames[otherParticipantId] || "Campus Member";

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border shrink-0">
                    <img
                      src={
                        chat.listingImage ||
                        "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={chat.listingTitle}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {otherParticipantName}
                      </h4>
                      <span className="text-[10px] text-slate-400">• {formatDate(chat.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1 mt-0.5">
                      {chat.listingTitle}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          No active conversations yet. Request an item from the browse catalog to start chatting!
        </div>
      )}
    </div>
  );
}
