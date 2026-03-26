// === Core Types ===

export type ObjectType =
  | "message"
  | "task_context"
  | "action_log"
  | "checkpoint"
  | "wait"
  | "thinking"
  | "decision"
  | "data";

export type LinkType =
  | "answers"
  | "explains"
  | "context_for"
  | "decision_about"
  | "supersedes"
  | "depends_on"
  | "references";

export type Phase = "planning" | "implementation" | "testing" | "done";
export type Status = "idle" | "in_progress" | "blocked" | "waiting";

export type TriggerType = "user_input" | "cron" | "webhook" | "internal";

// === Trigger ===

export interface Trigger {
  type: TriggerType;
  schedule?: string; // for cron
  path?: string; // for webhook
  condition?: string; // for internal
}

// === Link ===

export interface Link {
  targetId: string;
  relationType: LinkType;
  createdAt: string;
}

// === Base Object ===

export interface BaseObjectData {
  id: string;
  type: ObjectType;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  pinned: boolean;
  links: Link[];
  history: HistoryEntry[];
}

export interface HistoryEntry {
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
}

// === Message Object ===

export type MessageRole = "user" | "assistant" | "system";

export interface MessageObjectData extends BaseObjectData {
  type: "message";
  role: MessageRole;
  content: string;
  status: "pending" | "processing" | "resolved";
}

// === Task Context Object ===

export interface TaskContextData {
  task: string;
  phase: Phase;
  status: Status;
  lastWake: string | null;
  wakeReason: string | null;
  lastActivity: string;
  todos: TodoItem[];
  decisions: DecisionRef[];
  extra: Record<string, unknown>;
}

export interface TodoItem {
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface DecisionRef {
  summary: string;
  objectId: string;
  createdAt: string;
  superseded: boolean;
}

export interface TaskContextObjectData extends BaseObjectData {
  type: "task_context";
  data: TaskContextData;
}

// === Action Log Object ===

export interface ActionLogEntry {
  timestamp: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
}

export interface ActionLogObjectData extends BaseObjectData {
  type: "action_log";
  entries: ActionLogEntry[];
}

// === Checkpoint Object ===

export interface CheckpointObjectData extends BaseObjectData {
  type: "checkpoint";
  summary: string;
  coversIds: string[];
  canExpand: boolean;
}

// === Wait Object ===

export interface WaitObjectData extends BaseObjectData {
  type: "wait";
  trigger: Trigger;
  createdAt: string;
  triggered: boolean;
}

// === Thinking Object ===

export interface ThinkingObjectData extends BaseObjectData {
  type: "thinking";
  content: string;
  context: string | null;
}

// === Decision Object ===

export interface DecisionObjectData extends BaseObjectData {
  type: "decision";
  decision: string;
  alternatives: string[];
  status: "active" | "superseded" | "reverted";
  supersededBy: string | null;
}

// === Data Object ===

export interface DataObjectData extends BaseObjectData {
  type: "data";
  data: unknown;
  schema?: Record<string, unknown>;
}

// === Context Stats ===

export interface ContextStats {
  objectCount: number;
  charCount: number;
  pinnedCount: number;
  checkpointCount: number;
}

// === Wake Record ===

export interface WakeRecord {
  timestamp: string;
  trigger: Trigger;
  payload?: Record<string, unknown>;
}

// === Session ===

export interface Session {
  id: string;
  createdAt: string;
  contextPath: string;
  taskContextPath: string;
  actionLogPath: string;
  checkpointDir: string;
}
