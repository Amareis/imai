import { BaseObject } from "./base.ts";
import type {
  TaskContextObjectData,
  TaskContextData,
  Phase,
  Status,
} from "../types.ts";

export class TaskContextObject extends BaseObject {
  data: TaskContextData;

  constructor(id?: string) {
    super("task_context", id ?? "task_context");
    this.data = {
      task: "",
      phase: "planning",
      status: "idle",
      lastWake: null,
      wakeReason: null,
      lastActivity: new Date().toISOString(),
      todos: [],
      decisions: [],
      extra: {},
    };
  }

  setTask(text: string): void {
    this.data.task = text;
    this.touch();
    this.recordHistory("task_set", { task: text });
  }

  setPhase(phase: Phase): void {
    const oldPhase = this.data.phase;
    this.data.phase = phase;
    this.touch();
    this.recordHistory("phase_changed", { from: oldPhase, to: phase });
  }

  setStatus(status: Status): void {
    const oldStatus = this.data.status;
    this.data.status = status;
    this.touch();
    this.recordHistory("status_changed", { from: oldStatus, to: status });
  }

  addTodo(text: string): string {
    const todo = {
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.data.todos.push(todo);
    this.touch();
    this.recordHistory("todo_added", { text });
    return String(this.data.todos.length - 1);
  }

  completeTodo(index: number): void {
    if (index >= 0 && index < this.data.todos.length) {
      this.data.todos[index].completed = true;
      this.touch();
      this.recordHistory("todo_completed", { index, text: this.data.todos[index].text });
    }
  }

  removeTodo(index: number): void {
    if (index >= 0 && index < this.data.todos.length) {
      const removed = this.data.todos.splice(index, 1);
      this.touch();
      this.recordHistory("todo_removed", { text: removed[0].text });
    }
  }

  addDecision(summary: string, objectId: string): void {
    this.data.decisions.push({
      summary,
      objectId,
      createdAt: new Date().toISOString(),
      superseded: false,
    });
    this.touch();
    this.recordHistory("decision_added", { summary });
  }

  supersedeDecision(objectId: string, newObjectId: string): void {
    const decision = this.data.decisions.find((d) => d.objectId === objectId);
    if (decision) {
      decision.superseded = true;
      this.touch();
      this.recordHistory("decision_superseded", { objectId, newObjectId });
    }
  }

  recordWake(trigger: string): void {
    this.data.lastWake = new Date().toISOString();
    this.data.wakeReason = trigger;
    this.data.lastActivity = this.data.lastWake;
    this.recordHistory("woke", { trigger });
  }

  set(key: string, value: unknown): void {
    this.data.extra[key] = value;
    this.touch();
    this.recordHistory("extra_set", { key });
  }

  get(key: string): unknown {
    return this.data.extra[key];
  }

  has(key: string): boolean {
    return key in this.data.extra;
  }

  delete(key: string): boolean {
    if (key in this.data.extra) {
      delete this.data.extra[key];
      this.touch();
      this.recordHistory("extra_deleted", { key });
      return true;
    }
    return false;
  }

  update(fields: Partial<TaskContextData>): void {
    if (fields.extra) {
      Object.assign(this.data.extra, fields.extra);
      delete fields.extra;
    }
    Object.assign(this.data, fields);
    this.touch();
    this.recordHistory("updated", { fields: Object.keys(fields) });
  }

  render(): string {
    const lines: string[] = [
      `TaskContext: ${this.data.task || "(not set)"}`,
      `  Phase: ${this.data.phase}  |  Status: ${this.data.status}`,
    ];

    if (this.data.todos.length > 0) {
      lines.push("  TODO:");
      for (let i = 0; i < this.data.todos.length; i++) {
        const todo = this.data.todos[i];
        const check = todo.completed ? "x" : " ";
        lines.push(`    [${check}] ${todo.text}`);
      }
    }

    if (this.data.decisions.length > 0) {
      lines.push("  Decisions:");
      for (const d of this.data.decisions.filter(d => !d.superseded).slice(-5)) {
        lines.push(`    • ${d.summary}`);
      }
    }

    if (Object.keys(this.data.extra).length > 0) {
      lines.push("  Extra:");
      for (const [key, value] of Object.entries(this.data.extra)) {
        lines.push(`    ${key}: ${JSON.stringify(value)}`);
      }
    }

    return lines.join("\n");
  }

  renderFull(stats: { objectCount: number; charCount: number; pinnedCount: number; checkpointCount: number }, recentActions: { timestamp: string; action: string; target?: string }[]): string {
    const sections: string[] = [];

    sections.push("═══════════════════════════════════════════════════════════════════════════");
    sections.push("TASK CONTEXT — Model State");
    sections.push("═══════════════════════════════════════════════════════════════════════════\n");

    sections.push("┌─ TIME & CLOCK ─────────────────────────────────────────────────────────┐");
    sections.push(`│ Now: ${new Date().toISOString()}`);
    sections.push(`│ Last wake: ${this.data.lastWake ? this.formatTimeAgo(this.data.lastWake) : "never"}`);
    sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");

    sections.push("┌─ TASK STATE ───────────────────────────────────────────────────────────┐");
    sections.push(`│ Task: ${this.data.task || "(not set)"}`);
    sections.push(`│ Phase: ${this.data.phase}  |  Status: ${this.data.status}`);
    sections.push(`│ Last activity: ${this.formatTimeAgo(this.data.lastActivity)}`);
    sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");

    sections.push("┌─ CONTEXT STATS ────────────────────────────────────────────────────────┐");
    sections.push(`│ Objects: ${stats.objectCount}  |  Chars: ${stats.charCount}  |  Pinned: ${stats.pinnedCount}  |  Checkpoints: ${stats.checkpointCount}`);
    sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");

    sections.push("┌─ TODO ─────────────────────────────────────────────────────────────────┐");
    if (this.data.todos.length === 0) {
      sections.push("│ (empty)");
    } else {
      for (let i = 0; i < this.data.todos.length; i++) {
        const todo = this.data.todos[i];
        const check = todo.completed ? "✓" : "○";
        sections.push(`│ ${check} [${i}] ${todo.text}`);
      }
    }
    sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");

    sections.push("┌─ DECISIONS ────────────────────────────────────────────────────────────┐");
    const activeDecisions = this.data.decisions.filter(d => !d.superseded);
    const supersededDecisions = this.data.decisions.filter(d => d.superseded);
    if (activeDecisions.length === 0 && supersededDecisions.length === 0) {
      sections.push("│ (empty)");
    } else {
      for (const d of activeDecisions.slice(-5)) {
        sections.push(`│ ✓ ${d.summary}`);
      }
      if (supersededDecisions.length > 0) {
        sections.push("│");
        for (const d of supersededDecisions.slice(-3)) {
          sections.push(`│ ✗ ~~${d.summary}~~ (superseded)`);
        }
      }
    }
    sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");

    if (Object.keys(this.data.extra).length > 0) {
      sections.push("┌─ EXTRA ────────────────────────────────────────────────────────────────┐");
      for (const [key, value] of Object.entries(this.data.extra)) {
        const str = typeof value === "string" ? value : JSON.stringify(value);
        sections.push(`│ ${key}: ${str.slice(0, 60)}`);
      }
      sections.push("└─────────────────────────────────────────────────────────────────────────┘\n");
    }

    sections.push("┌─ ACTION LOG (last 5) ──────────────────────────────────────────────────┐");
    if (recentActions.length === 0) {
      sections.push("│ (empty)");
    } else {
      for (const a of recentActions.slice(-5)) {
        const time = new Date(a.timestamp).toLocaleTimeString("en-GB");
        const target = a.target ? ` → ${a.target}` : "";
        sections.push(`│ [${time}] ${a.action}${target}`);
      }
    }
    sections.push("└─────────────────────────────────────────────────────────────────────────┘");

    return sections.join("\n");
  }

  private formatTimeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  override toJSON(): TaskContextObjectData {
    return {
      id: this.id,
      type: "task_context",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      data: this.data,
    };
  }

  static override fromJSON(data: TaskContextObjectData): TaskContextObject {
    const obj = new TaskContextObject(data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    obj.data = data.data;
    return obj;
  }
}
