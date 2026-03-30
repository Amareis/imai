import {
  fromSnapshot,
  getSnapshot,
  Model,
  model,
  modelAction,
  type ModelClass,
  onPatches,
  prop,
  registerRootStore,
} from "mobx-keystone";
import { ensureDirSync } from "@std/fs";
import type { BasePanel } from "./models/panel.ts";
import { MindPanel } from "./models/mind.ts";
import { ChatPanel } from "./models/chat.ts";
import { TextPanel } from "./models/text.ts";

import apiRefText from "./res/api-ref.d.ts" with { type: "text" };
import systemPromptText from "./res/system-prompt.txt" with { type: "text" };

const SESSIONS_DIR = `${Deno.env.get("HOME")}/.imai/sessions`;

export interface SessionData {
  id: string;
  createdAt: string;
  panels: unknown[];
}

@model("imai/Session")
export class Session extends Model({
  id: prop<string>(),
  createdAt: prop<string>(() => new Date().toISOString()),
  panels: prop<BasePanel[]>(() => []),
}) {
  getPanel<T extends BasePanel>(
    panelClass: ModelClass<T>,
    slug: string,
  ): T {
    const p = this.tryGetPanel(panelClass, slug);
    if (!p) throw new Error(`Cannot find panel with slug '${slug}'`);
    return p;
  }

  tryGetPanel<T extends BasePanel>(
    panelClass: ModelClass<T>,
    slug: string,
  ): T | undefined {
    return this.panels.find(
      (p) => p instanceof panelClass && p.slug === slug,
    ) as T | undefined;
  }

  @modelAction
  registerPanel(panel: BasePanel) {
    const existing = this.panels.find((p) => p.slug === panel.slug);
    if (existing) {
      throw new Error(
        `Panel with slug ${panel.slug} already registered with type '${existing.$modelType}'`,
      );
    }
    this.panels.push(panel);
  }

  @modelAction
  unregisterPanel(slug: string) {
    this.panels = this.panels.filter((p) => p.slug !== slug);
  }

  setConsts() {
    this.getPanel(TextPanel, "system-prompt")?.setContent(systemPromptText);
    this.getPanel(TextPanel, "api-ref")?.setContent(apiRefText);
  }

  renderForModel(): string {
    return this.panels.map((p) => p.renderForModel()).join("\n\n");
  }

  static create(id?: string): Session {
    const sessionId = id ?? `session_${Date.now()}`;
    const session = new Session({
      id: sessionId,
    });
    registerRootStore(session);
    session.registerPanel(
      new TextPanel({ slug: "system-prompt", system: true }),
    );
    session.registerPanel(new MindPanel({ slug: "main" }));
    session.registerPanel(new ChatPanel({ slug: "default" }));
    session.registerPanel(new TextPanel({ slug: "api-ref" }));
    session.setConsts();
    return session;
  }

  static load(data: SessionData): Session {
    // deno-lint-ignore no-explicit-any
    const session = fromSnapshot<Session>(data as any);
    registerRootStore(session);
    return session;
  }

  toData(): SessionData {
    return getSnapshot(this) as SessionData;
  }
}

export class SessionManager {
  private session: Session | null = null;
  private sessionPath: string | null = null;

  async create(): Promise<Session> {
    const id = `session_${new Date().toISOString()}`;
    this.session = Session.create(id);
    this.sessionPath = `${SESSIONS_DIR}/${id}/session.json`;
    ensureDirSync(`${SESSIONS_DIR}/${id}`);
    await this.save();
    return this.session;
  }

  async load(sessionId: string): Promise<Session | null> {
    const path = `${SESSIONS_DIR}/${sessionId}/session.json`;
    try {
      const data = JSON.parse(await Deno.readTextFile(path));
      this.session = Session.load(data);
      this.sessionPath = path;
      return this.session;
    } catch {
      return null;
    }
  }

  async save(): Promise<void> {
    if (!this.session || !this.sessionPath) return;
    await Deno.writeTextFile(
      this.sessionPath,
      JSON.stringify(this.session.toData(), null, 2),
    );
  }

  getSession(): Session | undefined {
    return this.session ?? undefined;
  }

  async list(): Promise<string[]> {
    try {
      const entries: string[] = [];
      for await (const entry of Deno.readDir(SESSIONS_DIR)) {
        if (entry.isDirectory && entry.name.startsWith("session_")) {
          entries.push(entry.name);
        }
      }
      return entries.sort((a, b) => a < b ? -1 : 1).reverse();
    } catch {
      return [];
    }
  }

  watch(callback: (patches: unknown) => void): () => void {
    if (!this.session) return () => {};
    return onPatches(this.session, callback);
  }

  async removeSession(sessionId: string) {
    await Deno.remove(`${SESSIONS_DIR}/${sessionId}`, { recursive: true });
  }
}
