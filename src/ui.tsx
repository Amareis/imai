import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { store } from "./store.ts";
import {
  Box,
  Input,
  type Key,
  Keybind,
  Portal,
  ScrollView,
  Text,
  useApp,
  useInput,
  useLayout,
} from "@semos-labs/glyph";

type GlyphNode = Exclude<
  Exclude<Parameters<typeof useLayout>[0], undefined>["current"],
  null
>;

const COLUMN_WIDTH = 50;

export const Content = observer(() => {
  const { session } = store;

  const boxRef = useRef<GlyphNode>(null);
  const { innerWidth: columns, innerHeight: rows } = useLayout(boxRef);

  if (!session) {
    return (
      <Box ref={boxRef} style={{ flexDirection: "column", flexGrow: 1 }}>
        <Text>No session, use /new</Text>
      </Box>
    );
  }

  if (store.logVisible) {
    return (
      <Box
        style={{
          flexGrow: 1,
          padding: 1,
          flexDirection: "column",
        }}
      >
        <Box style={{ flexDirection: "row" }}>
          <Text style={{ bold: true, color: "yellow" }}>LOGS</Text>
          <Text style={{ dim: true }}>&nbsp;| Ctrl+L to close</Text>
        </Box>
        <ScrollView style={{ flexGrow: 1 }}>
          <Text style={{ color: "whiteBright", dim: true }}>
            {store.logs.join("\n")}
          </Text>
        </ScrollView>
      </Box>
    );
  }

  if (store.debugMode) {
    return (
      <Box ref={boxRef} style={{ flexDirection: "column", flexGrow: 1 }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <Text style={{ color: "whiteBright" }}>
            {store.text}
          </Text>
        </ScrollView>
      </Box>
    );
  }

  const panels = session.panels ?? [];
  const numColumns = Math.max(1, Math.floor(columns / COLUMN_WIDTH));
  const rowsPerColumn = Math.ceil(panels.length / numColumns);
  const panelHeight = Math.floor(rows / Math.max(1, rowsPerColumn));

  const columnsData: typeof panels[] = [];
  for (let i = 0; i < numColumns; i++) {
    columnsData.push([]);
  }
  panels.forEach((panel, i) => {
    columnsData[i % numColumns].push(panel);
  });

  return (
    <Box ref={boxRef} style={{ flexDirection: "row", flexGrow: 1 }}>
      {columnsData.map((colPanels, colIdx) => (
        <Box
          key={colIdx}
          style={{
            width: COLUMN_WIDTH,
            flexDirection: "column",
          }}
        >
          {colPanels.map((panel) => (
            <Box
              key={panel.slug}
              style={{
                border: "single",
                borderColor: "blue",
                height: panelHeight,
                flexDirection: "column",
              }}
            >
              <Text style={{ bold: true, color: "cyan" }}>
                {panel.$modelType.replace("imai/", "")}:{panel.slug}
              </Text>
              <ScrollView style={{ flexGrow: 1 }}>
                <Text style={{ dim: true }}>
                  {panel.renderForModel()}
                </Text>
              </ScrollView>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
});

export const App = observer(() => {
  const { exit, rows, columns } = useApp();

  useEffect(() => {
    store.init();
  }, []);

  return (
    <Box style={{ height: rows, width: columns, flexDirection: "column" }}>
      <Keybind keypress="ctrl+l" onPress={() => store.toggleLogs()} priority />
      <Keybind keypress="ctrl+d" onPress={() => store.toggleDebug()} priority />

      <Content />

      <Box
        style={{
          flexDirection: "row",
          bg: 236,
          borderColor: "cyan",
        }}
      >
        <Text style={{ bold: true, color: "yellow", width: 2 }}>
          │ │ │ │ │
        </Text>
        <Box style={{ flexGrow: 1, paddingY: 1 }}>
          <Box style={{ flexDirection: "row" }}>
            <Input
              style={{ flexGrow: 1 }}
              value={store.input}
              onChange={(v: string) => store.setInput(v)}
              onKeyPress={(key: Key) => {
                if (key.name !== "return") return;
                handleInput(store.input, exit);
              }}
              placeholder="/ <msg> to send | /ai | /q[uit] | /new /save /rm (session)"
              autoFocus
            />
          </Box>

          <Box style={{ paddingTop: 1, flexDirection: "row" }}>
            <Text
              style={{
                color: store.error
                  ? "red"
                  : store.isLoading
                  ? "yellow"
                  : "green",
              }}
            >
              {store.status}
            </Text>
            <Text style={{ dim: true }}>
              {" | "}Ctrl+D debug | Ctrl+L logs
            </Text>
            {store.error && (
              <Text style={{ color: "red" }}>
                {" | "}
                {store.error.slice(0, 30)}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

async function handleInput(v: string, exit: () => void) {
  v = v.trim();
  if (!v.startsWith("/")) {
    await store.sendMessage(v);
  }
  if (v === "/ai") {
    await store.callAI();
  }
  if (v === "/quit" || v === "/q") {
    await store.save();
    exit();
  }
  if (v === "/new") {
    await store.createSession();
  }
  if (v === "/rm") {
    await store.removeSession();
  }
  if (v === "/save") {
    await store.save();
  }
  if (v === "/read") {
    store.readConsts();
  }
  if (v.startsWith("/code ")) {
    const code = v.slice(6);
    if (await store.executeCode(code)) return;
  }
  store.setInput("");
}
