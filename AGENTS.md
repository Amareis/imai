# IMAI — Inverted Model Agent Interface

> Инвертированный агент: модель управляет контекстом как пространством панелей

## Концепция

### Проблема

Текущие LLM-агенты работают в парадигме:
- Контекст = плоский список сообщений
- Модель = пассивный обработчик
- State = теряется между запросами
- Управление = внешний loop

### Решение

Инвертировать контроль:
- Контекст = пространство интерактивных панелей
- Модель = активный управляющий
- State = персистентный через mobx-keystone
- Управление = модель решает что делать

---

## Архитектура

### Два представления

```
┌─────────────────────────────────────────────────────────┐
│                    SESSION DATA                         │
│  (mobx-keystone models — единый источник правды)        │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│  HUMAN VIEW   │  │   MODEL VIEW     │
│  (TUI/Glyph)  │  │  (LLM Messages)  │
├───────────────┤  ├──────────────────┤
│ • Визуально   │  │ • Плоский текст  │
│ • Панели      │  │ • Для промпта    │
│ • Интерактив  │  │ • Для API        │
└───────────────┘  └──────────────────┘
```

**Human View** — TUI через Glyph:
- Панели в 2-3 колонки
- Сворачивание/разворачивание
- Debug mode (показать Model View)

**Model View** — то что уходит в LLM:
- Каждая панель рендерит себя в текст
- AgentState всегда первая, всегда развёрнута
- Остальные — collapsed/expanded по состоянию

---

## Панели

### Интерфейс панели

```typescript
interface Panel {
  readonly id: string;
  readonly title: string;
  readonly state: "minimized" | "preview" | "expanded";
  
  // Для модели (всегда обязателен)
  renderForModel(): string;
  
  // Для UI (опционально)
  renderForUI?(): ReactNode;
  
  // API для модели
  getAPI(): Record<string, Function>;
}
```

### BasePanel — базовый класс

```typescript
@model("imai/BasePanel")
class BasePanel extends Model({
  id: prop<string>(),
  title: prop<string>(),
  state: prop<"minimized" | "preview" | "expanded">("preview"),
}) {
  constructor(data: { id: string; title?: string }) {
    super(data);
    // Авто-регистрация в Session
    const session = getRootStore<Session>(this);
    session?.registerPanel(this);
  }
  
  abstract renderForModel(): string;
  abstract getAPI(): Record<string, Function>;
}
```

### Builtin панели

#### AgentStatePanel (несворачиваемая, всегда видима)

```typescript
@model("imai/AgentStatePanel")
class AgentStatePanel extends BasePanel {
  content: prop<string>("");
  
  renderForModel(): string {
    return `=== AGENT STATE ===\n${this.content}`;
  }
  
  getAPI() {
    return {
      setContent: (text: string) => this.content = text,
      append: (text: string) => this.content += "\n" + text,
    };
  }
}
```

Модель сама управляет содержимым — текст, который она видит каждый раз.

#### ChatPanel (сворачиваемая)

```typescript
@model("imai/ChatPanel")
class ChatPanel extends BasePanel {
  messages: prop<Message[]>(() => []);
  hasNew: prop(false);
  
  renderForModel(): string {
    if (this.state === "minimized") {
      return `[CHAT: ${this.messages.length} messages${this.hasNew ? ", NEW" : ""}]`;
    }
    return this.messages.map(m => `[${m.from}] ${m.content}`).join("\n");
  }
  
  getAPI() {
    return {
      add: (from: string, content: string) => {
        this.messages.push(new Message({ from, content }));
        this.hasNew = true;
      },
      markRead: () => this.hasNew = false,
    };
  }
}
```

Collapsed показывает: `[CHAT: 5 messages, NEW]`

### Создание панелей агентом

Агент пишет класс, наследуясь от BasePanel:

```typescript
// Модель пишет в CodeWritingMode:
@model("imai/FilesPanel")
class FilesPanel extends BasePanel {
  path: prop<string>();
  files: prop<string[]>(() => []);
  
  constructor(data: { id: string; path: string }) {
    super({ id: data.id, title: `Files: ${data.path}` });
    this.path = data.path;
  }
  
  renderForModel(): string {
    return `Files in ${this.path}:\n${this.files.join("\n")}`;
  }
  
  getAPI() {
    return {
      refresh: async () => {
        this.files = await readDir(this.path);
      },
    };
  }
}

// Создание инстансов:
new FilesPanel({ id: "src", path: "./src" });
new FilesPanel({ id: "lib", path: "./lib" });
```

---

## Режимы работы

### Интерфейс режима

```typescript
interface Mode {
  id: string;
  
  // Что видит модель
  getAPIRef(): string;
  getContext(): string;
  
  // Валидация output
  validateOutput(output: string): Promise<{ ok: boolean; error?: string }>;
  
  // Обработка output
  handleOutput(output: string): Promise<void>;
}
```

### NormalMode

```typescript
class NormalMode implements Mode {
  id = "normal";
  
  getAPIRef() {
    return `
      // Panel API
      panel.get(id)       // получить панель
      panel.call(id, method, args)  // вызвать метод
      
      // AgentState API
      agent.setContent(text)
      agent.append(text)
      
      // Chat API
      chat.add(from, content)
      chat.markRead()
      
      // Response
      respond(text)
    `;
  }
  
  getContext() {
    return session.agentState.renderForModel() + 
           session.chat.renderForModel();
  }
  
  validateOutput(code: string) {
    return denoCheck(code);
  }
  
  async handleOutput(code: string) {
    await execute(code);
  }
}
```

### CodeWritingMode

```typescript
class CodeWritingMode implements Mode {
  id = "code-writing";
  
  constructor(private config: {
    target: "panel" | "mode" | "module";
    outputPath: string;
    interface: string;
  }) {}
  
  getAPIRef() {
    return `
      // Interface to implement
      ${this.config.interface}
      
      // Available imports
      import { BasePanel, prop, model } from "imai";
      import { fs } from "@std/fs";
      import { path } from "@std/path";
    `;
  }
  
  getContext() {
    return `Creating: ${this.config.target}\nOutput: ${this.config.outputPath}`;
  }
  
  validateOutput(code: string) {
    return denoCheck(code, { 
      expectedInterface: this.config.interface 
    });
  }
  
  async handleOutput(code: string) {
    await Deno.writeTextFile(this.config.outputPath, code);
    await importAndRegister(this.config.outputPath);
    switchMode("normal");
  }
}
```

### Переключение режимов

Через tool call:

```typescript
// Модель вызывает:
tool.call("writeCode", {
  target: "panel",
  interface: "Panel",
  outputPath: "panels/files.ts"
})

// Система переключается в CodeWritingMode
// Модель пишет код
// Валидация → сохранение → возврат в normal
```

---

## Session и Persistence

### Session (Root Store)

```typescript
@model("imai/Session")
class Session extends Model({
  id: prop<string>(),
  panels: prop<BasePanel[]>(() => []),
  agentState: prop<AgentStatePanel>(),
  chat: prop<ChatPanel>(),
  createdAt: prop<string>(),
}) {
  @modelAction
  registerPanel(panel: BasePanel) {
    this.panels.push(panel);
  }
  
  @modelAction
  unregisterPanel(id: string) {
    this.panels = this.panels.filter(p => p.id !== id);
  }
  
  getPanel<T extends BasePanel>(id: string): T | undefined {
    return this.panels.find(p => p.id === id) as T;
  }
}
```

### Persistence (автоматически через mobx-keystone)

```typescript
// Сохранение
const snapshot = getSnapshot(session);
await Deno.writeTextFile("session.json", JSON.stringify(snapshot));

// Загрузка
const data = JSON.parse(await Deno.readTextFile("session.json"));
const session = fromSnapshot(Session, data);
registerRootStore(session);

// Логирование изменений
onPatches(session, (patches) => {
  console.log("Changed:", patches);
});
```

---

## Валидация

### deno check перед выполнением

```typescript
async function validateCode(code: string): Promise<{ ok: boolean; error?: string }> {
  // Записываем во временный файл
  const tmpPath = `/tmp/imai-${Date.now()}.ts`;
  await Deno.writeTextFile(tmpPath, code);
  
  // Запускаем deno check
  const result = new Deno.Command("deno", {
    args: ["check", tmpPath],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { code: exitCode, stderr } = await result.output();
  
  if (exitCode === 0) {
    return { ok: true };
  }
  
  return { ok: false, error: new TextDecoder().decode(stderr) };
}
```

### Feedback loop при ошибках

```
Модель → код → deno check
         ↑           ↓
         └── ошибка ─┘

Ошибка попадает в AgentStatePanel:
"ERROR: Type 'string' is not assignable to type 'number'"
Модель видит, исправляет, пробует снова.
```

---

## Model View рендер

### Сборка сообщений для API

```typescript
function renderForModel(session: Session): string {
  const parts: string[] = [];
  
  // 1. AgentState — всегда первая, всегда полная
  parts.push(session.agentState.renderForModel());
  
  // 2. Остальные панели по состоянию
  for (const panel of session.panels) {
    if (panel.id === "agent-state") continue;
    parts.push(panel.renderForModel());
  }
  
  return parts.join("\n\n");
}

function buildMessages(session: Session, apiRef: string): Message[] {
  return [
    { role: "system", content: apiRef },
    { role: "system", content: renderForModel(session) },
    // ... chat history если нужно
  ];
}
```

---

## TUI (Human View)

### Glyph раскладка

```
┌─ HEADER ───────────────────────────────────┐
│ IMAI | Ready | Session: abc123              │
└─────────────────────────────────────────────┘
┌─ AGENT STATE ──────────────────────────────┐
│ TASK: Build bot                             │
│ PHASE: implementation                       │
│ ...                                         │
└─────────────────────────────────────────────┘
┌─ CHAT ──────────────┐ ┌─ PANELS ───────────┐
│ [user] привет       │ │ Files: src/        │
│ [agent] ...         │ │  - main.ts         │
│ ...                 │ │  - store.ts        │
└─────────────────────┘ └─────────────────────┘
┌─ INPUT ────────────────────────────────────┐
│ > _                                         │
└─────────────────────────────────────────────┘
```

### Debug Mode

Переключение по клавише `D`:

```
┌─ MODEL VIEW (debug) ───────────────────────┐
│ === AGENT STATE ===                         │
│ TASK: Build bot                             │
│ ...                                         │
│                                             │
│ [CHAT: 3 messages, NEW]                     │
│                                             │
│ Files in ./src:                             │
│ main.ts                                     │
│ store.ts                                    │
└─────────────────────────────────────────────┘
```

Показывает ровно то что уйдёт в API.

---

## Структура файлов

```
imai/
├── deno.json
├── AGENTS.md
├── src/
│   ├── main.tsx              # Entry point
│   ├── ui.tsx                # TUI через Glyph
│   ├── store.ts              # MobX-keystone store
│   ├── session.ts            # Session model
│   ├── modes/
│   │   ├── base.ts           # Mode interface
│   │   ├── normal.ts         # NormalMode
│   │   └── code-writing.ts   # CodeWritingMode
│   ├── models/
│   │   ├── panel.ts          # BasePanel
│   │   ├── agent-state.ts    # AgentStatePanel
│   │   ├── chat.ts           # ChatPanel
│   │   └── message.ts        # Message model
│   ├── api.ts                # API reference
│   └── utils/
│       ├── validation.ts     # deno check
│       └── execute.ts        # Выполнение кода
└── docs/
    └── glyph.d.ts            # Glyph API reference
```

---

## План реализации

### Phase 1: Ядро

- [ ] Установить mobx-keystone
- [ ] Создать BasePanel + Session модели
- [ ] AgentStatePanel (текст, агент управляет)
- [ ] ChatPanel (сообщения, hasNew)
- [ ] Автоматическая сериализация/десериализация
- [ ] Убрать старые objects/ и ручную сериализацию

### Phase 2: Режимы

- [ ] Mode interface
- [ ] NormalMode (API: panel, agent, chat, respond)
- [ ] CodeWritingMode (API: interface, imports, outputPath)
- [ ] Переключение через tool call
- [ ] deno check интеграция

### Phase 3: Model View

- [ ] renderForModel() для всех панелей
- [ ] Сборка в сообщения для API
- [ ] Debug mode в TUI
- [ ] Токен-каунтинг

### Phase 4: TUI

- [ ] Glyph раскладка (2-3 колонки)
- [ ] Сворачивание/разворачивание панелей
- [ ] Human View / Model View toggle
- [ ] Input handling

### Phase 5: Расширяемость

- [ ] Агент создаёт панели через CodeWritingMode
- [ ] Динамическая загрузка созданных панелей
- [ ] Панели в файлах сессии (panels/*.ts)
- [ ] Builtin панели можно "эджектить" в файлы

---

## Открытые вопросы

### 1. UI Layout

Пока 2-3 колонки, потом можно придумать умнее.
Модель может влиять на раскладку?

### 2. Builtin vs Agent-created

Builtin панели (AgentState, Chat) — в коде системы или тоже файлы?
Можно эджектить в файлы если агент хочет модифицировать.

### 3. Инстансы панелей

Модель может создать несколько инстансов одной панели:
```typescript
new FilesPanel({ id: "src", path: "./src" });
new FilesPanel({ id: "lib", path: "./lib" });
```
Каждый инстанс регистрируется в Session.panels.

### 4. Token limits

Как обрабатывать когда контекст большой?
- Автоматический collapse?
- Summary?
- Модель сама решает?

---

## Термины

| Термин | Значение |
|--------|----------|
| Panel | Интерактивный элемент контекста с UI и API |
| Session | Root store, содержит все панели |
| Mode | Конфигурация поведения системы (normal, code-writing) |
| Human View | TUI отображение для человека |
| Model View | Текстовое представление для LLM API |
| AgentState | Несворачиваемая панель с состоянием агента |
| Chat | Панель с историей диалога |
