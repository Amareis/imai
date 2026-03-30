// =============================================================================
// IMAI API — Interface for Model
// =============================================================================

// === Globals ===

declare const mind: MindPanel;
declare const chat: ChatPanel;
declare const respond: (text: string) => void;
declare const log: (action: string, details?: Record<string, unknown>) => void;

// === MindPanel ===

interface MindPanel {
  content: string;
  setContent(text: string): void;
  append(text: string): void;
  clear(): void;
}

// === ChatPanel ===

interface ChatPanel {
  messages: Message[];
  hasNew: boolean;
  add(from: string, content: string): void;
  markRead(): void;
  clear(): void;
}

interface Message {
  id: string;
  from: string;
  content: string;
  createdAt: string;
}
