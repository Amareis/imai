import { makeAutoObservable } from "mobx";
import OpenAI from "openai";
import { Session, SessionManager } from "./session.ts";
import { MindPanel } from "./models/mind.ts";
import { ChatPanel } from "./models/chat.ts";

type DeltaWithReasoning =
  & OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta
  & {
    reasoning_content?: string;
  };

export class Store {
  session: Session | undefined;
  input: string = "";
  output: string = "";
  thinking: string = "";
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

  get contextLines(): string[] {
    if (!this.session) return ["No session"];
    return this.session.renderForModel().split("\n");
  }

  async init() {
    this.setStatus("Loading...");

    try {
      this.session = await Session.create();
      this.addLog("New session");

      this.setStatus("Ready");
    } catch (err) {
      this.setError((err as Error).message);
    }
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

  appendOutput(text: string) {
    this.output += text;
  }

  setThinking(text: string) {
    this.thinking = text;
  }

  clearOutput() {
    this.output = "";
    this.thinking = "";
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
  }

  toggleLogs() {
    this.logVisible = !this.logVisible;
  }

  async sendMessage(text: string) {
    if (!this.chat || !text.trim()) return;

    this.chat.add("user", text.trim());
    this.addLog(`USER: ${text.trim().slice(0, 30)}...`);
    await this.manager.save();
    this.input = "";
  }

  async executeCode(code: string) {
    if (!code.trim() || !this.session) return;

    this.clearError();
    this.setStatus("Running...");
    this.addLog(`> ${code.slice(0, 40)}...`);

    try {
      const mind = this.mind;
      const chat = this.chat;

      const fn = new Function(
        "mind",
        "chat",
        "respond",
        "log",
        code,
      );

      fn(
        mind,
        chat,
        (text: string) => {
          this.appendOutput(`\n[RESPONSE] ${text}\n`);
          this.addLog(`RESP: ${text.slice(0, 30)}...`);
        },
        (action: string, details?: Record<string, unknown>) => {
          this.addLog(
            `LOG: ${action} ${details ? JSON.stringify(details) : ""}`,
          );
        },
      );

      await this.manager.save();
      this.addLog("OK");
      this.setStatus("Ready");
      this.input = "";
    } catch (err) {
      this.setError((err as Error).message);
      this.appendOutput(`\n[ERROR] ${(err as Error).message}\n`);
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
    this.clearOutput();
    this.addLog("Calling AI...");

    const systemPrompt = this.session.renderForModel();

    try {
      const stream = await this.openai.chat.completions.create({
        model: "glm-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Do." },
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
          this.setThinking(thinking);
        } else {
          const content = delta?.content || "";
          code += content;
          this.appendOutput(content);
        }
      }

      this.addLog("Stream done");
      this.setStatus("Ready");

      const cleanCode = this.extractCode(code);
      if (cleanCode) {
        this.appendOutput("\n\n--- Executing ---\n");
        await this.executeCode(cleanCode);
      }
    } catch (err) {
      this.setError((err as Error).message);
      this.appendOutput(`\n[ERROR] ${(err as Error).message}\n`);
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
}

export const store = new Store();
