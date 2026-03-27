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
    if (!this.panels.find((p) => p.slug === panel.slug)) {
      this.panels.push(panel);
    }
  }

  @modelAction
  unregisterPanel(slug: string) {
    this.panels = this.panels.filter((p) => p.slug !== slug);
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
    session.registerPanel(new MindPanel({ slug: "main" }));
    session.registerPanel(new ChatPanel({ slug: "default" }));
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
    const id = `session_${Date.now()}`;
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
      return entries.sort().reverse();
    } catch {
      return [];
    }
  }

  watch(callback: (patches: unknown) => void): () => void {
    if (!this.session) return () => {};
    return onPatches(this.session, callback);
  }
}
