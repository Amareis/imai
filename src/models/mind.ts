import { ExtendedModel, model, modelAction, prop } from "mobx-keystone";
import { BasePanel } from "./panel.ts";

@model("imai/MindPanel")
export class MindPanel extends ExtendedModel(BasePanel, {
  content: prop<string>(() => ""),
}) {
  @modelAction
  setContent(text: string) {
    this.content = text;
  }

  @modelAction
  append(text: string) {
    this.content = this.content ? this.content + "\n" + text : text;
  }

  @modelAction
  clear() {
    this.content = "";
  }

  override get text(): string {
    const content = this.content.trim();
    if (this.isMinimized) {
      const lines = this.content.split("\n").length;
      return `${lines} lines, probably you need to expand it!`;
    }
    return content || "(empty)";
  }

  override getAPI(): Record<string, unknown> {
    return {
      setContent: this.setContent.bind(this),
      append: this.append.bind(this),
      clear: this.clear.bind(this),
    };
  }
}
