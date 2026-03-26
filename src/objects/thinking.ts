import { BaseObject } from "./base.ts";
import type { ThinkingObjectData } from "../types.ts";

export class ThinkingObject extends BaseObject {
  content: string;
  context: string | null;

  constructor(content: string, context?: string, id?: string) {
    super("thinking", id);
    this.content = content;
    this.context = context ?? null;
  }

  append(text: string): void {
    this.content += "\n" + text;
    this.touch();
    this.recordHistory("appended", { length: text.length });
  }

  replace(newContent: string): void {
    const oldLen = this.content.length;
    this.content = newContent;
    this.touch();
    this.recordHistory("replaced", { oldLength: oldLen, newLength: newContent.length });
  }

  render(): string {
    const pinIcon = this.pinned ? "📌 " : "";
    const ctx = this.context ? ` [${this.context}]` : "";
    return `${pinIcon}[${this.id}] thinking${ctx}: ${this.content.slice(0, 100)}...`;
  }

  toJSON(): ThinkingObjectData {
    return {
      id: this.id,
      type: "thinking",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      content: this.content,
      context: this.context,
    };
  }

  static fromJSON(data: ThinkingObjectData): ThinkingObject {
    const obj = new ThinkingObject(data.content, data.context ?? undefined, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    return obj;
  }
}
