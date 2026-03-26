import { BaseObject } from "./base.ts";
import type { WaitObjectData, Trigger } from "../types.ts";

export class WaitObject extends BaseObject {
  trigger: Trigger;
  triggered: boolean;

  constructor(trigger: Trigger, id?: string) {
    super("wait", id);
    this.trigger = trigger;
    this.triggered = false;
  }

  cancel(): void {
    this.tag("cancelled");
    this.recordHistory("cancelled");
    this.touch();
  }

  peek(): boolean {
    if (this.trigger.type === "user_input") {
      return false;
    }
    if (this.trigger.type === "cron") {
      return false;
    }
    if (this.trigger.type === "webhook") {
      return false;
    }
    if (this.trigger.type === "internal") {
      return false;
    }
    return false;
  }

  modifyTrigger(newTrigger: Trigger): void {
    const oldType = this.trigger.type;
    this.trigger = newTrigger;
    this.touch();
    this.recordHistory("trigger_modified", { from: oldType, to: newTrigger.type });
  }

  markTriggered(): void {
    this.triggered = true;
    this.touch();
    this.recordHistory("triggered");
  }

  isActive(): boolean {
    return !this.triggered && !this.tags.includes("cancelled");
  }

  render(): string {
    const statusIcon = this.triggered ? "✓" : this.tags.includes("cancelled") ? "✗" : "⏳";
    const triggerInfo = this.renderTrigger();
    return `[${this.id}] ${statusIcon} wait: ${triggerInfo}`;
  }

  private renderTrigger(): string {
    switch (this.trigger.type) {
      case "user_input":
        return "user_input";
      case "cron":
        return `cron: ${this.trigger.schedule}`;
      case "webhook":
        return `webhook: ${this.trigger.path}`;
      case "internal":
        return `internal: ${this.trigger.condition}`;
    }
  }

  toJSON(): WaitObjectData {
    return {
      id: this.id,
      type: "wait",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      trigger: this.trigger,
      triggered: this.triggered,
    };
  }

  static override fromJSON(data: WaitObjectData): WaitObject {
    const obj = new WaitObject(data.trigger, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    obj.triggered = data.triggered;
    return obj;
  }
}
