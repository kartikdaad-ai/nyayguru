"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Scale,
  Paperclip,
  Mic,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Trash2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

const STORAGE_KEY_PREFIX = "nyayguru-chat-history";

function getStorageKey(userEmail: string | null | undefined): string {
  if (userEmail) {
    // Create a user-specific key using their email
    return `${STORAGE_KEY_PREFIX}-${userEmail}`;
  }
  // Guest users get their own separate key
  return `${STORAGE_KEY_PREFIX}-guest`;
}

const suggestedQuestions = [
  "What are tenant rights in India?",
  "How to file a consumer complaint?",
  "Explain Domestic Violence Act",
  "What is Section 498A IPC?",
  "How to file an RTI application?",
  "Explain the Motor Vehicle Act",
];

function loadChatSessions(storageKey: string): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveChatSessions(sessions: ChatSession[], storageKey: string) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sessions));
  } catch {
    // Storage full or unavailable
  }
}

export default function ChatPage() {
  const { data: authSession } = useSession();
  const storageKey = getStorageKey(authSession?.user?.email);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Migrate old shared history to user-specific key (one-time)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const OLD_KEY = "nyayguru-chat-history";
    const oldData = localStorage.getItem(OLD_KEY);
    if (oldData && storageKey !== OLD_KEY) {
      try {
        const oldSessions: ChatSession[] = JSON.parse(oldData);
        if (oldSessions.length > 0) {
          // Merge old sessions into user-specific storage
          const existing = loadChatSessions(storageKey);
          const existingIds = new Set(existing.map((s) => s.id));
          const newSessions = oldSessions.filter((s) => !existingIds.has(s.id));
          if (newSessions.length > 0) {
            const merged = [...newSessions, ...existing].slice(0, 50);
            saveChatSessions(merged, storageKey);
          }
        }
      } catch {
        // Ignore migration errors
      }
      // Remove old shared key to prevent cross-user leakage
      localStorage.removeItem(OLD_KEY);
    }
  }, [storageKey]);

  // Load sessions on mount or when user changes
  useEffect(() => {
    const loaded = loadChatSessions(storageKey);
    setSessions(loaded);
    // Reset current chat when user changes
    setMessages([]);
    setCurrentSessionId(null);
  }, [storageKey]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to current session
  const saveCurrentSession = useCallback(
    (msgs: Message[]) => {
      if (msgs.length === 0) return;

      const sessionId = currentSessionId || Date.now().toString();
      const firstUserMsg = msgs.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "")
        : "New Chat";

      const updatedSession: ChatSession = {
        id: sessionId,
        title,
        messages: msgs,
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        const updated = [updatedSession, ...filtered].slice(0, 50); // Keep last 50
        saveChatSessions(updated, storageKey);
        return updated;
      });

      if (!currentSessionId) setCurrentSessionId(sessionId);
    },
    [currentSessionId, storageKey]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call API
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      let content: string;
      if (!res.ok || data.error) {
        content = `⚠️ ${data.error || "Failed to get AI response. Please try again in a moment."}`;
      } else {
        content = data.message || "I apologize, but I could not process your request. Please try again.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        saveCurrentSession(updated);
        return updated;
      });
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ Network error. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMessage];
        saveCurrentSession(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    setMessages(
      session.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    );
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      saveChatSessions(updated, storageKey);
      return updated;
    });
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  NyayGuru AI
                </p>
                <p className="text-xs text-green-600">● Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Chat
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              showHistory
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            History{sessions.length > 0 && ` (${sessions.length})`}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-72 shrink-0 overflow-y-auto border-r border-border bg-card p-3">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chat History
            </h3>
            {sessions.length === 0 ? (
              <p className="px-2 text-xs text-muted-foreground">
                No previous chats yet.
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                      currentSessionId === session.id
                        ? "bg-primary/10 text-primary"
                        : "text-card-foreground hover:bg-muted"
                    }`}
                    onClick={() => handleLoadSession(session)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleDateString()} ·{" "}
                        {session.messages.length} msgs
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="ml-2 shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Hello, how can I help you today?
              </h2>
              <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
                Ask any legal question about Indian law. I can help with
                criminal, civil, family, property, consumer, labour law and
                more.
              </p>

              <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q)}
                    className="rounded-xl border border-border bg-card p-4 text-left text-sm text-card-foreground transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Scale className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "border border-border bg-card text-card-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                    <div
                      className={`mt-2 flex items-center gap-2 text-xs ${
                        msg.role === "user"
                          ? "text-blue-100"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-foreground">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                      <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl items-end gap-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Attach document"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any legal question..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-primary p-3 text-white transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-muted-foreground">
          ⚠️ NyayGuru provides legal information, not formal legal advice.
          Consult a qualified advocate for court matters.
        </p>
      </div>
    </div>
  );
}
