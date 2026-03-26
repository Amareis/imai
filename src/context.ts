import { BaseObject } from "./objects/base.ts";
import { MessageObject } from "./objects/message.ts";
import { DashboardObject } from "./objects/dashboard.ts";
import { ActionLogObject } from "./objects/action_log.ts";
import { ThinkingObject } from "./objects/thinking.ts";
import { DecisionObject } from "./objects/decision.ts";
import { WaitObject } from "./objects/wait.ts";
import { CheckpointObject } from "./objects/checkpoint.ts";
import { DataObject } from "./objects/data.ts";
import type {
  BaseObjectData,
  ObjectType,
  LinkType,
  ContextStats,
} from "./types.ts";

type ObjectMap = Map<string, BaseObject>;

export class Context {
  private objects: ObjectMap;
  private dashboard: DashboardObject | null;
  private actionLog: ActionLogObject | null;

  constructor() {
    this.objects = new Map();
    this.dashboard = null;
    this.actionLog = null;
  }

  append(obj: BaseObject): void {
    this.objects.set(obj.id, obj);
    if (obj instanceof DashboardObject) {
      this.dashboard = obj;
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
      if (obj instanceof DashboardObject) {
        this.dashboard = null;
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

  getDashboard(): DashboardObject | undefined {
    return this.dashboard ?? undefined;
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

  clear(): void {
    this.objects.clear();
    this.dashboard = null;
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
      return MessageObject.fromJSON(data as any);
    case "dashboard":
      return DashboardObject.fromJSON(data as any);
    case "action_log":
      return ActionLogObject.fromJSON(data as any);
    case "thinking":
      return ThinkingObject.fromJSON(data as any);
    case "decision":
      return DecisionObject.fromJSON(data as any);
    case "wait":
      return WaitObject.fromJSON(data as any);
    case "checkpoint":
      return CheckpointObject.fromJSON(data as any);
    case "data":
      return DataObject.fromJSON(data as any);
    default:
      return null;
  }
}

export {
  BaseObject,
  MessageObject,
  DashboardObject,
  ActionLogObject,
  ThinkingObject,
  DecisionObject,
  WaitObject,
  CheckpointObject,
  DataObject,
};
