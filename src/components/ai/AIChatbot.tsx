"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, X, Send, Bot, User, HelpCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "👋 Hi! I'm Gemini, your DemandLend Campus Assistant. Ask me anything about finding gear, escrow safety, posting your idle items, or how the demand calendar works!",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickPrompts = [
    "How does the security deposit escrow work?",
    "Can I borrow tools for free?",
    "How do condition photos protect me?",
    "What is the Public Demand Calendar?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          userName: user?.displayName || "Campus Member",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        // Fallback response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "DemandLend allows you to list idle physical items for free or daily rent. When borrowing, you can coordinate safe handoffs via chat, document condition photos before and after return, and build trust with 1-5 star reputation ratings!",
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "DemandLend connects campus students to share tools, cameras, kitchen appliances, and study gear without buying expensive one-time items!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-3.5 text-white shadow-card-hover hover:scale-105 active:scale-95 transition-all"
          aria-label="Open AI Campus Assistant"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse-subtle" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Ask Campus AI</span>
        </button>
      ) : (
        <div className="flex flex-col h-[520px] w-[350px] sm:w-[390px] rounded-3xl border border-indigo-100 bg-white shadow-floating overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-amber-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">DemandLend Gemini AI</p>
                <p className="text-[10px] text-indigo-200">Campus Sharing Concierge</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs mt-0.5">
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[82%] ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-100 shadow-xs rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs italic">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-3 w-3 animate-spin" />
                </div>
                <span>Gemini is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="p-2 border-t border-slate-100 bg-white">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.slice(0, 2).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-left transition-colors truncate max-w-full"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about borrowing, escrow, posting..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
