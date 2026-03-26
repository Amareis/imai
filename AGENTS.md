# IMAI — Inverted Model Agent Interface

> Инвертированный агент: модель управляет контекстом как пространством объектов

## Концепция

### Проблема

Текущие LLM-агенты работают в парадигме:
- Контекст = плоский список сообщений
- Модель = пассивный обработчик
- State = теряется между запросами
- Управление = внешний loop

### Решение

Инвертировать контроль:
- Контекст = пространство интерактивных объектов
- Модель = активный управляющий
- State = персистентный, модель сама управляет
- Управление = модель решает когда спать/просыпаться

---

## Архитектура

### 1. Контекст как пространство объектов

```
Контекст = [Объект, Объект, Объект, ...]

Каждый Объект:
├── id (уникальный)
├── type (message, checkpoint, data, thinking, wait, decision, ...)
├── content (содержимое)
├── metadata (теги, статус, приоритет, created_at, updated_at)
├── links → [{target_id, relation_type}]
├── history (кто когда менял)
└── methods (что можно с ним сделать)
```

### 2. Типы объектов

| Тип | Назначение | Методы |
|-----|------------|--------|
| `MessageObject` | Сообщение от/к пользователю | edit, tag, resolve, link_to, archive |
| `TaskContextObject` | Состояние задачи (всегда один) | read, update |
| `ActionLogObject` | История действий модели | append, read(last=N) |
| `CheckpointObject` | Свёрнутый кусок контекста | expand, update |
| `WaitObject` | Ожидание триггера | cancel, peek, modify_trigger |
| `ThinkingObject` | Заметки модели | read, append, pin |
| `DecisionObject` | Принятое решение | supersede, revert |
| `DataObject` | Структурированные данные | query, filter, transform |

### 3. TaskContext — всегда виден

TaskContext инъектится первым в каждый запрос:

```
┌─────────────────────────────────────────────────┐
│ TaskContext                                        │
├─────────────────────────────────────────────────┤
│ Задача: [описание текущей задачи]               │
│ Фаза: planning | implementation | testing       │
│ Статус: idle | in_progress | blocked | waiting  │
│                                                  │
│ Контекст:                                        │
│   Объектов: N                                    │
│   Токенов: X / LIMIT                             │
│                                                  │
│ Активные ожидания:                               │
│   → trigger_type (ожидание N мин)               │
│                                                  │
│ Последние решения: [...]                         │
│ TODO: [...]                                      │
└─────────────────────────────────────────────────┘
```

### 3.1 TaskContext блоки

TaskContext состоит из нескольких блоков, каждый отвечает за свою область:

```
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Ты — инвертированный агент. Ты управляешь контекстом как        │
│ пространством объектов. Твой output — это код на TypeScript,    │
│ который выполняется в sandbox. Доступные API: context,          │
│ taskctx, respond, sleep, tool.                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIME & CLOCK                                                     │
├─────────────────────────────────────────────────────────────────┤
│ Текущее время: 2026-03-26 21:45:00 (MSK)                        │
│ Последний wake: 2 мин назад                                      │
│ Uptime сессии: 3ч 25мин                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TASK STATE                                                       │
├─────────────────────────────────────────────────────────────────┤
│ Задача: Бот событий Челябинск                                   │
│ Фаза: planning                                                   │
│ Статус: in_progress                                              │
│ Последнее действие: [14:43] respond("Архитектура такова...")    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CONTEXT STATS                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Объектов: 24                                                     │
│ Токенов: 45,000 / 200,000 (22%)                                 │
│ Pinned: 3                                                        │
│ Checkpoints: 2                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ INBOX / PENDING                                                  │
├─────────────────────────────────────────────────────────────────┤
│ → [user_input] "А как память разделена?" (2 мин назад)         │
│ → [cron:daily] Следующий запуск: завтра 09:00                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TIMERS & CRONS                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Активные:                                                        │
│   • daily_check: 0 9 * * * (след: завтра 09:00)                │
│   • reminder: через 15 мин                                       │
│                                                                  │
│ История (последние 3):                                           │
│   • [21:30] daily_check выполнен                                │
│   • [15:00] reminder сработал                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NOTES / THINKING                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Pinned notes:                                                    │
│   • "Решили: 2 сервиса вместо per-user roles"                  │
│   • "Memory bug найден — session_id не совпадал"               │
│                                                                  │
│ Recent thinking (опционально):                                   │
│   • "Надо проверить как работает recall..."                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ACTION LOG (последние N)                                         │
├─────────────────────────────────────────────────────────────────┤
│ [21:43:15] wake(user_input)                                      │
│ [21:43:15] read(taskctx)                                       │
│ [21:43:16] query(unresolved)                                     │
│ [21:43:18] respond("Архитектура...")                            │
│ [21:43:20] checkpoint("Архитектура объяснена")                  │
│ [21:43:20] sleep(user_input)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DECISIONS                                                        │
├─────────────────────────────────────────────────────────────────┤
│ Активные:                                                        │
│   • 2 сервиса с разными workspace (21:30)                       │
│   • Memory session_id fixed → history_key (21:35)              │
│                                                                  │
│ Superseded:                                                      │
│   • ~~Per-user roles~~ (отменено в пользу 2 сервисов)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TODO / NEXT STEPS                                                │
├─────────────────────────────────────────────────────────────────┤
│ [ ] Config для public бота                                      │
│ [ ] Config для admin бота                                        │
│ [ ] Тестовый запуск                                              │
│ [ ] Написать README                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ API REFERENCE (сокращённая)                                      │
├─────────────────────────────────────────────────────────────────┤
│ context:                                                         │
│   .append(obj) .get(id) .query(fn) .remove(id)                  │
│   .link(from, to, type) .checkpoint(summary, range)             │
│                                                                  │
│ MessageObject:                                                   │
│   .edit(content) .tag(...tags) .resolve() .linkTo(...)          │
│                                                                  │
│ TaskContextObject:                                                 │
│   .update(fields) .setTask(text) .setPhase(phase)               │
│                                                                  │
│ WaitObject:                                                      │
│   .cancel() .peek() .modifyTrigger(trigger)                     │
│                                                                  │
│ Глобальные:                                                      │
│   respond(text) sleep(trigger) log(action)                      │
│   thinking.read() thinking.append(note)                         │
│   tool.call(name, args)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Какие блоки обязательные vs опциональные

| Блок | Обязательный | Когда показывать |
|------|--------------|------------------|
| System Prompt | ✅ Всегда | Каждый запрос |
| Time & Clock | ✅ Всегда | Каждый запрос |
| Task State | ✅ Всегда | Каждый запрос |
| Context Stats | ✅ Всегда | Каждый запрос |
| Inbox / Pending | ⚠️ Если есть | Когда есть pending |
| Timers & Crons | ⚠️ Если есть | Когда есть активные |
| Notes / Thinking | ⚠️ Если есть | Когда есть pinned |
| Action Log | ✅ Всегда | Последние N (5-10) |
| Decisions | ⚠️ Если есть | Когда есть активные |
| TODO | ⚠️ Если есть | Когда есть незавершённые |
| API Reference | ❓ Вопрос | Всегда vs по требованию? |

## Открытые вопросы по TaskContext

**1. API Reference — всегда или по требованию?**
- Всегда → больше токенов, но модель всегда видит
- По требованию → экономия, но модель может забыть синтаксис

**2. Сокращённый vs полный TaskContext**
- Если контекст большой — сокращать некоторые блоки?
- Динамически скрывать пустые блоки?

**3. История vs сводка**
- Action Log — последние N записей или summary?
- Thinking — все или только pinned?

**4. Персонализация**
- Модель сама решает какие блоки видеть?
- Предустановленные "view profiles"?

**5. Дополнительные блоки (может понадобиться):**
- Errors/Warnings — ошибки и предупреждения
- External resources — ссылки на внешние ресурсы
- User preferences — предпочтения пользователя
- History of decisions — история решений (с timestamps)
- Active tools — какие тулы сейчас доступны
- Model info — какая модель, провайдер, лимиты

---

## API Reference (экспортируемые в sandbox)

```typescript
// === Глобальные функции ===

// Ответить пользователю
respond(text: string): void

// Уснуть до триггера
sleep(trigger: Trigger): void

// Записать действие в лог
log(action: string, details?: object): void

// === Объекты ===

// Контекст — пространство объектов
context: {
  append(obj: BaseObject): void
  get(id: string): BaseObject | undefined
  query(fn: (obj: BaseObject) => boolean): BaseObject[]
  remove(id: string): boolean
  link(from: string, to: string, type: LinkType): void
  checkpoint(summary: string, range?: [number, number]): CheckpointObject
}

// TaskContext — состояние задачи
taskctx: {
  read(): TaskContextData
  update(fields: Partial<TaskContextData>): void
  setTask(text: string): void
  setPhase(phase: Phase): void
  setStatus(status: Status): void
  addTodo(item: string): void
  completeTodo(index: number): void
}

// Thinking — заметки модели
thinking: {
  read(last?: number): ThinkingObject[]
  append(content: string): void
  pin(id: string): void
}

// Tools — внешние инструменты
tool: {
  call(name: string, args: object): Promise<any>
  list(): string[]
}

// === Типы ===

type Trigger = 
  | { type: "user_input" }
  | { type: "cron", schedule: string }
  | { type: "webhook", path: string }
  | { type: "internal", condition: string }

type LinkType = 
  | "answers" 
  | "explains" 
  | "context_for" 
  | "decision_about"
  | "supersedes" 
  | "depends_on" 
  | "references"

type Phase = "planning" | "implementation" | "testing" | "done"
type Status = "idle" | "in_progress" | "blocked" | "waiting"

interface TaskContextData {
  task: string
  phase: Phase
  status: Status
  todos: string[]
  decisions: Decision[]
  lastActivity: string
}
```

---

## Следующие шаги

1. Изучить бенчмарки: AgentBench, SWE-bench, τ-bench
2. Протестировать TaskContext на реальных сценариях
3. Определить минимальный набор blocks для MVP
4. Реализовать базовый CLI для ручного тестирования

### 4. Sleep / Wake механизм

**Sleep:**
```
Модель вызывает: sleep(trigger={type, params})

Система:
1. Создаёт WaitObject с триггером
2. Замораживает сессию
3. Ждёт триггера
```

**Wake:**
```
Триггер срабатывает → WakeRecord создаётся
Система:
1. Обновляет TaskContext (wake_reason, wake_time)
2. Отдаёт управление модели
```

**Типы триггеров:**
- `user_input` — пользователь написал
- `cron` — время пришло (cron expression)
- `webhook` — HTTP запрос на endpoint
- `internal` — внутреннее событие (таймер, условие)

### 5. Связи между объектами

```
Типы связей:
├── answers (вопрос ← ответ)
├── explains (объект ← объяснение)
├── context_for (контекст ← задача)
├── decision_about (решение ← тема)
├── supersedes (новое ← старое)
├── depends_on (зависимость)
└── references (просто ссылка)
```

---

## Жизненный цикл модели

### Режимы работы

| Режим | Когда | Цикл | Действия |
|-------|-------|------|----------|
| Quick Response | user_input, пользователь ждёт | Wake → Scan → Respond → Sleep | Минимум действий, быстрый ответ |
| Normal | Обычный вопрос | Wake → Orient → Plan → Execute → Sleep | Стандартная обработка |
| Deep Work | Сложная задача, время есть | Wake → Analyze → Structure → Execute → Checkpoint → Sleep | Полный анализ, оптимизация |
| Background | Cron/webhook | Wake → Check → Act? → Update → Sleep | Быстрая проверка |

### Алгоритм просыпания

```
1. ORIENT
   - Сколько прошло времени?
   - Какой триггер?
   - Какой режим?

2. READ STATE
   - TaskContext (всегда)
   - ActionLog.last(N) (всегда)
   - WakeRecord (всегда)
   - Thinking.last(N) (если нужно)
   - Pinned objects (если нужно)

3. DECIDE & EXECUTE
   - В зависимости от режима

4. CLEANUP (если нужно)
   - Archive resolved
   - Merge duplicates
   - Checkpoint old

5. LOG
   - Записать действия в ActionLog

6. SLEEP
   - Выбрать следующий триггер
   - sleep(trigger)
```

---

## Оптимизация контекста

### Триггеры

Запускать когда:
- context.tokens > 80% лимита
- context.objects > N
- Прошло > 1 часа с последней оптимизации
- После завершения подзадачи

### Стратегии

1. **Archive resolved** — resolved вопросы → checkpoint
2. **Merge duplicates** — похожие объекты → один
3. **Summarize old** — старое → summary
4. **Pin important** — частые → pinned
5. **Prune links** — obsolete связи → удалить

---

## Формат взаимодействия с моделью

### Input (что получает модель)

```
[
  TaskContextObject,      // Всегда первый
  WakeRecord,           // Почему проснулась
  ...context_objects,   // Остальной контекст
]
```

### Output (что возвращает модель)

Модель возвращает **код** (или команды), которые:
- Модифицируют объекты контекста
- Вызывают tools
- Отправляют ответ пользователю
- Устанавливают sleep

Формат TBD:
- JSON commands?
- Python-подобный DSL?
- Реальный код в sandbox?

---

## План реализации

### Phase 1: MVP (TypeScript + Deno)

- [ ] Базовая структура объекта (BaseObject class)
- [ ] MessageObject (user/assistant messages)
- [ ] TaskContextObject (singleton, always visible)
- [ ] ActionLogObject (history of model actions)
- [ ] Context operations (append, query, get, link)
- [ ] Sleep/wake с user_input триггером
- [ ] Deno sandbox для выполнения кода модели
- [ ] Простой CLI для тестирования

### Phase 2: Core

- [ ] CheckpointObject + archive mechanism
- [ ] WaitObject + разные триггеры (cron, webhook)
- [ ] ThinkingObject (read/append/pin)
- [ ] Links между объектами (answers, explains, etc.)
- [ ] Токен-каунтинг (char count для начала)
- [ ] TaskContext все блоки

### Phase 3: Intelligence

- [ ] DecisionObject (supersede, revert)
- [ ] DataObject (query, filter, transform)
- [ ] Авто-оптимизация контекста
- [ ] TaskContext auto-update
- [ ] Recovery из checkpoint

### Phase 4: Integration

- [ ] Подключение к LLM провайдеру (OpenAI/Anthropic)
- [ ] Web interface для наблюдения
- [ ] Экспорт/импорт сессий
- [ ] Бенчмарки и метрики

---

## Открытые вопросы

### 1. Формат output модели ✅ РЕШЕНО

**Решение:** TypeScript код, выполняется в Deno sandbox

```typescript
// Модель возвращает валидный TypeScript:
const response = new MessageObject({
  type: "assistant",
  content: "Вот ответ на вопрос..."
});
context.append(response);
context[5].resolve();
context[5].linkTo(response, "answers");
taskctx.update({ lastActivity: Date.now() });
sleep({ trigger: "user_input" });
```

**Почему TS:**
- Типобезопасность (interfaces, type guards)
- ООП (classes, methods)
- JSON native (сериализация)
- Deno sandbox (изоляция, permissions)
- Готовые SDK для OpenAI/Anthropic

### 2. Хранение объектов ✅ РЕШЕНО

**Решение:** JSON файлы в workspace директории

```
~/.imai/
├── sessions/
│   └── session-abc123/
│       ├── context.json      # Все объекты
│       ├── taskctx.json    # TaskContext state
│       ├── action-log.json   # История действий
│       └── checkpoint/       # Свёрнутые объекты
│           ├── cp-001.json
│           └── cp-002.json
```

**Почему файлы:**
- Читаемость для дебага
- Простой экспорт/импорт
- Git-friendly
- Для MVP достаточно, потом можно SQLite

### 3. Токен-каунтинг ✅ РЕШЕНО (частично)

**Решение:** 
- Total tokens — от API ответа (провайдер возвращает)
- Per-object — пока просто char count
- Уточнить потом если нужно

### 4. Recovery забытого

Если модель архивировала важное:
- A) Автоматический search в archive при query
- B) Явная команда `restore(checkpoint_id)`
- C) "Подсказки" в taskctx о связанных архивах

**Вопрос:** Как балансировать автоматизацию vs контроль?

### 5. Множественные wait ❓ ОТКРЫТ

Сложный вопрос. Варианты:
- A) Один wait за раз — проще логика
- B) Несколько waits, любое срабатывание будит
- C) Кроны отдельно (свои команды), wait только для user_input

**Проблемы:**
- Cron должен жить независимо от wait
- User_input может быть не нужен (модель работает сама)
- Webhook может прийти в любой момент

**Надо пробовать на практике.**

### 6. Thinking access ❓ ОТКРЫТ

Давать ли модели доступ к своему thinking?
- A) Полный (read/write)
- B) Только read
- C) Только append
- D) Не давать вообще

**Непонятно:**
- Зачем модели читать свой thinking?
- Не будет ли это "читингом"?
- Или наоборот — полезно для памяти?

**Надо экспериментировать.**

### 7. Безопасность кода ✅ РЕШЕНО

**Решение:** Deno sandbox
- Изоляция по умолчанию
- Whitelist разрешённых API
- Ограничение по времени выполнения
- Нет доступа к FS/сети без разрешения

### 8. Мульти-модель

Можно ли несколько моделей в одном контексте?
- A) Одна модель = одна сессия
- B) Разные модели для разных задач
- C) Handoff между моделями

**Отложить до Phase 3-4.**

---

## Тестирование и бенчмарки ❓ ОТКРЫТ

### Вопросы:
- Как измерять "качество управления контекстом"?
- Есть ли опенсорсные бенчмарки для агентской работы?
- Какие метрики важны?

### Потенциальные метрики:
- Контекст-эффективность (отношение полезных токенов к total)
- Время до решения задачи
- Количество lost context (когда модель забыла важное)
- Количество лишних действий
- Recovery rate (как часто модель восстанавливает архивное)

### Известные бенчмарки (надо изучить):
- AgentBench
- ToolBench  
- WebArena
- OSWorld
- SWE-bench
- τ-bench (tau-bench)

**TODO:** Изучить что там и как измеряют

---

## Статус реализации

### Сделано (2026-03-26)

```
imai/
├── deno.json              ✅ Конфиг Deno
├── AGENTS.md              ✅ Документация проекта
├── src/
│   ├── types.ts           ✅ Все типы и интерфейсы
│   ├── mod.ts             ✅ Экспорты
│   ├── context.ts         ✅ Context — управление объектами
│   ├── session.ts         ✅ SessionManager — загрузка/сохранение
│   ├── repl.ts            ✅ Интерактивный CLI
│   ├── objects/
│   │   ├── base.ts        ✅ BaseObject класс
│   │   ├── message.ts     ✅ MessageObject класс
│   │   ├── taskctx.ts   ✅ TaskContextObject класс
│   │   ├── action_log.ts  ✅ ActionLogObject класс
│   │   ├── checkpoint.ts  ✅ CheckpointObject класс
│   │   ├── wait.ts        ✅ WaitObject класс
│   │   ├── thinking.ts    ✅ ThinkingObject класс
│   │   ├── decision.ts    ✅ DecisionObject класс
│   │   └── data.ts        ✅ DataObject класс
│   ├── sandbox/           🔄 Пусто (Phase 2)
│   └── utils/
│       └── clock.ts       ✅ Время и форматирование
```

### Что работает:

**Phase 1 — MVP ✅ ЗАВЕРШЁН**

Все объекты:
- BaseObject (abstract) — базовый класс с tag/untag/pin/unpin/linkTo/unlink
- MessageObject — сообщения с edit/append/resolve/archive
- TaskContextObject — состояние задачи с todos/decisions/wake
- ActionLogObject — лог действий с append/read/clear
- CheckpointObject — свёрнутый контекст
- WaitObject — ожидание триггера с cancel/peek/modifyTrigger
- ThinkingObject — заметки модели с append/replace
- DecisionObject — решения с supersede/revert/reactivate
- DataObject — структурированные данные с query/filter/transform

Context API:
- append(obj), get(id), query(fn), remove(id)
- link(from, to, type), checkpoint(summary, range)
- stats() — objectCount, charCount, pinnedCount, checkpointCount
- toJSON() / fromJSON() — сериализация

SessionManager:
- create(task?) — создать сессию
- load(sessionId) — загрузить сессию
- save() — сохранить контекст
- list() — список сессий
- delete(sessionId) — удалить сессию
- recordWake(trigger) — записать пробуждение

REPL:
- new/load/list/taskctx/add/todo/stats/save/quit

### Phase 2 — Core (下一步)

**Следующие задачи:**
```
src/
├── sandbox/
│   └── executor.ts        [ ] Выполнение кода модели в Deno sandbox
│
├── utils/
│   └── storage.ts         [ ] Работа с файлами (оптимизация)
│
├── triggers/
│   ├── cron.ts            [ ] Cron триггеры
│   └── webhook.ts         [ ] Webhook триггеры
│
└── agent.ts               [ ] Главный loop модели
```

**Приоритет:**
1. sandbox/executor.ts — выполнение TypeScript кода модели
2. agent.ts — wake/orient/decide/execute/sleep loop
3. triggers/ — cron и webhook триггеры
4. LLM integration — подключение к OpenAI/Anthropic

---

## Термины

| Термин | Значение |
|--------|----------|
| Context | Пространство объектов |
| Object | Элемент контекста с методами |
| TaskContext | Специальный объект с состоянием задачи |
| ActionLog | История действий модели |
| Wake | Просыпание модели по триггеру |
| Sleep | Усыпление модели с ожиданием триггера |
| Trigger | Событие которое будит модель |
| Checkpoint | Свёрнутый кусок контекста |
| Link | Связь между объектами |
