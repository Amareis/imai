import type { BaseObjectData, Link, LinkType, HistoryEntry } from "../types.ts";

let objectCounter = 0;

export abstract class BaseObject {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  pinned: boolean;
  links: Link[];
  history: HistoryEntry[];

  constructor(type: string, id?: string) {
    this.id = id ?? `${type}_${Date.now()}_${++objectCounter}`;
    this.type = type;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.tags = [];
    this.pinned = false;
    this.links = [];
    this.history = [];
  }

  tag(...tags: string[]): void {
    for (const t of tags) {
      if (!this.tags.includes(t)) {
        this.tags.push(t);
      }
    }
    this.touch();
    this.recordHistory("tagged", { tags });
  }

  untag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.touch();
    this.recordHistory("untagged", { tag });
  }

  pin(): void {
    this.pinned = true;
    this.touch();
    this.recordHistory("pinned");
  }

  unpin(): void {
    this.pinned = false;
    this.touch();
    this.recordHistory("unpinned");
  }

  linkTo(targetId: string, relationType: LinkType): void {
    if (!this.links.some((l) => l.targetId === targetId && l.relationType === relationType)) {
      this.links.push({
        targetId,
        relationType,
        createdAt: new Date().toISOString(),
      });
      this.touch();
      this.recordHistory("linked", { targetId, relationType });
    }
  }

  unlink(targetId: string, relationType?: LinkType): void {
    this.links = this.links.filter((l) =>
      relationType
        ? !(l.targetId === targetId && l.relationType === relationType)
        : l.targetId !== targetId
    );
    this.touch();
    this.recordHistory("unlinked", { targetId, relationType });
  }

  protected touch(): void {
    this.updatedAt = new Date().toISOString();
  }

  protected recordHistory(action: string, details?: Record<string, unknown>): void {
    this.history.push({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
  }

  abstract toJSON(): BaseObjectData;
  abstract render(): string;

  static fromJSON(_data: BaseObjectData): BaseObject {
    throw new Error("fromJSON must be implemented by subclass");
  }
}
