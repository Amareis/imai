import { BaseObject } from "./base.ts";
import type {
  DashboardObjectData,
  DashboardData,
  Phase,
  Status,
  TodoItem,
  DecisionRef,
} from "../types.ts";

export class DashboardObject extends BaseObject {
  data: DashboardData;

  constructor(id?: string) {
    super("dashboard", id ?? "dashboard");
    this.data = {
      task: "",
      phase: "planning",
      status: "idle",
      lastWake: null,
      wakeReason: null,
      lastActivity: new Date().toISOString(),
      todos: [],
      decisions: [],
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

  addTodo(text: string): void {
    this.data.todos.push({
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    this.touch();
    this.recordHistory("todo_added", { text });
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

  update(fields: Partial<DashboardData>): void {
    Object.assign(this.data, fields);
    this.touch();
    this.recordHistory("updated", { fields: Object.keys(fields) });
  }

  render(): string {
    const lines: string[] = [
      "┌─────────────────────────────────────────────────┐",
      "│ DASHBOARD                                        │",
      "├─────────────────────────────────────────────────┤",
    ];

    // Task
    if (this.data.task) {
      lines.push(`│ Task: ${this.data.task.slice(0, 40).padEnd(40)}│`);
    }

    // Phase & Status
    lines.push(`│ Phase: ${this.data.phase.padEnd(10)} Status: ${this.data.status.padEnd(12)}│`);

    // Last wake
    if (this.data.lastWake) {
      const wakeAgo = this.formatTimeAgo(this.data.lastWake);
      lines.push(`│ Last wake: ${wakeAgo.padEnd(38)}│`);
    }

    // TODOs
    if (this.data.todos.length > 0) {
      lines.push("├─────────────────────────────────────────────────┤");
      lines.push("│ TODO:                                            │");
      for (let i = 0; i < Math.min(this.data.todos.length, 5); i++) {
        const todo = this.data.todos[i];
        const check = todo.completed ? "x" : " ";
        lines.push(`│   [${check}] ${todo.text.slice(0, 36).padEnd(36)}│`);
      }
    }

    // Decisions
    if (this.data.decisions.length > 0) {
      lines.push("├─────────────────────────────────────────────────┤");
      lines.push("│ Decisions:                                       │");
      const active = this.data.decisions.filter((d) => !d.superseded).slice(-3);
      for (const dec of active) {
        const text = dec.superseded ? `~~${dec.summary}~~` : dec.summary;
        lines.push(`│   • ${text.slice(0, 37).padEnd(37)}│`);
      }
    }

    lines.push("└─────────────────────────────────────────────────┘");
    return lines.join("\n");
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

  toJSON(): DashboardObjectData {
    return {
      id: this.id,
      type: "dashboard",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      data: this.data,
    };
  }

  static fromJSON(data: DashboardObjectData): DashboardObject {
    const obj = new DashboardObject(data.id);
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
