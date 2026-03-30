// =============================================================================
// IMAI API — Interface for Model
// =============================================================================

// === Globals ===

declare const mind: MindPanel;
declare const chat: ChatPanel;

type PanelState = "minimized" | "expanded";

interface BasePanel {
  readonly id: string;
  readonly slug: string;
  readonly state: PanelState;

  setState(s: PanelState): void;

  /** toggle state */
  toggle(): void;
}

// === MindPanel ===

interface MindPanel extends BasePanel {
  readonly content: string;
  setContent(text: string): void;
  append(text: string): void;
  clear(): void;
}

// === ChatPanel ===

interface ChatPanel extends BasePanel {
  readonly messages: Message[];
  readonly hasNew: boolean;
  add(from: string, content: string): void;
  markRead(): void;
  clear(): void;
}

interface Message {
  readonly id: string;
  readonly from: string;
  readonly content: string;
  readonly createdAt: string;
}
