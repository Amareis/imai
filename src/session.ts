import { ensureDirSync } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { Context, DashboardObject, ActionLogObject } from "./context.ts";
import type { Session, WakeRecord } from "./types.ts";

const SESSIONS_DIR = `${Deno.env.get("HOME")}/.imai/sessions`;

export class SessionManager {
  private session: Session | null;
  private context: Context | null;

  constructor() {
    this.session = null;
    this.context = null;
  }

  async create(task?: string): Promise<Session> {
    const id = `session_${Date.now()}`;
    const sessionDir = `${SESSIONS_DIR}/${id}`;
    
    ensureDirSync(sessionDir);
    ensureDirSync(`${sessionDir}/checkpoint`);

    const session: Session = {
      id,
      createdAt: new Date().toISOString(),
      contextPath: `${sessionDir}/context.json`,
      dashboardPath: `${sessionDir}/dashboard.json`,
      actionLogPath: `${sessionDir}/action-log.json`,
      checkpointDir: `${sessionDir}/checkpoint`,
    };

    this.session = session;
    this.context = new Context();

    const dashboard = new DashboardObject();
    if (task) {
      dashboard.setTask(task);
    }
    this.context.append(dashboard);

    const actionLog = new ActionLogObject();
    this.context.append(actionLog);

    await this.save();

    return session;
  }

  async load(sessionId: string): Promise<Session | null> {
    const sessionDir = `${SESSIONS_DIR}/${sessionId}`;
    
    try {
      const contextData = JSON.parse(await Deno.readTextFile(`${sessionDir}/context.json`));
      this.context = Context.fromJSON(contextData);
      
      this.session = {
        id: sessionId,
        createdAt: "",
        contextPath: `${sessionDir}/context.json`,
        dashboardPath: `${sessionDir}/dashboard.json`,
        actionLogPath: `${sessionDir}/action-log.json`,
        checkpointDir: `${sessionDir}/checkpoint`,
      };

      return this.session;
    } catch {
      return null;
    }
  }

  async save(): Promise<void> {
    if (!this.session || !this.context) return;

    const contextData = JSON.stringify(this.context.toJSON(), null, 2);
    await Deno.writeTextFile(this.session.contextPath, contextData);
  }

  getContext(): Context | undefined {
    return this.context ?? undefined;
  }

  getSession(): Session | undefined {
    return this.session ?? undefined;
  }

  getDashboard(): DashboardObject | undefined {
    return this.context?.getDashboard();
  }

  getActionLog(): ActionLogObject | undefined {
    return this.context?.getActionLog();
  }

  async recordWake(trigger: WakeRecord): Promise<void> {
    if (!this.session || !this.context) return;

    const dashboard = this.getDashboard();
    if (dashboard) {
      dashboard.recordWake(trigger.trigger.type);
    }

    const actionLog = this.getActionLog();
    if (actionLog) {
      actionLog.append("wake", undefined, { trigger });
    }

    await this.save();
  }

  async list(): Promise<string[]> {
    try {
      const entries = [];
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

  async delete(sessionId: string): Promise<boolean> {
    const sessionDir = `${SESSIONS_DIR}/${sessionId}`;
    try {
      await Deno.remove(sessionDir, { recursive: true });
      if (this.session?.id === sessionId) {
        this.session = null;
        this.context = null;
      }
      return true;
    } catch {
      return false;
    }
  }
}
