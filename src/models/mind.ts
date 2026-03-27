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

  override renderForModel(): string {
    return `=== MIND ===\n${this.content.trim() || "(empty)"}`;
  }

  override getAPI(): Record<string, unknown> {
    return {
      setContent: this.setContent.bind(this),
      append: this.append.bind(this),
      clear: this.clear.bind(this),
    };
  }
}
