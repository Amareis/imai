import { makeAutoObservable } from "mobx";
import OpenAI from "openai";
import { type Session, SessionManager } from "./session.ts";
import { MindPanel } from "./models/mind.ts";
import { ChatPanel } from "./models/chat.ts";
import _ from "lodash";

type DeltaWithReasoning =
  & OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta
  & {
    reasoning_content?: string;
  };

export class Store {
  session: Session | null = null;
  input: string = "";
  error: string = "";
  status: string = "Ready";
  isLoading: boolean = false;
  logs: string[] = [];
  debugMode: boolean = false;
  logVisible: boolean = false;

  private manager: SessionManager;
  private openai: OpenAI | null = null;

  constructor() {
    makeAutoObservable(this);
    this.manager = new SessionManager();

    const apiKey = Deno.env.get("IMAI_API_TOKEN");
    const baseURL = Deno.env.get("IMAI_API_URL");

    if (apiKey && baseURL) {
      this.openai = new OpenAI({
        apiKey,
        baseURL,
      });
    }
  }

  get mind() {
    return this.session?.tryGetPanel(MindPanel, "main");
  }

  get chat() {
    return this.session?.tryGetPanel(ChatPanel, "default");
  }

  get text(): string {
    if (!this.session) return "No session";
    return this.session.renderForModel();
  }

  async init() {
    this.setStatus("Loading...");

    try {
      const list = await this.manager.list();

      if (list.length > 0) {
        this.session = await this.manager.load(list[0]);
      }

      if (!this.session) {
        await this.createSession();
      }

      this.setStatus("Ready");
    } catch (err) {
      this.setError((err as Error).message);
    }
  }

  async createSession() {
    this.session = await this.manager.create();

    await this.sendMessage(`Приветствую!
Ты сейчас управляешь специальным агентским фреймворком на котором я проверяю свою идею.
Ключевое отличие от стандартного флоу чатбота - ты не видишь свои предыдушие сообщения!
Ты увидишь только то что ты явно сохранишь в доступные тебе панели chat/mind.
Но при этом ты можешь (и должен) явно управлять состоянием своего контекста - открывать/закрывать панели, 
менеджить их так, чтобы при следующем запросе увидеть корректное состояние задачи и понимать свои следующие шаги.
Теоретически это должно дать тебе возможность работать со сколь угодно большим контекстом неограниченное время,
Похоже на то как люди работают за компьютером - открывают кучу окон с кучей вкладок 
и переключаются между ними по необходимости (уведомлениям), при этом храня в голове текущую задач и шаги выполнения.
`);

    this.addLog("New session");
  }

  setInput(value: string) {
    this.input = value;
  }

  setStatus(value: string) {
    this.status = value;
  }

  setError(value: string) {
    this.error = value;
    this.addLog(`ERR: ${value}`);
  }

  clearError() {
    this.error = "";
  }

  addLog(message: string) {
    const time = new Date().toLocaleTimeString("en-GB");
    this.logs.push(`[${time}] ${message}`);
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  toggleDebug() {
    if (this.logVisible) {
      this.logVisible = false;
    } else {
      this.debugMode = !this.debugMode;
    }
  }

  toggleLogs() {
    this.logVisible = !this.logVisible;
  }

  async sendMessage(text: string) {
    if (!this.chat || !text.trim()) return;

    this.chat.add("user", text.trim());
    this.addLog(`USER: ${text.trim().slice(0, 30)}...`);
    await this.manager.save();
  }

  async executeCode(code: string) {
    if (!code.trim() || !this.session) return;

    this.clearError();
    this.setStatus("Running...");
    this.addLog(`> ${code.slice(0, 40)}...`);

    try {
      const mind = this.mind;
      const chat = this.chat;

      const AsyncFunction =
        Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction(
        "mind",
        "chat",
        code,
      );

      await fn(
        mind,
        chat,
      );

      await this.manager.save();
      this.addLog("OK");
      this.setStatus("Ready");
    } catch (err) {
      this.setError((err as Error).message);
    }
  }

  async callAI() {
    if (!this.openai) {
      this.setError("OpenAI not configured");
      return;
    }

    if (!this.session) {
      this.setError("No session");
      return;
    }

    this.isLoading = true;
    this.setStatus("AI...");
    this.addLog("Calling AI...");

    const [system, user] = _.partition(this.session.panels, (p) => p.system);

    try {
      const stream = await this.openai.chat.completions.create({
        model: "glm-5",
        messages: [
          ...system.map((p) => ({
            role: "system",
            content: p.renderForModel(),
          } as const)),
          {
            role: "user",
            content: "[FAKE MESSAGE TO FULFILL API REQUIREMENtS]",
          },
          ...user.map((p) => ({
            role: "assistant",
            content: p.renderForModel(),
          } as const)),
        ],

        temperature: 0.7,
        max_tokens: 10000,
        stream: true,
      });

      let code = "";
      let thinking = "";

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;
        const delta = choice.delta as DeltaWithReasoning;

        if (delta.reasoning_content) {
          thinking += delta.reasoning_content;
        }

        if (delta.content) {
          if (thinking) {
            this.addLog("[think] " + thinking);
            thinking = "";
          }
          const content = delta?.content || "";
          code += content;
        }
      }

      this.addLog("Stream done");
      this.addLog("[code] " + code);
      this.setStatus("Ready");

      const cleanCode = this.extractCode(code);
      if (cleanCode) {
        this.addLog("\n\n--- Executing ---\n");
        await this.executeCode(cleanCode);
      }
    } catch (err) {
      this.setError((err as Error).message);
      this.addLog(`\n[ERROR] ${(err as Error).message}\n`);
    } finally {
      this.isLoading = false;
    }
  }

  extractCode(text: string): string {
    if (text.includes("```")) {
      const match = text.match(
        /```(?:typescript|ts|js|javascript)?\n?([\s\S]*?)```/,
      );
      if (match) {
        return match[1].trim();
      }
    }
    return text.trim();
  }

  async save() {
    await this.manager.save();
    this.addLog("Saved");
  }

  async removeSession() {
    if (!this.session) return;
    const { session } = this;
    this.session = null;
    await this.manager.removeSession(session.id);
  }

  readConsts() {
    this.session?.setConsts();
  }
}

export const store = new Store();
