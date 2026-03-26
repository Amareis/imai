import { BaseObject } from "./base.ts";
import type { ActionLogObjectData, ActionLogEntry } from "../types.ts";

export class ActionLogObject extends BaseObject {
  entries: ActionLogEntry[];
  private maxEntries: number;

  constructor(id?: string, maxEntries: number = 1000) {
    super("action_log", id ?? "action_log");
    this.entries = [];
    this.maxEntries = maxEntries;
  }

  append(action: string, target?: string, details?: Record<string, unknown>): void {
    this.entries.push({
      timestamp: new Date().toISOString(),
      action,
      target,
      details,
    });
    if (this.entries.length > this.maxEntries) {
      const removed = this.entries.length - this.maxEntries;
      this.entries = this.entries.slice(removed);
    }
    this.touch();
  }

  read(last?: number): ActionLogEntry[] {
    if (last === undefined) {
      return [...this.entries];
    }
    return this.entries.slice(-last);
  }

  last(): ActionLogEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  clear(): void {
    this.entries = [];
    this.touch();
    this.recordHistory("cleared");
  }

  render(): string {
    const lines: string[] = [
      "┌─────────────────────────────────────────────────┐",
      "│ ACTION LOG                                       │",
      "├─────────────────────────────────────────────────┤",
    ];

    const recent = this.read(10);
    for (const entry of recent) {
      const time = this.formatTime(entry.timestamp);
      const action = entry.action.slice(0, 20);
      const target = entry.target ? ` → ${entry.target.slice(0, 10)}` : "";
      lines.push(`│ [${time}] ${action.padEnd(20)}${target.padEnd(12)}│`);
    }

    lines.push("└─────────────────────────────────────────────────┘");
    return lines.join("\n");
  }

  private formatTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  }

  toJSON(): ActionLogObjectData {
    return {
      id: this.id,
      type: "action_log",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      entries: this.entries,
    };
  }

  static fromJSON(data: ActionLogObjectData): ActionLogObject {
    const obj = new ActionLogObject(data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    obj.entries = data.entries;
    return obj;
  }
}
