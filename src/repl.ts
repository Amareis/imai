import { SessionManager } from "./session.ts";
import { MessageObject, Context, DashboardObject } from "./context.ts";
import { formatTime, formatTimeAgo } from "./utils/clock.ts";

const manager = new SessionManager();
let context: Context | undefined;

async function repl() {
  console.log("IMAI REPL — Inverted Model Agent Interface");
  console.log("Commands: new, load <id>, list, dashboard, add <msg>, stats, save, quit\n");

  while (true) {
    const input = prompt("> ");
    if (!input) continue;

    const [cmd, ...args] = input.trim().split(/\s+/);

    switch (cmd) {
      case "new": {
        const task = args.join(" ") || "New session";
        const session = await manager.create(task);
        context = manager.getContext();
        console.log(`Created: ${session.id}`);
        break;
      }

      case "load": {
        const sessionId = args[0];
        if (!sessionId) {
          console.log("Usage: load <session_id>");
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
          for (const s of sessions.slice(0, 10)) {
            console.log(`  ${s}`);
          }
        }
        break;
      }

      case "dashboard":
      case "d": {
        if (!context) {
          console.log("No context. Use 'new' or 'load' first.");
          break;
        }
        const dash = context.getDashboard();
        if (dash) {
          console.log(dash.render());
        }
        break;
      }

      case "add": {
        if (!context) {
          console.log("No context. Use 'new' or 'load' first.");
          break;
        }
        const role = args[0] as "user" | "assistant";
        const content = args.slice(1).join(" ");
        if (!role || !content) {
          console.log("Usage: add <user|assistant> <message>");
          break;
        }
        const msg = new MessageObject(role, content);
        context.append(msg);
        console.log(`Added: ${msg.id}`);
        break;
      }

      case "todo": {
        if (!context) {
          console.log("No context. Use 'new' or 'load' first.");
          break;
        }
        const dash = context.getDashboard();
        if (!dash) break;
        
        const subCmd = args[0];
        if (subCmd === "add") {
          const text = args.slice(1).join(" ");
          if (text) {
            dash.addTodo(text);
            console.log("Added todo");
          }
        } else if (subCmd === "done") {
          const idx = parseInt(args[1]);
          if (!isNaN(idx)) {
            dash.completeTodo(idx);
            console.log("Completed");
          }
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
        await manager.save();
        console.log("Bye");
        return;
      }

      case "help": {
        console.log(`
Commands:
  new [task]           Create new session
  load <id>            Load session
  list                 List sessions
  dashboard, d         Show dashboard
  add <role> <msg>     Add message (role: user|assistant)
  todo add <text>      Add todo
  todo done <idx>      Complete todo
  stats                Show context stats
  save                 Save session
  quit, q, exit        Exit REPL
        `);
        break;
      }

      default:
        console.log(`Unknown: ${cmd}. Type 'help' for commands.`);
    }
  }
}

repl().catch(console.error);
