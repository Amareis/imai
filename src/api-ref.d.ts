// =============================================================================
// IMAI API — Interface for Model
// =============================================================================
// This file defines ALL interfaces, types, and globals available to the model.
// The model sees this file + current context state.
// =============================================================================

// === Globals ===

declare const ctx: Context;
declare const respond: (text: string) => void;
declare const sleep: (trigger: Trigger) => void;
declare const log: (action: string, details?: Record<string, unknown>) => void;

// === Constructors ===

declare const MessageObject: {
  new (role: MessageRole, content: string): MessageObject;
};

declare const DecisionObject: {
  new (decision: string, alternatives?: string[]): DecisionObject;
};

declare const ThinkingObject: {
  new (content: string, context?: string): ThinkingObject;
};

declare const DataObject: {
  new (data: unknown, schema?: Record<string, unknown>): DataObject;
};

declare const WaitObject: {
  new (trigger: Trigger): WaitObject;
};

// === Types ===

type MessageRole = "user" | "assistant" | "system";
type Phase = "planning" | "implementation" | "testing" | "done";
type Status = "idle" | "in_progress" | "blocked" | "waiting";
type TriggerType = "user_input" | "cron" | "webhook" | "internal";

type LinkType =
  | "answers"
  | "explains"
  | "context_for"
  | "decision_about"
  | "supersedes"
  | "depends_on"
  | "references";

interface Trigger {
  type: TriggerType;
  schedule?: string;
  path?: string;
  condition?: string;
}

interface ContextStats {
  objectCount: number;
  charCount: number;
  pinnedCount: number;
  checkpointCount: number;
}

// === Context ===

interface Context {
  append(obj: BaseObject): void;
  get(id: string): BaseObject | undefined;
  query(fn: (obj: BaseObject) => boolean): BaseObject[];
  remove(id: string): boolean;
  link(fromId: string, toId: string, type: LinkType): boolean;
  getTaskContext(): TaskContext | undefined;
  getActionLog(): ActionLog | undefined;
  checkpoint(summary: string, range?: [number, number]): CheckpointObject;
  stats(): ContextStats;
  all(): BaseObject[];
}

// === TaskContext ===

interface TaskContext {
  readonly task: string;
  readonly phase: Phase;
  readonly status: Status;
  readonly todos: TodoItem[];
  readonly decisions: DecisionRef[];
  readonly extra: Record<string, unknown>;

  setTask(text: string): void;
  setPhase(phase: Phase): void;
  setStatus(status: Status): void;
  addTodo(text: string): string;
  completeTodo(index: number): void;
  removeTodo(index: number): void;
  addDecision(summary: string, objectId: string): void;
  supersedeDecision(objectId: string, newObjectId: string): void;
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  has(key: string): boolean;
  delete(key: string): boolean;
}

interface TodoItem {
  text: string;
  completed: boolean;
  createdAt: string;
}

interface DecisionRef {
  summary: string;
  objectId: string;
  createdAt: string;
  superseded: boolean;
}

// === ActionLog ===

interface ActionLog {
  append(
    action: string,
    target?: string,
    details?: Record<string, unknown>,
  ): void;
  read(last?: number): ActionLogEntry[];
  clear(): void;
}

interface ActionLogEntry {
  timestamp: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
}

// === BaseObject ===

interface BaseObject {
  readonly id: string;
  readonly type: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags: string[];
  readonly pinned: boolean;
  readonly links: Link[];

  tag(...tags: string[]): void;
  untag(tag: string): void;
  pin(): void;
  unpin(): void;
  linkTo(targetId: string, relationType: LinkType): void;
  unlink(targetId: string, relationType?: LinkType): void;
  render(): string;
}

interface Link {
  targetId: string;
  relationType: LinkType;
  createdAt: string;
}

// === MessageObject ===

interface MessageObject extends BaseObject {
  readonly type: "message";
  readonly role: MessageRole;
  readonly content: string;
  readonly status: "pending" | "processing" | "resolved";

  edit(newContent: string): void;
  append(text: string): void;
  resolve(): void;
  archive(): void;
}

// === DecisionObject ===

interface DecisionObject extends BaseObject {
  readonly type: "decision";
  readonly decision: string;
  readonly alternatives: string[];
  readonly status: "active" | "superseded" | "reverted";
  readonly supersededBy: string | null;

  supersede(newDecisionId: string): void;
  revert(): void;
  reactivate(): void;
  addAlternative(alt: string): void;
}

// === ThinkingObject ===

interface ThinkingObject extends BaseObject {
  readonly type: "thinking";
  readonly content: string;
  readonly context: string | null;

  append(text: string): void;
  replace(newContent: string): void;
}

// === DataObject ===

interface DataObject extends BaseObject {
  readonly type: "data";
  readonly data: unknown;
  readonly schema?: Record<string, unknown>;

  query(fn: (item: unknown) => boolean): unknown[];
  filter(fn: (item: unknown) => boolean): DataObject;
  transform(fn: (data: unknown) => unknown): DataObject;
  set(newData: unknown): void;
  setSchema(schema: Record<string, unknown>): void;
}

// === WaitObject ===

interface WaitObject extends BaseObject {
  readonly type: "wait";
  readonly trigger: Trigger;
  readonly triggered: boolean;

  cancel(): void;
  peek(): boolean;
  modifyTrigger(newTrigger: Trigger): void;
  markTriggered(): void;
  isActive(): boolean;
}

// === CheckpointObject ===

interface CheckpointObject extends BaseObject {
  readonly type: "checkpoint";
  readonly summary: string;
  readonly coversIds: string[];
  readonly canExpand: boolean;

  updateSummary(newSummary: string): void;
  addObjectId(id: string): void;
  removeObjectId(id: string): void;
  setExpandable(canExpand: boolean): void;
}
