import { BaseObject } from "./objects/base.ts";
import { MessageObject } from "./objects/message.ts";
import { TaskContextObject } from "./objects/task_context.ts";
import { ActionLogObject } from "./objects/action_log.ts";
import { ThinkingObject } from "./objects/thinking.ts";
import { DecisionObject } from "./objects/decision.ts";
import { WaitObject } from "./objects/wait.ts";
import { CheckpointObject } from "./objects/checkpoint.ts";
import { DataObject } from "./objects/data.ts";
import type {
  BaseObjectData,
  LinkType,
  ContextStats,
} from "./types.ts";

type ObjectMap = Map<string, BaseObject>;

export class Context {
  private objects: ObjectMap;
  private taskContext: TaskContextObject | null;
  private actionLog: ActionLogObject | null;

  constructor() {
    this.objects = new Map();
    this.taskContext = null;
    this.actionLog = null;
  }

  append(obj: BaseObject): void {
    this.objects.set(obj.id, obj);
    if (obj instanceof TaskContextObject) {
      this.taskContext = obj;
    }
    if (obj instanceof ActionLogObject) {
      this.actionLog = obj;
    }
  }

  get(id: string): BaseObject | undefined {
    return this.objects.get(id);
  }

  query(fn: (obj: BaseObject) => boolean): BaseObject[] {
    const result: BaseObject[] = [];
    for (const obj of this.objects.values()) {
      if (fn(obj)) {
        result.push(obj);
      }
    }
    return result;
  }

  remove(id: string): boolean {
    const obj = this.objects.get(id);
    if (obj) {
      if (obj instanceof TaskContextObject) {
        this.taskContext = null;
      }
      if (obj instanceof ActionLogObject) {
        this.actionLog = null;
      }
      return this.objects.delete(id);
    }
    return false;
  }

  link(fromId: string, toId: string, type: LinkType): boolean {
    const from = this.objects.get(fromId);
    const to = this.objects.get(toId);
    if (from && to) {
      from.linkTo(toId, type);
      return true;
    }
    return false;
  }

  getTaskContext(): TaskContextObject | undefined {
    return this.taskContext ?? undefined;
  }

  getActionLog(): ActionLogObject | undefined {
    return this.actionLog ?? undefined;
  }

  checkpoint(summary: string, range?: [number, number]): CheckpointObject {
    let coversIds: string[];
    if (range) {
      const allIds = Array.from(this.objects.keys());
      coversIds = allIds.slice(range[0], range[1]);
    } else {
      coversIds = Array.from(this.objects.keys());
    }
    const cp = new CheckpointObject(summary, coversIds);
    this.append(cp);
    return cp;
  }

  stats(): ContextStats {
    let charCount = 0;
    let pinnedCount = 0;
    let checkpointCount = 0;

    for (const obj of this.objects.values()) {
      const json = JSON.stringify(obj.toJSON());
      charCount += json.length;
      if (obj.pinned) pinnedCount++;
      if (obj.type === "checkpoint") checkpointCount++;
    }

    return {
      objectCount: this.objects.size,
      charCount,
      pinnedCount,
      checkpointCount,
    };
  }

  all(): BaseObject[] {
    return Array.from(this.objects.values());
  }

  renderForModel(): string {
    const sections: string[] = [];
    const stats = this.stats();
    const actionLog = this.getActionLog();
    const recentActions = actionLog ? actionLog.read(10) : [];

    if (this.taskContext) {
      sections.push(this.taskContext.renderFull(stats, recentActions));
      sections.push("");
    }

    sections.push("═══════════════════════════════════════════════════════════════════════════");
    sections.push("CONTEXT OBJECTS");
    sections.push("═══════════════════════════════════════════════════════════════════════════\n");

    const objects = Array.from(this.objects.values()).filter(obj => 
      obj.type !== "taskContext" && obj.type !== "action_log"
    );

    if (objects.length === 0) {
      sections.push("(no objects yet)");
    } else {
      for (const obj of objects) {
        sections.push(this.renderObject(obj));
        sections.push("");
      }
    }

    return sections.join("\n");
  }

  private renderObject(obj: BaseObject): string {
    const lines: string[] = [];
    const pinIcon = obj.pinned ? "📌 " : "";
    const tags = obj.tags.length > 0 ? ` [${obj.tags.join(", ")}]` : "";

    lines.push(`┌─ ${obj.type.toUpperCase()} [${obj.id}] ${pinIcon}${tags}`);

    if (obj instanceof MessageObject) {
      lines.push(`│ Role: ${obj.role}  |  Status: ${obj.status}`);
      lines.push("│");
      const content = obj.content.length > 500 ? obj.content.slice(0, 500) + "..." : obj.content;
      for (const line of content.split("\n")) {
        lines.push(`│ ${line}`);
      }
    } else if (obj instanceof ThinkingObject) {
      lines.push(`│ Context: ${obj.context || "(none)"}`);
      lines.push("│");
      const content = obj.content.length > 300 ? obj.content.slice(0, 300) + "..." : obj.content;
      for (const line of content.split("\n")) {
        lines.push(`│ ${line}`);
      }
    } else if (obj instanceof DecisionObject) {
      lines.push(`│ Status: ${obj.status}`);
      if (obj.supersededBy) {
        lines.push(`│ Superseded by: ${obj.supersededBy}`);
      }
      lines.push("│");
      lines.push(`│ Decision: ${obj.decision}`);
      if (obj.alternatives.length > 0) {
        lines.push("│");
        lines.push("│ Alternatives:");
        for (const alt of obj.alternatives) {
          lines.push(`│   - ${alt}`);
        }
      }
    } else if (obj instanceof WaitObject) {
      lines.push(`│ Trigger: ${obj.trigger.type}`);
      if (obj.trigger.type === "cron") {
        lines.push(`│ Schedule: ${obj.trigger.schedule}`);
      } else if (obj.trigger.type === "webhook") {
        lines.push(`│ Path: ${obj.trigger.path}`);
      }
      lines.push(`│ Triggered: ${obj.triggered ? "yes" : "no"}`);
      lines.push(`│ Active: ${obj.isActive() ? "yes" : "no"}`);
    } else if (obj instanceof CheckpointObject) {
      lines.push(`│ Summary: ${obj.summary}`);
      lines.push(`│ Covers: ${obj.coversIds.length} objects`);
      lines.push(`│ Expandable: ${obj.canExpand ? "yes" : "no"}`);
    } else if (obj instanceof DataObject) {
      const preview = JSON.stringify(obj.data, null, 2);
      const truncated = preview.length > 500 ? preview.slice(0, 500) + "..." : preview;
      lines.push("│ Data:");
      for (const line of truncated.split("\n")) {
        lines.push(`│ ${line}`);
      }
    } else {
      lines.push(`│ (generic object)`);
    }

    if (obj.links.length > 0) {
      lines.push("│");
      lines.push("│ Links:");
      for (const link of obj.links) {
        lines.push(`│   → ${link.relationType}: ${link.targetId}`);
      }
    }

    lines.push("└─────────────────────────────────────────────────────────────────────────");
    return lines.join("\n");
  }

  clear(): void {
    this.objects.clear();
    this.taskContext = null;
    this.actionLog = null;
  }

  toJSON(): BaseObjectData[] {
    return Array.from(this.objects.values()).map((obj) => obj.toJSON());
  }

  static fromJSON(data: BaseObjectData[]): Context {
    const ctx = new Context();
    for (const objData of data) {
      const obj = deserializeObject(objData);
      if (obj) {
        ctx.append(obj);
      }
    }
    return ctx;
  }
}

function deserializeObject(data: BaseObjectData): BaseObject | null {
  switch (data.type) {
    case "message":
      // deno-lint-ignore no-explicit-any
      return MessageObject.fromJSON(data as any);
    case "task_context":
      // deno-lint-ignore no-explicit-any
      return TaskContextObject.fromJSON(data as any);
    case "action_log":
      // deno-lint-ignore no-explicit-any
      return ActionLogObject.fromJSON(data as any);
    case "thinking":
      // deno-lint-ignore no-explicit-any
      return ThinkingObject.fromJSON(data as any);
    case "decision":
      // deno-lint-ignore no-explicit-any
      return DecisionObject.fromJSON(data as any);
    case "wait":
      // deno-lint-ignore no-explicit-any
      return WaitObject.fromJSON(data as any);
    case "checkpoint":
      // deno-lint-ignore no-explicit-any
      return CheckpointObject.fromJSON(data as any);
    case "data":
      // deno-lint-ignore no-explicit-any
      return DataObject.fromJSON(data as any);
    default:
      return null;
  }
}

export {
  BaseObject,
  MessageObject,
  TaskContextObject,
  ActionLogObject,
  ThinkingObject,
  DecisionObject,
  WaitObject,
  CheckpointObject,
  DataObject,
};
