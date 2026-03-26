import { BaseObject } from "./base.ts";
import type { CheckpointObjectData } from "../types.ts";

export class CheckpointObject extends BaseObject {
  summary: string;
  coversIds: string[];
  canExpand: boolean;

  constructor(
    summary: string,
    coversIds: string[],
    canExpand: boolean = true,
    id?: string
  ) {
    super("checkpoint", id);
    this.summary = summary;
    this.coversIds = coversIds;
    this.canExpand = canExpand;
  }

  updateSummary(newSummary: string): void {
    this.summary = newSummary;
    this.touch();
    this.recordHistory("summary_updated");
  }

  addObjectId(id: string): void {
    if (!this.coversIds.includes(id)) {
      this.coversIds.push(id);
      this.touch();
      this.recordHistory("object_added", { id });
    }
  }

  removeObjectId(id: string): void {
    const idx = this.coversIds.indexOf(id);
    if (idx !== -1) {
      this.coversIds.splice(idx, 1);
      this.touch();
      this.recordHistory("object_removed", { id });
    }
  }

  setExpandable(canExpand: boolean): void {
    this.canExpand = canExpand;
    this.touch();
    this.recordHistory("expandable_set", { canExpand });
  }

  render(): string {
    const expandIcon = this.canExpand ? "📂" : "📦";
    const count = this.coversIds.length;
    return `[${this.id}] ${expandIcon} checkpoint (${count} objects): ${this.summary.slice(0, 40)}`;
  }

  toJSON(): CheckpointObjectData {
    return {
      id: this.id,
      type: "checkpoint",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      summary: this.summary,
      coversIds: this.coversIds,
      canExpand: this.canExpand,
    };
  }

  static fromJSON(data: CheckpointObjectData): CheckpointObject {
    const obj = new CheckpointObject(data.summary, data.coversIds, data.canExpand, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    return obj;
  }
}
