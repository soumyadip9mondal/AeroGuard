'use client';

import { useRef, useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { useAssistantStore } from '@/stores/assistant.store';
import { Send, FileText, BookOpen, Shield, Package, Sparkles } from 'lucide-react';

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
  const { messages, isStreaming, addUserMessage, simulateResponse } = useAssistantStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contextSources, setContextSources] = useState(['Inspection Reports', 'FAA Regulations']);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    addUserMessage(msg);
    const resp = responses[msg] || responses.default;
    simulateResponse(resp.text, resp.citations);
  };

  const allSources = ['Inspection Reports', 'Aircraft Manuals', 'FAA Regulations', 'Inventory'];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <div className="flex flex-1 flex-col">
        <TopBar title="AI Assistant" subtitle="Ask questions about inspections, fleet health, and compliance" />

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                {msg.role === 'assistant' && (
                  <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-accent flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                )}
                <div>
                  <div
                    className={`rounded-xl px-4 py-3 text-[14px] leading-[1.7] whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-elevated text-text-primary rounded-br-md'
                        : 'border border-border-subtle bg-transparent text-text-secondary rounded-bl-md'
                    }`}
                  >
                    {msg.content}
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
        </div>

        {/* Quick prompts + Input */}
        <div className="border-t border-border-subtle p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p} onClick={() => handleSend(p)} className="rounded-full border border-border-subtle bg-elevated px-3 py-1 text-[12px] text-text-secondary hover:text-text-primary hover:border-border-default transition-colors">
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about inspections, fleet health, compliance..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-elevated px-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
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

      {/* Context panel */}
      <aside className="hidden w-[300px] shrink-0 border-l border-border-subtle bg-surface p-5 xl:block">
        <h3 className="mb-4 text-[13px] font-medium text-text-primary">Context Sources</h3>
        <div className="space-y-2">
          {allSources.map((src) => {
            const active = contextSources.includes(src);
            const icons: Record<string, any> = { 'Inspection Reports': FileText, 'Aircraft Manuals': BookOpen, 'FAA Regulations': Shield, 'Inventory': Package };
            const Icon = icons[src] || FileText;
            return (
              <button
                key={src}
                onClick={() => setContextSources(active ? contextSources.filter((s) => s !== src) : [...contextSources, src])}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-[13px] transition-colors ${
                  active ? 'border-accent/30 bg-accent-subtle text-text-primary' : 'border-border-subtle text-text-secondary hover:border-border-default'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-accent' : 'text-text-tertiary'}`} />
                {src}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-md border border-border-subtle bg-elevated p-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Active Context</span>
          <div className="mt-2 text-[12px] text-text-secondary">
            <div className="font-mono text-text-primary">N-737AB</div>
            <div>INS-2024-0847 · Boeing 737-800</div>
            <div>3 defects · 1 Critical</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
