"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  Camera,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { formatDate } from "@/lib/utils";

export default function ChatThreadPage() {
  const params = useParams();
  const chatId = params?.id as string;
  const { user } = useAuth();
  const {
    chats,
    messages,
    sendMessage,
    requests,
    updateRequestStatus,
    documentCondition,
  } = useData();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === chatId) || chats[0];
  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];
  const linkedRequest = requests.find((r) => r.chatId === activeChat?.id);

  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [conditionNotes, setConditionNotes] = useState("");
  const [conditionImg, setConditionImg] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!activeChat || !user) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Chat conversation not found</h2>
        <Link
          href="/chat"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Messages</span>
        </Link>
      </div>
    );
  }

  const otherParticipantId = activeChat.participants.find((p) => p !== user.uid) || "";
  const otherParticipantName =
    activeChat.participantNames[otherParticipantId] || "Campus Member";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeChat.id, inputText.trim());
    setInputText("");
  };

  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedRequest) return;
    documentCondition(
      linkedRequest.id,
      linkedRequest.status === "active" ? "after" : "before",
      [
        conditionImg ||
          "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
      ],
      conditionNotes || "Condition photos verified by both parties."
    );
    sendMessage(
      activeChat.id,
      `📸 Condition verified and documented: "${conditionNotes || "Item inspected cleanly"}"`
    );
    setConditionModalOpen(false);
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex flex-col h-[750px] rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/80">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            {activeChat.listingImage && (
              <img
                src={activeChat.listingImage}
                alt={activeChat.listingTitle}
                className="h-10 w-10 rounded-xl object-cover border"
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{otherParticipantName}</h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified Peer
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Item: {activeChat.listingTitle}
              </p>
            </div>
          </div>

          {/* Quick Transaction Action Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConditionModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Document Condition</span>
            </button>
          </div>
        </div>

        {/* Security / Handoff Banner */}
        {linkedRequest && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2 bg-slate-100/70 border-b text-[11px] text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Deposit Status: {linkedRequest.securityDeposit.status.toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Return by: {formatDate(linkedRequest.borrowDates.to)}
            </span>
            {linkedRequest.status === "active" && (
              <button
                onClick={() => {
                  updateRequestStatus(linkedRequest.id, "completed", "returned");
                  sendMessage(activeChat.id, "✅ Item has been safely returned! Escrow returned.");
                }}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
              >
                Mark Returned
              </button>
            )}
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/40">
          {chatMessages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            const isSystem = msg.type === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-medium text-slate-600">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                  {msg.senderName} • {formatDate(msg.createdAt)}
                </span>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs"
                  }`}
                >
                  {msg.text}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      className="mt-2 rounded-xl border max-h-48 object-cover"
                    />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-3 p-4 border-t bg-white">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to coordinate pickup and handoff..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Document Condition Modal */}
      {conditionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Document Item Condition Photos
            </h3>
            <p className="text-xs text-slate-500">
              Attach a timestamped photo verification of the item&apos;s physical state to the chat.
            </p>

            <form onSubmit={handleSaveCondition} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={conditionImg}
                  onChange={(e) => setConditionImg(e.target.value)}
                  placeholder="Paste image link or leave empty for demo photo..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="E.g. Verified zero scratches on screen, all cords included..."
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
                  Post Condition to Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
