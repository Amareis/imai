import {
  ExtendedModel,
  idProp,
  Model,
  model,
  modelAction,
  prop,
} from "mobx-keystone";
import { BasePanel } from "./panel.ts";

@model("imai/Message")
export class Message extends Model({
  id: idProp,
  from: prop<string>(),
  content: prop<string>(),
  timestamp: prop<string>(),
}) {
  render(): string {
    return `[${this.from}] ${this.content}`;
  }
}

@model("imai/ChatPanel")
export class ChatPanel extends ExtendedModel(BasePanel, {
  messages: prop<Message[]>(() => []),
  hasNew: prop<boolean>(() => false),
}) {
  @modelAction
  add(from: string, content: string) {
    const msg = new Message({
      id: `msg_${Date.now()}`,
      from,
      content,
      timestamp: new Date().toISOString(),
    });
    this.messages.push(msg);
    this.hasNew = true;
    return msg;
  }

  @modelAction
  markRead() {
    this.hasNew = false;
  }

  @modelAction
  clear() {
    this.messages = [];
    this.hasNew = false;
  }

  override renderForModel(): string {
    const newFlag = this.hasNew ? " [NEW]" : "";
    if (this.state === "minimized" || this.messages.length === 0) {
      return `[CHAT: ${this.messages.length} messages${newFlag}]`;
    }
    const lines = this.messages.map((m) => m.render());
    return `=== CHAT ===${newFlag}\n${lines.join("\n")}`;
  }

  override getAPI(): Record<string, unknown> {
    return {
      add: this.add.bind(this),
      markRead: this.markRead.bind(this),
      clear: this.clear.bind(this),
    };
  }
}
