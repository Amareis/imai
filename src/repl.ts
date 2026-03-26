import { SessionManager } from "./session.ts";
import { MessageObject, type Context, DecisionObject, ThinkingObject, DataObject, WaitObject } from "./context.ts";
import type {LinkType, Trigger} from "./types.ts";

const manager = new SessionManager();
let context: Context | undefined;

async function executeCommand(input: string): Promise<boolean> {
  const [cmd, ...args] = input.trim().split(/\s+/);

  switch (cmd) {
    case "new": {
      const task = args.join(" ") || undefined;
      const session = await manager.create(task);
      context = manager.getContext();
      console.log(`Created: ${session.id}`);
      break;
    }

    case "load": {
      const sessionId = args[0];
      if (!sessionId) {
        const sessions = await manager.list();
        if (sessions.length === 0) {
          console.log("No sessions. Use 'new' first.");
          break;
        }
        console.log("Sessions:");
        for (const s of sessions.slice(0, 10)) {
          console.log(`  ${s}`);
        }
        console.log("\nUsage: load <session_id>");
        break;
      }
      const session = await manager.load(sessionId);
      if (session) {
        context = manager.getContext();
        console.log(`Loaded: ${session.id}`);
      } else {
        console.log("Session not found");
      }
      break;
    }

    case "list": {
      const sessions = await manager.list();
      if (sessions.length === 0) {
        console.log("No sessions");
      } else {
        for (const s of sessions) {
          console.log(`  ${s}`);
        }
      }
      break;
    }

    case "view":
    case "v": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      console.log(context.renderForModel());
      break;
    }

    case "taskctx":
    case "c": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const dash = context.getTaskContext();
      if (dash) {
        console.log(dash.render());
      }
      break;
    }

    case "add":
    case "a": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const subCmd = args[0];
      if (subCmd === "user" || subCmd === "assistant") {
        const role = subCmd as "user" | "assistant";
        const content = args.slice(1).join(" ");
        if (!content) {
          console.log("Usage: add user|assistant <message>");
          break;
        }
        const msg = new MessageObject(role, content);
        context.append(msg);
        console.log(`Added: ${msg.id}`);
      } else if (subCmd === "decision") {
        const decision = args.slice(1).join(" ");
        if (!decision) {
          console.log("Usage: add decision <text>");
          break;
        }
        const obj = new DecisionObject(decision);
        context.append(obj);
        context.getTaskContext()?.addDecision(decision, obj.id);
        console.log(`Added: ${obj.id}`);
      } else if (subCmd === "thinking") {
        const content = args.slice(1).join(" ");
        if (!content) {
          console.log("Usage: add thinking <text>");
          break;
        }
        const obj = new ThinkingObject(content);
        context.append(obj);
        console.log(`Added: ${obj.id}`);
      } else if (subCmd === "data") {
        const json = args.slice(1).join(" ");
        try {
          const data = JSON.parse(json);
          const obj = new DataObject(data);
          context.append(obj);
          console.log(`Added: ${obj.id}`);
        } catch {
          console.log("Usage: add data <json>");
        }
      } else if (subCmd === "wait") {
        const triggerType = args[1] as "user_input" | "cron" | "webhook";
        if (!triggerType) {
          console.log("Usage: add wait user_input|cron|webhook [schedule|path]");
          break;
        }
        const trigger: Trigger = { type: triggerType };
        if (triggerType === "cron") {
          trigger.schedule = args[2] || "* * * * *";
        } else if (triggerType === "webhook") {
          trigger.path = args[2] || "/webhook";
        }
        const obj = new WaitObject(trigger);
        context.append(obj);
        console.log(`Added: ${obj.id}`);
      } else {
        console.log("Usage: add user|assistant|decision|thinking|data|wait ...");
      }
      break;
    }

    case "todo": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const dash = context.getTaskContext();
      if (!dash) break;
      
      const subCmd = args[0];
      if (subCmd === "add") {
        const text = args.slice(1).join(" ");
        if (text) {
          dash.addTodo(text);
          console.log("Added todo");
        }
      } else if (subCmd === "done" || subCmd === "x") {
        const idx = parseInt(args[1]);
        if (!isNaN(idx)) {
          dash.completeTodo(idx);
          console.log("Completed");
        }
      } else if (subCmd === "rm") {
        const idx = parseInt(args[1]);
        if (!isNaN(idx)) {
          dash.removeTodo(idx);
          console.log("Removed");
        }
      } else {
        console.log("Usage: todo add <text> | todo done <idx> | todo rm <idx>");
      }
      break;
    }

    case "phase": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const dash = context.getTaskContext();
      if (!dash) break;
      const phase = args[0] as "planning" | "implementation" | "testing" | "done";
      if (phase) {
        dash.setPhase(phase);
        console.log(`Phase: ${phase}`);
      } else {
        console.log("Usage: phase planning|implementation|testing|done");
      }
      break;
    }

    case "task": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const dash = context.getTaskContext();
      if (!dash) break;
      const task = args.join(" ");
      if (task) {
        dash.setTask(task);
        console.log(`Task: ${task}`);
      } else {
        console.log("Usage: task <description>");
      }
      break;
    }

    case "pin":
    case "unpin": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const id = args[0];
      if (!id) {
        console.log("Usage: pin|unpin <object_id>");
        break;
      }
      const obj = context.get(id);
      if (obj) {
        if (cmd === "pin") {
          obj.pin();
          console.log("Pinned");
        } else {
          obj.unpin();
          console.log("Unpinned");
        }
      } else {
        console.log("Object not found");
      }
      break;
    }

    case "tag": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const id = args[0];
      const tags = args.slice(1);
      if (!id || tags.length === 0) {
        console.log("Usage: tag <object_id> <tag> [tag2] ...");
        break;
      }
      const obj = context.get(id);
      if (obj) {
        obj.tag(...tags);
        console.log(`Tagged: ${tags.join(", ")}`);
      } else {
        console.log("Object not found");
      }
      break;
    }

    case "link": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const fromId = args[0];
      const toId = args[1];
      const linkType = args[2] as LinkType;
      if (!fromId || !toId || !linkType) {
        console.log("Usage: link <from_id> <to_id> <type>");
        console.log("Types: answers, explains, context_for, decision_about, supersedes, depends_on, references");
        break;
      }
      if (context.link(fromId, toId, linkType)) {
        console.log("Linked");
      } else {
        console.log("Failed to link (object not found)");
      }
      break;
    }

    case "rm": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const id = args[0];
      if (!id) {
        console.log("Usage: rm <object_id>");
        break;
      }
      if (context.remove(id)) {
        console.log("Removed");
      } else {
        console.log("Object not found");
      }
      break;
    }

    case "exec":
    case "e": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const code = args.join(" ");
      if (!code) {
        console.log("Usage: exec <code>");
        console.log("Example: exec context.getTaskContext().setTask('New task')");
        break;
      }
      try {
        const fn = new Function("context", "MessageObject", "DecisionObject", "ThinkingObject", "DataObject", "WaitObject", code);
        const result = fn(context, MessageObject, DecisionObject, ThinkingObject, DataObject, WaitObject);
        if (result !== undefined) {
          console.log("Result:", result);
        } else {
          console.log("OK");
        }
      } catch (err) {
        console.log("Error:", (err as Error).message);
      }
      break;
    }

    case "stats": {
      if (!context) {
        console.log("No context. Use 'new' or 'load' first.");
        break;
      }
      const stats = context.stats();
      console.log(`Objects: ${stats.objectCount}`);
      console.log(`Chars: ${stats.charCount}`);
      console.log(`Pinned: ${stats.pinnedCount}`);
      console.log(`Checkpoints: ${stats.checkpointCount}`);
      break;
    }

    case "save": {
      await manager.save();
      console.log("Saved");
      break;
    }

    case "quit":
    case "q":
    case "exit": {
      return false;
    }

    case "help": {
      console.log(`
IMAI REPL Commands:

Session:
  new [task]              Create new session
  load [id]               Load session (list if no id)
  list                    List all sessions
  save                    Save current session

View:
  view, v                 Show context as model sees it
  taskctx, d            Show compact taskctx
  stats                   Show context statistics

Objects:
  add user <msg>          Add user message
  add assistant <msg>     Add assistant message
  add decision <text>     Add decision
  add thinking <text>     Add thinking note
  add data <json>         Add data object
  add wait user_input     Add wait for user input
  add wait cron <expr>    Add wait for cron
  add wait webhook <path> Add wait for webhook
  rm <id>                 Remove object

Task context:
  task <text>             Set task description
  phase <p>               Set phase (planning|implementation|testing|done)
  todo add <text>         Add todo
  todo done <idx>         Complete todo
  todo rm <idx>           Remove todo

Links & Tags:
  pin <id>                Pin object
  unpin <id>              Unpin object
  tag <id> <tag> [...]    Tag object
  link <from> <to> <type> Link objects

Execute:
  exec <code>             Execute TypeScript code
                          Example: exec context.getTaskContext().setPhase('testing')

Other:
  help                    Show this help
  quit, q, exit           Exit REPL
      `);
      break;
    }

    case "":
    case "#":
      break;

    default:
      console.log(`Unknown: ${cmd}. Type 'help' for commands.`);
  }

  return true;
}

async function runBatch(commands: string[]) {
  for (const line of commands) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    console.log(`> ${trimmed}`);
    const shouldContinue = await executeCommand(trimmed);
    if (!shouldContinue) break;
  }

  console.log("\n" + "=".repeat(70));
  console.log("FINAL STATE");
  console.log("=".repeat(70) + "\n");

  if (context) {
    console.log(context.renderForModel());
  }

  await manager.save();
}

async function repl() {
  console.log("IMAI REPL — Inverted Model Agent Interface");
  console.log("Commands: new, load, list, view, add, todo, exec, stats, save, quit\n");
  console.log("Type 'help' for full command list.\n");

  while (true) {
    const input = prompt("> ");
    if (!input) continue;

    const shouldContinue = await executeCommand(input);
    if (!shouldContinue) {
      await manager.save();
      console.log("Bye");
      break;
    }
  }
}

async function main() {
  const args = Deno.args;

  if (args.length > 0) {
    const filePath = args[0];
    try {
      const content = await Deno.readTextFile(filePath);
      const commands = content.split("\n");
      await runBatch(commands);
    } catch (err) {
      console.error(`Error reading file: ${filePath}`);
      console.error((err as Error).message);
      Deno.exit(1);
    }
  } else if (!Deno.stdin.isTerminal()) {
    const content = await new Response(Deno.stdin.readable).text();
    const commands = content.split("\n");
    await runBatch(commands);
  } else {
    await repl();
  }
}

main().catch(console.error);
