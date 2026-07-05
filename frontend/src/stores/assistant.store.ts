'use client';

import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { label: string; type: string }[];
  isStreaming?: boolean;
}

interface AssistantState {
  messages: ChatMessage[];
  isStreaming: boolean;
  hasUserSent: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
  addUserMessage: (content: string) => void;
  simulateResponse: (content: string, citations?: { label: string; type: string }[]) => void;
}

const initialMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Show recurring defects on aircraft N-737AB' },
  { id: '2', role: 'assistant', content: 'Based on the inspection history for N-737AB (Boeing 737-800), I found a pattern of recurring defects across 3 inspections over the past 6 months:\n\n**Fan Blade Leading Edge Erosion** — Detected in INS-2024-0847, INS-2024-0723, and INS-2024-0651. Progressive erosion on Blades 07 and 12, Stage 2-3 Fan Section. Severity has escalated from minor → moderate → critical.\n\n**Recommendation:** The erosion rate of 2.3mm/1000 FH exceeds the serviceable limit defined in CMM 72-00-00. Blade 07 should be removed from service per AC 33.27. Blade 12 should be scheduled for replacement at the next shop visit.\n\n**Cost Impact:** Estimated $86,700 for both blade replacements, including labor. Current parts availability: CFM56-5B-B21370 — 2 units in stock.', citations: [{ label: 'Report #2847', type: 'report' }, { label: 'FAA AC 33.27', type: 'regulation' }, { label: 'CMM 72-00-00', type: 'manual' }] },
];

export const useAssistantStore = create<AssistantState>()((set, get) => ({
  messages: initialMessages,
  isStreaming: false,
  hasUserSent: false,
  setIsStreaming: (isStreaming) => set({ isStreaming }),

  addUserMessage: (content) => {
    const id = Date.now().toString();
    set((s) => ({ hasUserSent: true, messages: [...s.messages, { id, role: 'user', content }] }));
  },

  simulateResponse: (content, citations) => {
    const id = (Date.now() + 1).toString();
    // Add empty streaming message
    set((s) => ({
      isStreaming: true,
      messages: [...s.messages, { id, role: 'assistant', content: '', isStreaming: true }],
    }));

    // Fast typewriter: 8 chars every 12ms (like ChatGPT)
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 8;
      if (charIndex >= content.length) {
        clearInterval(interval);
        set((s) => ({
          isStreaming: false,
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, content, citations, isStreaming: false } : m
          ),
        }));
      } else {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, content: content.slice(0, charIndex) } : m
          ),
        }));
      }
    }, 12);
  },
}));

