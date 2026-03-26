import { BaseObject } from "./base.ts";
import type { MessageObjectData, MessageRole, LinkType } from "../types.ts";

export class MessageObject extends BaseObject {
  role: MessageRole;
  content: string;
  status: "pending" | "processing" | "resolved";

  constructor(
    role: MessageRole,
    content: string,
    id?: string
  ) {
    super("message", id);
    this.role = role;
    this.content = content;
    this.status = "pending";
  }

  edit(newContent: string): void {
    const oldContent = this.content;
    this.content = newContent;
    this.touch();
    this.recordHistory("edited", { oldContent: oldContent.slice(0, 100) });
  }

  append(text: string): void {
    this.content += text;
    this.touch();
    this.recordHistory("appended", { length: text.length });
  }

  resolve(): void {
    this.status = "resolved";
    this.touch();
    this.recordHistory("resolved");
  }

  archive(): void {
    this.tag("archived");
    this.recordHistory("archived");
  }

  linkTo(targetId: string, relationType: LinkType): void {
    super.linkTo(targetId, relationType);
  }

  render(): string {
    const statusIcon = this.status === "resolved" ? "✓" : 
                       this.status === "processing" ? "⏳" : "○";
    const pinIcon = this.pinned ? "📌 " : "";
    const tags = this.tags.length > 0 ? ` [${this.tags.join(", ")}]` : "";
    
    return `${pinIcon}[${this.id}] ${statusIcon} ${this.role}: ${this.content.slice(0, 200)}${tags}`;
  }

  toJSON(): MessageObjectData {
    return {
      id: this.id,
      type: "message",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tags: this.tags,
      pinned: this.pinned,
      links: this.links,
      history: this.history,
      role: this.role,
      content: this.content,
      status: this.status,
    };
  }

  static fromJSON(data: MessageObjectData): MessageObject {
    const obj = new MessageObject(data.role, data.content, data.id);
    obj.createdAt = data.createdAt;
    obj.updatedAt = data.updatedAt;
    obj.tags = data.tags;
    obj.pinned = data.pinned;
    obj.links = data.links;
    obj.history = data.history;
    obj.status = data.status;
    return obj;
  }
}
