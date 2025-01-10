'use client';

import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isConnected: boolean;
  isStreaming: boolean;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setIsConnected: (status: boolean) => void;
  setIsStreaming: (status: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isConnected: false,
  isStreaming: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),
  setIsConnected: (status) => set({ isConnected: status }),
  setIsStreaming: (status) => set({ isStreaming: status }),
}));