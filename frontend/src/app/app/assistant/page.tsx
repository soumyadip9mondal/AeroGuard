'use client';

import { useRef, useEffect, useState } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { useAssistantStore } from '@/stores/assistant.store';
import { Send, FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const prompts = [
  'Show recurring defects',
  'Fleet health summary',
  'Generate compliance report',
  'Predict next maintenance',
];

const responses: Record<string, { text: string; citations: { label: string; type: string }[] }> = {
  'Fleet health summary': {
    text: 'Fleet Health Summary as of June 2025:\n\n**Overall Score: 94.2%** (↑ 2.1% from last month)\n\n• Boeing 737-800 fleet: 96.1% — 342 inspections completed, 12 active defects\n• Airbus A320neo fleet: 93.4% — 289 inspections, 8 active defects\n• Boeing 777-300ER fleet: 91.8% — 156 inspections, 15 active defects (3 critical)\n• Airbus A380-800 fleet: 88.7% — 98 inspections, 22 active defects\n\n**Key Concerns:**\n1. A380 HPT blade coating loss rate increasing — recommend fleet-wide borescope at next C-check\n2. 777 engine vibration trend correlated with LPT Stage 2 fatigue cracks\n3. 737 fleet performing well post-blade replacement program\n\n**Upcoming:** 14 scheduled inspections in next 30 days. 3 aircraft approaching mandatory service intervals.',
    citations: [{ label: 'Fleet Report Q2-2025', type: 'report' }, { label: 'EASA AD 2025-0087', type: 'regulation' }],
  },
  default: {
    text: 'I can help you with that. Let me analyze the relevant inspection data and maintenance records. Based on the current fleet status and historical inspection patterns, here are my findings:\n\nThe analysis indicates consistent performance across most aircraft types, with specific attention needed on high-cycle components. I recommend reviewing the detailed report for actionable insights.',
    citations: [{ label: 'Analysis Report', type: 'report' }],
  },
};

export default function AssistantPage() {
  const { messages, isStreaming, hasUserSent, setIsStreaming, addUserMessage, simulateResponse } = useAssistantStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const setPageTitle = useUIStore((s) => s.setPageTitle);
  useEffect(() => { setPageTitle('AI Assistant', 'Ask questions about inspections, fleet health, and compliance'); }, [setPageTitle]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isStreaming]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    addUserMessage(msg);

    try {
      setIsStreaming(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch AI response');
      
      simulateResponse(data.text, data.citations);
    } catch (err: any) {
      simulateResponse(`**Error:** ${err.message}. \n\n*Make sure you added GEMINI_API_KEY to your .env.local file.*`, []);
    }
  };



  return (
    <div className="flex h-full flex-col overflow-hidden">

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'justify-end' : 'gap-3'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-accent flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-xl px-4 py-2.5 text-[14px] leading-relaxed break-words inline-block ${
                        msg.role === 'user'
                          ? 'bg-accent text-white rounded-br-md text-left whitespace-pre-wrap'
                          : 'border border-border-subtle bg-surface text-text-primary rounded-bl-md prose prose-sm max-w-none prose-p:my-1.5 prose-strong:text-text-primary prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-text-primary'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                      {msg.isStreaming && <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5 align-middle" />}
                    </div>
                  {msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.citations.map((c) => (
                        <span key={c.label} className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2.5 py-0.5 text-[11px] font-medium text-accent">
                          <FileText className="h-2.5 w-2.5" />
                          {c.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[90%] sm:max-w-[80%] gap-3">
                <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <div className="rounded-xl px-4 py-3 border border-border-subtle bg-surface text-text-primary rounded-bl-md inline-block">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts + Input */}
        <div className="border-t border-border-subtle p-4">
          {!hasUserSent && (
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button key={p} onClick={() => handleSend(p)} className="whitespace-nowrap rounded-full border border-border-subtle bg-surface px-4 py-1.5 min-h-[36px] text-[13px] text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors">
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about inspections, fleet health..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-elevated px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
    </div>
  );
}
