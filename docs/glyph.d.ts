import React, { ReactElement, ReactNode } from "react";
import { Node } from "yoga-layout";
import * as react_jsx_runtime from "react/jsx-runtime";

/** Named ANSI terminal color. */
type NamedColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright";
/** Hex color string (e.g. `"#ff00ff"`). */
type HexColor = `#${string}`;
/** RGB color as an object with 0-255 channels. */
type RGBColor = {
  r: number;
  g: number;
  b: number;
};
/**
 * Color value accepted by all style properties.
 *
 * - {@link NamedColor} — ANSI name (`"red"`, `"cyanBright"`, …)
 * - {@link HexColor} — hex string (`"#ff00ff"`)
 * - {@link RGBColor} — `{ r, g, b }` object
 * - `number` — ANSI 256-color index (0–255)
 * @category Core
 */
type Color = NamedColor | HexColor | RGBColor | number;
/**
 * Dimension value in terminal cells or a percentage string.
 * - `number` — absolute cells
 * - `"50%"` — percentage of parent
 */
type DimensionValue = number | `${number}%`;
/** Border drawing style for {@link Style.border}. */
type BorderStyle = "none" | "single" | "double" | "round" | "ascii";
/**
 * Text wrapping mode for {@link Style.wrap}.
 * - `"wrap"` — soft-wrap at container edge
 * - `"truncate"` — cut off silentlyПо
 * - `"ellipsis"` — cut off with `…`
 * - `"none"` — no wrapping
 */
type WrapMode = "wrap" | "truncate" | "ellipsis" | "none";
/** Horizontal text alignment. */
type TextAlign = "left" | "center" | "right";
/**
 * Named terminal breakpoint.
 *
 * Breakpoints are **mobile-first** (like Tailwind / Chakra) — the largest
 * matching breakpoint wins.
 *
 * | Name   | Columns | Typical use case            |
 * |--------|---------|-----------------------------|
 * | `base` | 0 +     | Always applies (default)    |
 * | `sm`   | 40 +    | Split pane / small terminal |
 * | `md`   | 80 +    | Standard 80-col terminal    |
 * | `lg`   | 120 +   | Wide terminal               |
 * | `xl`   | 160 +   | Ultra-wide                  |
 *
 * @example
 * ```tsx
 * <Box style={{ flexDirection: { base: "column", md: "row" } }} />
 * ```
 */
type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
/**
 * A style value that can change depending on terminal width.
 *
 * Accepts either a plain value (backward-compatible) **or** an object keyed
 * by {@link Breakpoint} names.
 *
 * @example
 * ```tsx
 * // Plain value — works exactly like before
 * padding: 1
 *
 * // Responsive — different values at different terminal widths
 * padding: { base: 0, sm: 1, lg: 2 }
 * ```
 */
type Responsive<T> =
  | T
  | {
    [K in Breakpoint]?: T;
  };
/**
 * Unified style object for all Glyph elements.
 *
 * Combines CSS-like flexbox layout, positioning, paint (colors, borders),
 * and text formatting into a single flat object.
 *
 * Every property supports {@link Responsive | responsive values} — pass a
 * plain value for a static style or a breakpoint object to adapt to the
 * terminal width:
 *
 * ```tsx
 * <Box
 *   style={{
 *     flexDirection: { base: "column", md: "row" },
 *     padding: { base: 0, sm: 1, lg: 2 },
 *     gap: 1, // plain values still work
 *   }}
 * />
 * ```
 * @category Core
 */
interface Style {
  /** Width in cells or percentage of parent. */
  width?: Responsive<DimensionValue>;
  /** Height in cells or percentage of parent. */
  height?: Responsive<DimensionValue>;
  /** Minimum width in cells. */
  minWidth?: Responsive<number>;
  /** Minimum height in cells. */
  minHeight?: Responsive<number>;
  /** Maximum width in cells. */
  maxWidth?: Responsive<number>;
  /** Maximum height in cells. */
  maxHeight?: Responsive<number>;
  /** Padding on all four sides (cells). */
  padding?: Responsive<number>;
  /** Horizontal padding (left + right). */
  paddingX?: Responsive<number>;
  /** Vertical padding (top + bottom). */
  paddingY?: Responsive<number>;
  /** Top padding. */
  paddingTop?: Responsive<number>;
  /** Right padding. */
  paddingRight?: Responsive<number>;
  /** Bottom padding. */
  paddingBottom?: Responsive<number>;
  /** Left padding. */
  paddingLeft?: Responsive<number>;
  /** Gap between children (cells). Works with both `row` and `column` directions. */
  gap?: Responsive<number>;
  /** Direction of the main axis. Default `"column"`. */
  flexDirection?: Responsive<"row" | "column">;
  /** Whether children wrap to the next line. */
  flexWrap?: Responsive<"nowrap" | "wrap">;
  /** Alignment along the main axis. */
  justifyContent?: Responsive<
    "flex-start" | "center" | "flex-end" | "space-between" | "space-around"
  >;
  /** Alignment along the cross axis. */
  alignItems?: Responsive<"flex-start" | "center" | "flex-end" | "stretch">;
  /** How much this element grows to fill available space (default `0`). */
  flexGrow?: Responsive<number>;
  /** How much this element shrinks when space is tight (default `1`). */
  flexShrink?: Responsive<number>;
  /** Initial main-axis size before flex grow/shrink. Overrides `width`/`height` for flex calculations. */
  flexBasis?: Responsive<DimensionValue>;
  /** Positioning mode. `"absolute"` elements are taken out of flow. */
  position?: Responsive<"relative" | "absolute">;
  /** Top offset for absolute positioning. */
  top?: Responsive<DimensionValue>;
  /** Right offset for absolute positioning. */
  right?: Responsive<DimensionValue>;
  /** Bottom offset for absolute positioning. */
  bottom?: Responsive<DimensionValue>;
  /** Left offset for absolute positioning. */
  left?: Responsive<DimensionValue>;
  /** Shorthand for top/right/bottom/left simultaneously. */
  inset?: Responsive<DimensionValue>;
  /** Stack order for overlapping elements. Higher = on top. */
  zIndex?: Responsive<number>;
  /** Controls whether this element blocks mouse/focus events. */
  pointerEvents?: Responsive<"auto" | "none">;
  /** Background color. */
  bg?: Responsive<Color>;
  /** Border drawing style. */
  border?: Responsive<BorderStyle>;
  /** Border color (requires `border` to be set). */
  borderColor?: Responsive<Color>;
  /** Clip overflowing children (used internally by ScrollView). */
  clip?: Responsive<boolean>;
  /** Text (foreground) color. Inherited by children. */
  color?: Responsive<Color>;
  /** Render text in bold. */
  bold?: Responsive<boolean>;
  /** Render text in dim/faint. */
  dim?: Responsive<boolean>;
  /** Render text in italic. */
  italic?: Responsive<boolean>;
  /** Render text with underline. */
  underline?: Responsive<boolean>;
  /** Render text with strikethrough (ANSI SGR 9). Supported by most modern terminals. */
  strikethrough?: Responsive<boolean>;
  /** Text wrapping mode. */
  wrap?: Responsive<WrapMode>;
  /** Horizontal text alignment within the container. */
  textAlign?: Responsive<TextAlign>;
}
/**
 * Style with all {@link Responsive} values resolved to their concrete types.
 *
 * Produced by the responsive resolution pass and consumed by the internal
 * layout (Yoga) and paint systems. You normally don't need this type
 * directly — use {@link Style} instead.
 */
type ResolvedStyle = {
  [K in keyof Style]: [NonNullable<Style[K]>] extends [Responsive<infer T>]
    ? T | undefined
    : Style[K];
};
/**
 * Computed layout rectangle for a node (returned by {@link useLayout}).
 *
 * `x`, `y`, `width`, `height` are the **outer** bounds (including border).
 * `innerX`, `innerY`, `innerWidth`, `innerHeight` are the **content** bounds
 * (after border and padding).
 * @category Core
 */
interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
  innerX: number;
  innerY: number;
  innerWidth: number;
  innerHeight: number;
}
/**
 * Parsed key press information.
 *
 * Received by {@link useInput} handlers, `onKeyPress` callbacks,
 * and {@link Keybind} matching.
 * @category Core
 */
interface Key {
  /** Key name (`"a"`, `"return"`, `"escape"`, `"up"`, `"space"`, …). */
  name: string;
  /** Raw byte sequence from the terminal. */
  sequence: string;
  /** `true` when Ctrl is held. */
  ctrl?: boolean;
  /** `true` when Alt / Option is held. */
  alt?: boolean;
  /** `true` when Shift is held. */
  shift?: boolean;
  /** `true` when Meta / Cmd / Super / Win is held. */
  meta?: boolean;
}
/**
 * Mouse event from the terminal.
 *
 * Dispatched for mouse clicks, movement, and wheel scrolling when
 * the terminal has SGR mouse tracking enabled.
 */
interface MouseEvent {
  /** Event type. */
  type: "mousedown" | "mouseup" | "mousemove" | "wheel";
  /** 0-indexed column. */
  x: number;
  /** 0-indexed row. */
  y: number;
  /** 0 = left, 1 = middle, 2 = right, -1 = none (motion without button). */
  button: number;
  /** Wheel direction: 1 = down, -1 = up. Only present for `type: "wheel"`. */
  wheelDelta?: number;
  /** `true` when Ctrl is held. */
  ctrl: boolean;
  /** `true` when Alt / Option is held. */
  alt: boolean;
  /** `true` when Shift is held. */
  shift: boolean;
}
/** Mouse event handler attached to a box element via props. */
type MouseEventHandler = (event: MouseEvent) => void;
/**
 * Options for the top-level {@link render} function.
 */
interface RenderOptions {
  stdout?: NodeJS.WriteStream;
  stdin?: NodeJS.ReadStream;
  debug?: boolean;
  /** Use the terminal's native cursor instead of a simulated one. Enables cursor shaders/animations in supported terminals. Default: true */
  useNativeCursor?: boolean;
}
/**
 * Handle returned by {@link render}, used to control the application lifecycle.
 */
interface AppHandle {
  /** Tear down the React tree and clean up terminal state. */
  unmount(): void;
  /** Exit the process with an optional exit code. */
  exit(code?: number): void;
}
/**
 * Query object for {@link useMediaQuery}.
 *
 * All conditions are combined with AND — every specified constraint must be
 * satisfied for the query to match.
 *
 * @example
 * ```tsx
 * // Match when terminal is at least 80 columns wide
 * const isWide = useMediaQuery({ minColumns: 80 });
 *
 * // Match when terminal is between 40–120 columns and at least 20 rows tall
 * const isMedium = useMediaQuery({ minColumns: 40, maxColumns: 120, minRows: 20 });
 * ```
 * @category Layout
 */
interface MediaQueryInput {
  /** Minimum terminal width in columns (inclusive). */
  minColumns?: number;
  /** Maximum terminal width in columns (inclusive). */
  maxColumns?: number;
  /** Minimum terminal height in rows (inclusive). */
  minRows?: number;
  /** Maximum terminal height in rows (inclusive). */
  maxRows?: number;
}

type GlyphNodeType = "box" | "text" | "input";
type GlyphChild = GlyphNode | GlyphTextInstance;
interface GlyphNode {
  type: GlyphNodeType;
  props: Record<string, any>;
  style: Style;
  /** Style with all responsive values resolved for the current terminal size. Populated by the layout system before each frame. */
  resolvedStyle: ResolvedStyle;
  children: GlyphNode[];
  rawTextChildren: GlyphTextInstance[];
  /** All children in order (both nodes and raw text) for correct text composition */
  allChildren: GlyphChild[];
  parent: GlyphNode | null;
  yogaNode: Node | null;
  text: string | null;
  layout: LayoutRect;
  focusId: string | null;
  hidden: boolean;
  /** @internal Cache: terminal columns when resolvedStyle was last computed. */
  _lastColumns: number;
  /** @internal Cache: style object reference when resolvedStyle was last computed. */
  _lastStyleRef: Style | null;
  /** @internal Cache: resolvedStyle reference when Yoga styles were last applied. */
  _lastYogaStyle: ResolvedStyle | null;
  /** @internal Whether a Yoga measure function has been installed on this node. */
  _hasMeasureFunc: boolean;
  /** @internal Whether this node's visual content changed since the last paint. */
  _paintDirty: boolean;
  /** @internal Previous layout rect — set when layout changes so the painter can clear the OLD position. */
  _prevLayout: LayoutRect | null;
  /** @internal Cached Yoga relative left offset (avoids WASM reads when parent moved). */
  _relLeft: number;
  /** @internal Cached Yoga relative top offset (avoids WASM reads when parent moved). */
  _relTop: number;
  /** @internal Raw (unrounded) absolute X from Yoga. Used to propagate sub-pixel precision to children. */
  _rawAbsX: number;
  /** @internal Raw (unrounded) absolute Y from Yoga. Used to propagate sub-pixel precision to children. */
  _rawAbsY: number;
  /** @internal Cached text rasterization result (managed by painter.ts). */
  _textCache: any;
}
interface GlyphTextInstance {
  type: "raw-text";
  text: string;
  parent: GlyphNode | null;
}

/** Per-phase timing breakdown of a single `performRender` call (ms). */
interface FrameTiming {
  /** Total frame time (layout + paint + diff + swap). */
  total: number;
  /** Responsive style resolution + Yoga layout. */
  layout: number;
  /** Rasterise GlyphNode tree into the framebuffer. */
  paint: number;
  /** Character-level diff + ANSI escape generation. */
  diff: number;
  /** Copy currentFb → prevFb. */
  swap: number;
}
/**
 * Options for {@link ScrollViewContextValue.scrollTo} and
 * {@link FocusableHandle.scrollIntoView}.
 *
 * @example
 * ```tsx
 * ref.current?.scrollIntoView({ block: "center" });
 * ```
 * @category Navigation
 */
interface ScrollIntoViewOptions {
  /**
   * Where to align the element relative to the viewport.
   * - `"nearest"` — minimal scroll to make visible (default)
   * - `"start"` — align element top with viewport top
   * - `"center"` — center element in viewport
   * - `"end"` — align element bottom with viewport bottom
   */
  block?: "start" | "center" | "end" | "nearest";
}
/** Global mouse event handler. Receives the event and the hit-tested node (or null). */
type GlobalMouseHandler = (event: MouseEvent, node: GlyphNode | null) => void;
interface MouseContextValue {
  /** Subscribe to all mouse events. Returns an unsubscribe function. */
  subscribe(handler: GlobalMouseHandler): () => void;
}

/**
 * DOM-like imperative handles for focusable components.
 * Use these with React refs to programmatically control components.
 *
 * @example
 * ```tsx
 * const inputRef = useRef<InputHandle>(null);
 *
 * // Programmatic focus
 * inputRef.current?.focus();
 *
 * // Read current value
 * console.log(inputRef.current?.value);
 *
 * <Input ref={inputRef} onChange={setValue} />
 * ```
 */
/**
 * Base handle shared by all focusable elements
 * @category Core
 */
interface FocusableHandle {
  /** Programmatically focus this element */
  focus(): void;
  /** Programmatically blur (unfocus) this element */
  blur(): void;
  /** Whether this element is currently focused */
  readonly isFocused: boolean;
  /**
   * Scroll the nearest parent {@link ScrollView} to make this element visible.
   * Behaves like the DOM `Element.scrollIntoView()` method.
   * No-op if the element is not inside a ScrollView.
   *
   * @param options - Alignment options (default: `{ block: "nearest" }`)
   *
   * @example
   * ```tsx
   * const inputRef = useRef<InputHandle>(null);
   *
   * // Minimal scroll — just enough to make it visible
   * inputRef.current?.scrollIntoView();
   *
   * // Center the element in the viewport
   * inputRef.current?.scrollIntoView({ block: "center" });
   * ```
   */
  scrollIntoView(options?: ScrollIntoViewOptions): void;
}
/** Handle for Button */
interface ButtonHandle extends FocusableHandle {
}
/** Handle for Input — exposes current value */
interface InputHandle extends FocusableHandle {
  /** Current text value */
  readonly value: string;
}
/** Handle for Select — exposes current selected value */
interface SelectHandle extends FocusableHandle {
  /** Currently selected value (undefined if nothing selected) */
  readonly value: string | undefined;
  /** Whether the dropdown is currently open */
  readonly isOpen: boolean;
}
/** Handle for Checkbox — exposes checked state */
interface CheckboxHandle extends FocusableHandle {
  /** Whether the checkbox is currently checked */
  readonly checked: boolean;
}
/** Handle for Radio — exposes selected value */
interface RadioHandle<T = string> extends FocusableHandle {
  /** Currently selected value */
  readonly value: T | undefined;
}
/** Handle for List — exposes selected index */
interface ListHandle extends FocusableHandle {
  /** Currently selected index */
  readonly selectedIndex: number;
}
/** Handle for Image */
interface ImageHandle extends FocusableHandle {
}
/** Handle for Link */
interface LinkHandle extends FocusableHandle {
}
/** Handle for Text (when focusable) */
interface TextHandle extends FocusableHandle {
}

/**
 * Mount a React element into the terminal and start the render loop.
 *
 * This is the entry point for every Glyph application. It sets up the
 * terminal (raw mode, alternate screen), creates the React reconciler,
 * and begins painting frames.
 *
 * @param element - Root React element to render.
 * @param opts - Optional configuration (custom streams, debug mode, cursor).
 * @returns An {@link AppHandle} with `unmount()` and `exit()` methods.
 *
 * @example
 * ```tsx
 * import { render, Box, Text } from "@semos-labs/glyph";
 *
 * function App() {
 *   return (
 *     <Box style={{ padding: 1 }}>
 *       <Text style={{ bold: true, color: "cyan" }}>Hello Glyph!</Text>
 *     </Box>
 *   );
 * }
 *
 * render(<App />);
 * ```
 * @category Core
 */
declare function render(element: ReactElement, opts?: RenderOptions): AppHandle;

/**
 * Props for the {@link Box} component.
 */
interface BoxProps {
  /** Flexbox style object controlling layout, colors, borders, and more. */
  style?: Style;
  /** Child elements to render inside the box. */
  children?: ReactNode;
  /** When `true`, the box participates in the focus (Tab) order. */
  focusable?: boolean;
  /** Called on mouse click (mouseup). */
  onClick?: MouseEventHandler;
  /** Called on mouse button press. */
  onMouseDown?: MouseEventHandler;
  /** Called on mouse button release. */
  onMouseUp?: MouseEventHandler;
  /** Called on mouse wheel scroll. */
  onWheel?: MouseEventHandler;
  /** Called when the mouse cursor enters the box. */
  onMouseEnter?: MouseEventHandler;
  /** Called when the mouse cursor leaves the box. */
  onMouseLeave?: MouseEventHandler;
  /** Called on mouse movement over the box. */
  onMouseMove?: MouseEventHandler;
}
/**
 * Generic layout container — the building block of every Glyph UI.
 *
 * `Box` maps directly to a Yoga flexbox node, so all CSS-like flex
 * properties (`flexDirection`, `gap`, `padding`, `alignItems`, …) work
 * out of the box.
 *
 * @example
 * ```tsx
 * <Box style={{ flexDirection: "row", gap: 1, padding: 1 }}>
 *   <Text>Hello</Text>
 *   <Text>World</Text>
 * </Box>
 * ```
 *
 * @example
 * ```tsx
 * // Centered card with a border
 * <Box
 *   style={{
 *     border: "round",
 *     borderColor: "cyan",
 *     padding: 1,
 *     alignItems: "center",
 *     justifyContent: "center",
 *     width: 40,
 *     height: 10,
 *   }}
 * >
 *   <Text style={{ bold: true }}>Welcome!</Text>
 * </Box>
 * ```
 * @category Layout
 */
declare const Box: React.ForwardRefExoticComponent<
  BoxProps & React.RefAttributes<GlyphNode>
>;

/**
 * Props for the {@link Text} component.
 */
interface TextProps {
  /** Text style (color, bold, dim, italic, underline, etc.). */
  style?: Style;
  /**
   * Text content. Can be a string, number, or nested `<Text>` elements
   * for rich inline styling (bold words inside a sentence, etc.).
   */
  children?: ReactNode;
  /**
   * Text wrapping mode. Overrides `style.wrap`.
   * - `"wrap"` — soft-wrap at the container edge (default)
   * - `"truncate"` — cut off with no indicator
   * - `"ellipsis"` — cut off with `…`
   * - `"none"` — no wrapping at all
   */
  wrap?: Style["wrap"];
  /** When `true`, the text element participates in the focus (Tab) order. */
  focusable?: boolean;
  /** Style applied when this element is focused (merged with `style`). */
  focusedStyle?: Style;
}
/**
 * Renders styled text in the terminal.
 *
 * Supports inline nesting for rich text — wrap portions of text in
 * additional `<Text>` elements with different styles:
 *
 * @example
 * ```tsx
 * <Text style={{ color: "white" }}>
 *   Hello <Text style={{ bold: true, color: "cyan" }}>World</Text>!
 * </Text>
 * ```
 *
 * @example
 * ```tsx
 * // Focusable text with highlight
 * <Text focusable focusedStyle={{ bg: "cyan", color: "black" }}>
 *   Press Tab to reach me
 * </Text>
 * ```
 * @category Layout
 */
declare const Text: React.ForwardRefExoticComponent<
  TextProps & React.RefAttributes<TextHandle>
>;

/** Input type for value validation. */
type InputType = "text" | "number";
/**
 * Props for the {@link Input} component.
 */
interface InputProps {
  /** Controlled value. Pair with `onChange` to manage state externally. */
  value?: string;
  /** Initial value for uncontrolled mode (ignored when `value` is provided). */
  defaultValue?: string;
  /** Callback fired whenever the text value changes. */
  onChange?: (value: string) => void;
  /** Called on every key press. Return `true` to prevent default handling. */
  onKeyPress?: (key: Key) => boolean | void;
  /**
   * Called before a value change is applied. Useful for input masking/validation.
   * @param newValue - The proposed new value
   * @param oldValue - The current value
   * @returns
   *   - `string` to use a different value (and cursor moves to end of returned string)
   *   - `false` to reject the change entirely
   *   - `undefined` to accept the change as-is
   */
  onBeforeChange?: (
    newValue: string,
    oldValue: string,
  ) => string | false | void;
  /** Text shown when the input is empty. */
  placeholder?: string;
  /** Base style for the input container. */
  style?: Style;
  /** Style when focused (merged with style). */
  focusedStyle?: Style;
  /** Enable multiline editing (Enter inserts newlines, Up/Down navigate lines). */
  multiline?: boolean;
  /** Automatically focus this input when mounted. */
  autoFocus?: boolean;
  /**
   * Input type for validation:
   * - "text" (default): accepts any character
   * - "number": only accepts digits, decimal point, and minus sign
   */
  type?: InputType;
}
/**
 * Text input with full keyboard editing, cursor navigation, and optional masking.
 *
 * Supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`)
 * modes. Multiline editing is opt-in via the `multiline` prop.
 *
 * **Keyboard shortcuts** (when focused):
 * | Key | Action |
 * |---|---|
 * | ← / → | Move cursor |
 * | Home / End | Start / end of line |
 * | Ctrl+A / Ctrl+E | Start / end of line |
 * | Ctrl+W | Delete word backward |
 * | Ctrl+K | Delete to end of line |
 * | Alt+← / Alt+→ | Move by word |
 * | Alt+Backspace | Delete word backward |
 * | Up / Down | Navigate visual lines (multiline / wrapped) |
 *
 * @example
 * ```tsx
 * const [name, setName] = useState("");
 *
 * <Input
 *   value={name}
 *   onChange={setName}
 *   placeholder="Your name"
 *   style={{ border: "round", paddingX: 1 }}
 *   focusedStyle={{ borderColor: "cyan" }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Masked phone input
 * import { masks } from "@semos-labs/glyph";
 *
 * <Input
 *   value={phone}
 *   onChange={setPhone}
 *   onBeforeChange={masks.usPhone}
 *   placeholder="(555) 555-5555"
 * />
 * ```
 * @category Form
 */
declare const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<InputHandle>
>;

/**
 * Props for the {@link FocusScope} component.
 */
interface FocusScopeProps {
  /**
   * When `true`, Tab/Shift+Tab cycling is confined to the children
   * of this scope. Previous focus is restored when the scope unmounts.
   */
  trap?: boolean;
  /** Children that participate in the trapped focus cycle. */
  children?: ReactNode;
}
/**
 * Confines keyboard focus to a sub-tree.
 *
 * Wrap a dialog, modal, or drawer with `<FocusScope trap>` to prevent
 * Tab from escaping. When the scope unmounts, the previously focused
 * element is restored automatically.
 *
 * @example
 * ```tsx
 * <FocusScope trap>
 *   <Box style={{ border: "round", padding: 1 }}>
 *     <Input placeholder="Name" />
 *     <Button label="OK" onPress={close} />
 *   </Box>
 * </FocusScope>
 * ```
 * @category Navigation
 */
declare function FocusScope(
  { trap, children }: FocusScopeProps,
): React.JSX.Element;

/**
 * Props for the {@link Spacer} component.
 */
interface SpacerProps {
  /** Flex grow factor. Default `1`. Set higher values to take proportionally more space. */
  size?: number;
}
/**
 * Flexible spacer that pushes siblings apart.
 *
 * Renders an invisible `Box` with `flexGrow`. Drop it between elements
 * in a row or column to push them to opposite edges, or use multiple
 * spacers to distribute space evenly.
 *
 * @example
 * ```tsx
 * // Push "Save" to the right edge
 * <Box style={{ flexDirection: "row" }}>
 *   <Text>Title</Text>
 *   <Spacer />
 *   <Button label="Save" onPress={save} />
 * </Box>
 * ```
 * @category Layout
 */
declare function Spacer({ size }: SpacerProps): React.JSX.Element;

/**
 * Props for the {@link Keybind} component.
 */
interface KeybindProps {
  /** Key descriptor, e.g. "q", "escape", "ctrl+c", "ctrl+shift+a" */
  keypress: string;
  /** Handler called when the key matches */
  onPress: () => void;
  /** Only fire when this focus ID is active */
  whenFocused?: string;
  /** Only fire when nothing is focused or the focused element doesn't consume the key */
  global?: boolean;
  /**
   * If true, this keybind runs BEFORE focused input handlers.
   * Use for keybinds that should work even when an Input is focused (e.g., Ctrl+Enter to submit).
   */
  priority?: boolean;
  /** Disabled state */
  disabled?: boolean;
}
/**
 * Declarative keyboard shortcut handler (renders nothing).
 *
 * Add `<Keybind>` anywhere in your tree to react to specific key
 * combinations. Supports modifier keys (`ctrl`, `alt`, `shift`, `meta`)
 * and a `priority` flag to run before focused input handlers.
 *
 * @example
 * ```tsx
 * // Global quit shortcut
 * <Keybind keypress="ctrl+q" onPress={() => exit()} />
 * ```
 *
 * @example
 * ```tsx
 * // Priority keybind that fires even when an Input is focused
 * <Keybind keypress="ctrl+enter" onPress={submit} priority />
 * ```
 *
 * @example
 * ```tsx
 * // Only fires when a specific element is focused
 * <Keybind keypress="delete" onPress={handleDelete} whenFocused={itemFocusId} />
 * ```
 * @category Keybindings
 */
declare function Keybind(
  { keypress, onPress, whenFocused, priority, disabled }: KeybindProps,
): null;

/**
 * Props for the {@link Portal} component.
 */
interface PortalProps {
  /** Content to render in the overlay layer. */
  children?: ReactNode;
  /** Stack order (higher = on top). Default `1000`. */
  zIndex?: number;
}
/**
 * Renders children as a fullscreen absolute overlay on top of the main tree.
 *
 * Useful for modals, notifications, and dropdowns that should paint
 * above all other content.
 *
 * @example
 * ```tsx
 * {showModal && (
 *   <Portal>
 *     <Box style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
 *       <Box style={{ border: "round", padding: 2, bg: "black" }}>
 *         <Text>I'm an overlay!</Text>
 *       </Box>
 *     </Box>
 *   </Portal>
 * )}
 * ```
 * @category Layout
 */
declare function Portal({ children, zIndex }: PortalProps): React.JSX.Element;

/**
 * Props for the {@link Button} component.
 */
interface ButtonProps {
  /** Callback fired when the button is activated (Enter or Space). */
  onPress?: () => void;
  /** Shorthand text label. When provided and `children` is absent, renders the label as text. */
  label?: string;
  /** Base style for the button container. */
  style?: Style;
  /** Style applied when the button is focused (merged with `style`). */
  focusedStyle?: Style;
  /** Custom content. Takes precedence over `label` when both are provided. */
  children?: ReactNode;
  /** When `true`, the button is skipped in the focus order and ignores input. */
  disabled?: boolean;
}
/**
 * Focusable button that triggers an action on Enter or Space.
 *
 * @example
 * ```tsx
 * <Button
 *   label="Save"
 *   onPress={() => save()}
 *   style={{ border: "round", paddingX: 2 }}
 *   focusedStyle={{ bg: "cyan", color: "black" }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Using children for custom content
 * <Button onPress={handleClick}>
 *   <Text style={{ bold: true }}>🚀 Launch</Text>
 * </Button>
 * ```
 * @category Form
 */
declare const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<ButtonHandle>
>;

/**
 * Visible range passed to the render function in virtualized mode.
 * Contains the start/end indices and viewport metadata.
 */
interface VisibleRange {
  /** First visible line index (0-based) */
  start: number;
  /** One past the last visible line index */
  end: number;
  /** Current scroll offset */
  scrollOffset: number;
  /** Viewport height in lines */
  viewportHeight: number;
}
/**
 * Props for the {@link ScrollView} component.
 */
interface ScrollViewProps {
  /**
   * Children to render. Can also be a render function
   * `(range: VisibleRange) => ReactNode` for line-based virtualization.
   */
  children?: ReactNode | ((range: VisibleRange) => ReactNode);
  style?: Style;
  /** Controlled scroll offset (rows from top) */
  scrollOffset?: number;
  /** Callback when scroll offset should change (controlled mode) */
  onScroll?: (offset: number) => void;
  /** Initial offset for uncontrolled mode */
  defaultScrollOffset?: number;
  /** Lines to scroll per arrow key press (default: 1) */
  scrollStep?: number;
  /** Disable keyboard scrolling */
  disableKeyboard?: boolean;
  /** Auto-scroll to focused element (default: true) */
  scrollToFocus?: boolean;
  /** Show scrollbar when content is scrollable (default: true) */
  showScrollbar?: boolean;
  /** Make ScrollView itself focusable. Default: true. Set to false if you want scroll to follow child focus only. */
  focusable?: boolean;
  /** Style applied when ScrollView is focused */
  focusedStyle?: Style;
  /**
   * Total content height in lines (for render function mode).
   * When set with a render function, enables line-based virtualization.
   */
  totalLines?: number;
  /** Extra lines to render above/below viewport (default: 2) */
  overscan?: number;
  /**
   * Enable sliding-window virtualization for array children.
   * When true, only visible items (+ overscan) are mounted.
   * When false (default), all children are rendered and clipped — like
   * browser overflow scrolling.  This gives Yoga full layout info so
   * `scrollIntoView` / follow-focus positions are always accurate.
   */
  virtualize?: boolean;
  /**
   * Estimated height per child in lines (default: 1).
   * Only used in virtualized mode for initial scroll calculations
   * before actual heights are measured.
   */
  estimatedItemHeight?: number;
}
/**
 * Imperative handle exposed by `ScrollView` via `React.forwardRef`.
 *
 * @example
 * ```tsx
 * const ref = useRef<ScrollViewHandle>(null);
 * <ScrollView ref={ref} style={{ height: 20 }}>
 *   {items.map(…)}
 * </ScrollView>
 *
 * // Scroll to item index 10, centered:
 * ref.current?.scrollToIndex(10, { block: "center" });
 * ```
 * @category Layout
 */
interface ScrollViewHandle {
  /** Scroll to make the child at `index` visible (even off-screen items). */
  scrollToIndex(index: number, options?: ScrollIntoViewOptions): void;
  /** Scroll to make the given node visible. */
  scrollTo(node: GlyphNode, options?: ScrollIntoViewOptions): void;
}
/**
 * Scrollable container.
 *
 * Supports three modes:
 * 1. **Array children** (default) — all children rendered, overflow clipped.
 *    Yoga has every layout position, so follow-focus is pixel-perfect.
 * 2. **Virtualized array** (`virtualize` prop) — only visible items mounted
 *    (sliding window).  Good for huge lists where rendering everything would
 *    be too expensive.
 * 3. **Line virtualization** — pass a render function + `totalLines`.
 *
 * Auto-scrolls to keep the focused child visible when `scrollToFocus` is
 * `true` (default).
 *
 * **Keyboard shortcuts** (when the ScrollView or a child has focus):
 * | Key | Action |
 * |---|---|
 * | Page Up / Page Down | Scroll one page |
 * | Ctrl+D / Ctrl+U | Half-page down / up |
 * | Ctrl+F / Ctrl+B | Full-page down / up |
 *
 * @example
 * ```tsx
 * // Basic scrollable list — all children rendered, overflow clipped
 * <ScrollView style={{ height: 10, border: "round" }}>
 *   {items.map((item) => (
 *     <Text key={item.id}>{item.name}</Text>
 *   ))}
 * </ScrollView>
 * ```
 *
 * @example
 * ```tsx
 * // Virtualized list — only visible items mounted
 * <ScrollView virtualize style={{ height: 10, border: "round" }}>
 *   {items.map((item) => (
 *     <Text key={item.id}>{item.name}</Text>
 *   ))}
 * </ScrollView>
 * ```
 *
 * @example
 * ```tsx
 * // Line-based virtualization with render function
 * <ScrollView totalLines={100_000} style={{ height: 20 }}>
 *   {({ start, end }) =>
 *     Array.from({ length: end - start }, (_, i) => (
 *       <Text key={start + i}>Line {start + i}</Text>
 *     ))
 *   }
 * </ScrollView>
 * ```
 * @category Layout
 */
declare const ScrollView: React.ForwardRefExoticComponent<
  ScrollViewProps & React.RefAttributes<ScrollViewHandle>
>;

/**
 * Information passed to each item's render function.
 */
interface ListItemInfo {
  /** Zero-based index of this item. */
  index: number;
  /** Whether this item is currently selected (highlighted). */
  selected: boolean;
  /** Whether the List component itself has focus. */
  focused: boolean;
}
/**
 * Props for the {@link List} component.
 */
interface ListProps {
  /** Total number of items */
  count: number;
  /** Render function for each item */
  renderItem: (info: ListItemInfo) => ReactNode;
  /** Controlled selected index */
  selectedIndex?: number;
  /** Callback when selected index should change */
  onSelectionChange?: (index: number) => void;
  /** Callback when enter is pressed on selected item */
  onSelect?: (index: number) => void;
  /** Initial index for uncontrolled mode */
  defaultSelectedIndex?: number;
  /** Set of disabled indices that are skipped during navigation */
  disabledIndices?: Set<number>;
  /** Outer box style */
  style?: Style;
  /** Whether the list is focusable (default: true) */
  focusable?: boolean;
}
/**
 * Keyboard-navigable list with vim-style bindings.
 *
 * Renders `count` items via a `renderItem` function, managing selection
 * state internally or through controlled props.
 *
 * **Keyboard shortcuts** (when focused):
 * | Key | Action |
 * |---|---|
 * | ↑ / k | Move selection up |
 * | ↓ / j | Move selection down |
 * | gg | Jump to first item |
 * | G | Jump to last item |
 * | Enter | Confirm selection |
 *
 * @example
 * ```tsx
 * <List
 *   count={items.length}
 *   renderItem={({ index, selected, focused }) => (
 *     <Box style={{ bg: selected && focused ? "cyan" : undefined }}>
 *       <Text>{items[index].name}</Text>
 *     </Box>
 *   )}
 *   onSelect={(index) => console.log("Selected:", items[index])}
 * />
 * ```
 * @category Navigation
 */
declare const List: React.ForwardRefExoticComponent<
  ListProps & React.RefAttributes<ListHandle>
>;

/**
 * A single item in a {@link Menu}.
 */
interface MenuItem {
  /** Display text. */
  label: string;
  /** Value returned when this item is selected. */
  value: string;
  /** When `true`, the item is dimmed and cannot be selected. */
  disabled?: boolean;
}
/**
 * Props for the {@link Menu} component.
 */
interface MenuProps {
  items: MenuItem[];
  /** Controlled selected index */
  selectedIndex?: number;
  /** Callback when selected index changes */
  onSelectionChange?: (index: number) => void;
  /** Callback when enter is pressed on item */
  onSelect?: (value: string, index: number) => void;
  /** Initial index for uncontrolled mode */
  defaultSelectedIndex?: number;
  /** Outer box style */
  style?: Style;
  /** Color for the selected item indicator and text (default: "cyan") */
  highlightColor?: Color;
  /** Whether the menu is focusable (default: true) */
  focusable?: boolean;
}
/**
 * Pre-styled menu built on top of {@link List}.
 *
 * Renders a vertical list of labeled items with a `>` selection indicator
 * and highlight color. Navigation uses the same keyboard shortcuts as
 * `List` (↑/↓, j/k, gg/G, Enter).
 *
 * @example
 * ```tsx
 * <Menu
 *   items={[
 *     { label: "New File",  value: "new" },
 *     { label: "Open...",   value: "open" },
 *     { label: "Quit",      value: "quit" },
 *   ]}
 *   onSelect={(value) => handleAction(value)}
 *   highlightColor="magenta"
 * />
 * ```
 * @category Navigation
 */
declare function Menu(
  {
    items,
    selectedIndex,
    onSelectionChange,
    onSelect,
    defaultSelectedIndex,
    style,
    highlightColor,
    focusable,
  }: MenuProps,
): React.JSX.Element;

/**
 * Props for the {@link Progress} component.
 */
interface ProgressProps {
  /** Progress value 0..1. Omit when indeterminate. */
  value?: number;
  /** Animate as indeterminate (marquee). Default false. */
  indeterminate?: boolean;
  /** Width of the progress bar. Default "100%". */
  width?: DimensionValue;
  /** Optional label text displayed before the bar. */
  label?: string;
  /** Show percentage text after the bar. Default false. */
  showPercent?: boolean;
  /** Outer container style. */
  style?: Style;
  /** Character(s) for the filled portion. Default "█". */
  filled?: string;
  /** Character(s) for the empty portion. Default "░". */
  empty?: string;
}
/**
 * Horizontal progress bar with determinate and indeterminate modes.
 *
 * In **determinate** mode the filled / empty proportions are rendered
 * as two {@link Box} elements whose widths are controlled by Yoga
 * (percentage + flexGrow).  This means the bar resizes instantly on
 * terminal resize with no extra React render cycle.
 *
 * In **indeterminate** mode the marquee animation uses {@link useLayout}
 * to read the exact track width.  The 100 ms animation timer provides
 * frequent re-renders so any stale value is corrected quickly.
 *
 * @example
 * ```tsx
 * // Determinate progress
 * <Progress value={0.65} showPercent label="Downloading" />
 * ```
 *
 * @example
 * ```tsx
 * // Indeterminate marquee
 * <Progress indeterminate label="Loading..." />
 * ```
 * @category Feedback
 */
declare function Progress(
  { value, indeterminate, width, label, showPercent, style, filled, empty }:
    ProgressProps,
): React.JSX.Element;

/**
 * Props for the {@link Spinner} component.
 */
interface SpinnerProps {
  /** Animation frames. Defaults to braille dots. */
  frames?: string[];
  /** Interval between frames in ms. Default 80. */
  intervalMs?: number;
  /** Optional label text next to the spinner. */
  label?: string;
  /** Style applied to the spinner character. */
  style?: Style;
}
/**
 * Animated spinner indicator.
 *
 * Uses braille dot characters by default, cycling at 80 ms per frame.
 * Supply custom `frames` for different animation styles.
 *
 * @example
 * ```tsx
 * <Spinner label="Loading..." style={{ color: "cyan" }} />
 * ```
 *
 * @example
 * ```tsx
 * // Custom frames
 * <Spinner frames={["◐", "◓", "◑", "◒"]} intervalMs={120} />
 * ```
 * @category Feedback
 */
declare function Spinner(
  { frames, intervalMs, label, style }: SpinnerProps,
): React.JSX.Element;

/** Visual variant for a toast notification.
 */
type ToastVariant = "info" | "success" | "warning" | "error";
/**
 * A single toast notification.
 */
interface Toast {
  /** Unique identifier (auto-generated by {@link useToast}). */
  id: string;
  /** Main message body. */
  message: string;
  /** Optional bold title above the message. */
  title?: string;
  /** Color variant. Default `"info"`. */
  variant?: ToastVariant;
  /** Auto-dismiss duration in ms. Default `3000`. Set `0` to persist. */
  durationMs?: number;
}
/**
 * Screen corner where toasts are displayed.
 */
type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";
/**
 * Props for the {@link ToastHost} component.
 */
interface ToastHostProps {
  /** Where toasts appear. Default `"bottom-right"`. */
  position?: ToastPosition;
  /** Maximum number of toasts visible simultaneously. Default `5`. */
  maxVisible?: number;
  /** Application content. */
  children?: ReactNode;
}
/**
 * Push toast notifications from anywhere inside a {@link ToastHost}.
 *
 * @returns A function that accepts a toast payload (without `id`).
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * toast({ message: "Saved!", variant: "success" });
 * toast({ title: "Error", message: "Network failure", variant: "error", durationMs: 5000 });
 * ```
 * @category Feedback
 */
declare function useToast(): (toast: Omit<Toast, "id">) => void;
/**
 * Container that renders toast notifications for its children.
 *
 * Place `<ToastHost>` near the root of your app. Children call
 * {@link useToast} to push notifications.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ToastHost position="bottom-right">
 *       <MyApp />
 *     </ToastHost>
 *   );
 * }
 * ```
 * @category Feedback
 */
declare function ToastHost(
  { position, maxVisible, children }: ToastHostProps,
): React.JSX.Element;

/**
 * A single option inside a {@link Select} dropdown.
 */
interface SelectItem {
  /** Display text shown in the dropdown. */
  label: string;
  /** Value returned when this item is selected. */
  value: string;
  /** When `true`, the item is dimmed and cannot be selected. */
  disabled?: boolean;
}
/**
 * Props for the {@link Select} component.
 */
interface SelectProps {
  /** List of selectable items */
  items: SelectItem[];
  /** Currently selected value (controlled) */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Trigger box style */
  style?: Style;
  /** Trigger style when focused */
  focusedStyle?: Style;
  /** Dropdown overlay style overrides */
  dropdownStyle?: Style;
  /** Highlight color for the selected item in the dropdown (default: "cyan") */
  highlightColor?: Color;
  /** Max visible items in the dropdown before scrolling (default: 8) */
  maxVisible?: number;
  /** Enable type-to-filter when dropdown is open (default: true) */
  searchable?: boolean;
  /** Force dropdown open direction: "up", "down", or "auto" (default: "auto") */
  openDirection?: "up" | "down" | "auto";
  /** Disabled state */
  disabled?: boolean;
}
/**
 * Dropdown select with keyboard navigation, type-to-filter, and scrolling.
 *
 * Opens on **Space** or **Enter**. Close with **Escape** or **Tab**.
 * Type to filter when open (if `searchable` is enabled).
 *
 * Automatically detects whether to open upward or downward based on
 * available space, unless you override with `openDirection`.
 *
 * @example
 * ```tsx
 * const [color, setColor] = useState<string>();
 *
 * <Select
 *   items={[
 *     { label: "Red",   value: "red" },
 *     { label: "Green", value: "green" },
 *     { label: "Blue",  value: "blue" },
 *   ]}
 *   value={color}
 *   onChange={setColor}
 *   placeholder="Pick a color"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Force dropdown to always open upward
 * <Select items={items} value={v} onChange={setV} openDirection="up" />
 * ```
 * @category Form
 */
declare const Select: React.ForwardRefExoticComponent<
  SelectProps & React.RefAttributes<SelectHandle>
>;

/**
 * Props for the {@link Checkbox} component.
 */
interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Called when the checkbox is toggled */
  onChange: (checked: boolean) => void;
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Style for the checkbox container */
  style?: Style;
  /** Style when focused */
  focusedStyle?: Style;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Custom character for checked state (default: "✓") */
  checkedChar?: string;
  /** Custom character for unchecked state (default: " ") */
  uncheckedChar?: string;
}
/**
 * Toggle checkbox with label. Activated via Space or Enter.
 *
 * @example
 * ```tsx
 * const [agreed, setAgreed] = useState(false);
 *
 * <Checkbox
 *   checked={agreed}
 *   onChange={setAgreed}
 *   label="I agree to the terms"
 *   focusedStyle={{ bg: "cyan", color: "black" }}
 * />
 * ```
 * @category Form
 */
declare const Checkbox: React.ForwardRefExoticComponent<
  CheckboxProps & React.RefAttributes<CheckboxHandle>
>;

/**
 * A single option inside a {@link Radio} group.
 */
interface RadioItem<T = string> {
  /** Display label */
  label: string;
  /** Value returned on selection */
  value: T;
  /** Whether this option is disabled */
  disabled?: boolean;
}
/**
 * Props for the {@link Radio} group component.
 */
interface RadioProps<T = string> {
  /** Radio options */
  items: RadioItem<T>[];
  /** Currently selected value */
  value: T | undefined;
  /** Called when selection changes */
  onChange: (value: T) => void;
  /** Style for the radio group container */
  style?: Style;
  /** Style for each radio item */
  itemStyle?: Style;
  /** Style for the focused item */
  focusedItemStyle?: Style;
  /** Style for the selected item */
  selectedItemStyle?: Style;
  /** Whether the entire group is disabled */
  disabled?: boolean;
  /** Layout direction (default: "column") */
  direction?: "row" | "column";
  /** Gap between items (default: 0) */
  gap?: number;
  /** Custom character for selected state (default: "(●)") */
  selectedChar?: string;
  /** Custom character for unselected state (default: "(○)") */
  unselectedChar?: string;
}
/**
 * Single-select radio group with keyboard navigation.
 *
 * Navigate items with ↑/↓ (or j/k), select with Space or Enter.
 * Supports both horizontal and vertical layout via `direction`.
 *
 * @example
 * ```tsx
 * const [size, setSize] = useState<string>();
 *
 * <Radio
 *   items={[
 *     { label: "Small",  value: "sm" },
 *     { label: "Medium", value: "md" },
 *     { label: "Large",  value: "lg" },
 *   ]}
 *   value={size}
 *   onChange={setSize}
 * />
 * ```
 * @category Form
 */
declare const Radio: <T = string>(
  props: RadioProps<T> & React.RefAttributes<RadioHandle<T>>,
) => React.JSX.Element;

interface AlertOptions {
  /** Text for the OK button (default: "OK")
   */
  okText?: string;
  /** Style for the dialog box */
  style?: Style;
  /** Base style for buttons */
  buttonStyle?: Style;
  /** Style for the OK button (merged with buttonStyle) */
  okButtonStyle?: Style;
  /** Style for focused button state (merged with button styles) */
  focusedButtonStyle?: Style;
  /** Style for the backdrop overlay */
  backdropStyle?: Style;
}
interface ConfirmOptions extends AlertOptions {
  /** Text for the Cancel button (default: "Cancel") */
  cancelText?: string;
  /** Style for the Cancel button (merged with buttonStyle) */
  cancelButtonStyle?: Style;
}
interface DialogContextValue {
  /** Show an alert dialog. Returns a promise that resolves when dismissed. */
  alert: (content: ReactNode, options?: AlertOptions) => Promise<void>;
  /** Show a confirm dialog. Returns a promise that resolves to true (OK) or false (Cancel). */
  confirm: (content: ReactNode, options?: ConfirmOptions) => Promise<boolean>;
}
/**
 * Hook to show alert and confirm dialogs.
 * Must be used within a DialogHost.
 *
 * @example
 * ```tsx
 * const { alert, confirm } = useDialog();
 *
 * // Alert
 * await alert("Something happened!");
 *
 * // Confirm
 * const ok = await confirm("Delete this item?", {
 *   okText: "Delete",
 *   cancelText: "Keep"
 * });
 * ```
 * @category Feedback
 */
declare function useDialog(): DialogContextValue;
interface DialogHostProps {
  children?: ReactNode;
}
/**
 * Host component for dialogs. Place this at the root of your app.
 * Provides the useDialog hook to children.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DialogHost>
 *       <MyApp />
 *     </DialogHost>
 *   );
 * }
 * ```
 * @category Feedback
 */
declare function DialogHost({ children }: DialogHostProps): React.JSX.Element;

/**
 * Props for the {@link JumpNav} component.
 */
interface JumpNavProps {
  children?: ReactNode;
  /** Keybind to activate jump mode (default: "ctrl+o") */
  activationKey?: string;
  /** Style for the hint labels */
  hintStyle?: Style;
  /** Color for hint background (default: "yellow") */
  hintBg?: Color;
  /** Color for hint text (default: "black") */
  hintFg?: Color;
  /** Characters to use for hints (default: "asdfghjklqwertyuiopzxcvbnm") */
  hintChars?: string;
  /** Whether jump nav is enabled (default: true) */
  enabled?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}
/**
 * Vim-style quick-jump navigation to any focusable element.
 *
 * Press the activation key (default **Ctrl+O**) to overlay hint labels
 * next to every visible focusable element. Then press the hint character(s)
 * to instantly focus that element.
 *
 * Trap-aware — automatically scopes hints to the active {@link FocusScope}
 * trap (e.g. a modal). Place a single `<JumpNav>` at the root of your app.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <JumpNav>
 *       <Box>
 *         <Input placeholder="Name" />
 *         <Button label="Submit" onPress={submit} />
 *       </Box>
 *     </JumpNav>
 *   );
 * }
 * ```
 * @category Navigation
 */
declare function JumpNav(
  {
    children,
    activationKey,
    hintStyle,
    hintBg,
    hintFg,
    hintChars,
    enabled,
    debug,
  }: JumpNavProps,
): React.JSX.Element;

/**
 * @module Image
 * Image component for terminal UIs.
 *
 * Supports inline rendering via terminal graphics protocols (Kitty, iTerm2)
 * and OS-level preview (Quick Look on macOS, xdg-open on Linux).
 */

/**
 * Lifecycle state of the {@link Image} component.
 * - `"placeholder"` — waiting for user to press Space to load
 * - `"loading"` — image data is being fetched / decoded
 * - `"loaded"` — rendered inline via Kitty / iTerm2 protocol
 * - `"error"` — loading failed
 * - `"preview"` — opened via OS-level preview (Quick Look / xdg-open)
 */
type ImageState = "placeholder" | "loading" | "loaded" | "error" | "preview";
/**
 * Props for the {@link Image} component.
 */
interface ImageProps {
  /** Image source - local path or remote URL */
  src: string;
  /** Fixed width in cells (optional, uses flexbox if not set) */
  width?: number;
  /** Fixed height in cells (optional, uses flexbox if not set) */
  height?: number;
  /** Container style (flexbox) */
  style?: Style;
  /** Style when focused */
  focusedStyle?: Style;
  /** Style for the placeholder */
  placeholderStyle?: Style;
  /** Whether the component is focusable (default: true) */
  focusable?: boolean;
  /** Whether the component is disabled (skipped in tab order, no key handling) */
  disabled?: boolean;
  /** Allow inline rendering in terminal (default: true) */
  inline?: boolean;
  /** Custom placeholder text (default: image name) */
  placeholder?: string;
  /** Called when image state changes */
  onStateChange?: (state: ImageState) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Auto-load on mount (default: false - user presses space) */
  autoLoad?: boolean;
  /**
   * Auto-size the box to fit the image dimensions (default: false).
   * When true, the box resizes to match the image's aspect ratio.
   * Use maxWidth/maxHeight to constrain the size.
   */
  autoSize?: boolean;
  /** Maximum width in cells when autoSize is true */
  maxWidth?: number;
  /** Maximum height in cells when autoSize is true */
  maxHeight?: number;
  /**
   * Force unload trigger - increment this value to force the image to unload.
   * Useful when parent component handles Escape or other close actions.
   * Example: <Image unloadTrigger={unloadCount} ... />
   */
  unloadTrigger?: number;
}
/**
 * Inline image for terminal UIs.
 *
 * Displays a placeholder until the user presses Space (or set `autoLoad`).
 * Supports Kitty and iTerm2 graphics protocols for true inline rendering,
 * with fallback to OS-level preview. Press Escape to unload.
 *
 * @example
 * ```tsx
 * <Image src="./logo.png" width={40} height={12} />
 * ```
 *
 * @example
 * ```tsx
 * // Auto-load with auto-size
 * <Image
 *   src="https://example.com/photo.jpg"
 *   autoLoad
 *   autoSize
 *   maxWidth={60}
 *   maxHeight={20}
 * />
 * ```
 * @category Layout
 */
declare const Image: React.ForwardRefExoticComponent<
  ImageProps & React.RefAttributes<ImageHandle>
>;

/**
 * @module Link
 * Focusable hyperlink component for terminal UIs.
 *
 * Opens a URL in the user's default browser when activated with Space or Enter.
 */

/**
 * Props for the {@link Link} component.
 */
interface LinkProps {
  /** The URL to open when the link is activated. */
  href: string;
  /** Base style for the link container. */
  style?: Style;
  /** Style applied when the link is focused (merged with `style`). */
  focusedStyle?: Style;
  /** Custom content. When absent, the `href` is displayed as text. */
  children?: ReactNode;
  /** Whether the link is focusable (default: `true`). */
  focusable?: boolean;
  /** When `true`, the link is skipped in the focus order and ignores input. */
  disabled?: boolean;
  /** Called after the URL has been opened. */
  onOpen?: () => void;
}
/**
 * Focusable hyperlink for terminal UIs.
 *
 * Renders link text (or custom children) and opens the URL in the default
 * browser when the user presses Space or Enter. Focusable by default and
 * can be disabled.
 *
 * @example
 * ```tsx
 * <Link href="https://example.com">Visit Example</Link>
 * ```
 *
 * @example
 * ```tsx
 * // Minimal — displays the URL as text
 * <Link href="https://github.com" />
 * ```
 *
 * @example
 * ```tsx
 * // Styled link
 * <Link
 *   href="https://docs.example.com"
 *   style={{ color: "blue", underline: true }}
 *   focusedStyle={{ color: "cyan", bold: true }}
 * >
 *   Documentation
 * </Link>
 * ```
 * @category Navigation
 */
declare const Link: React.ForwardRefExoticComponent<
  LinkProps & React.RefAttributes<LinkHandle>
>;

/**
 * Props for the {@link Match} component.
 */
interface MatchProps extends MediaQueryInput {
  /**
   * Content to render when the media query matches.
   */
  children?: ReactNode;
  /**
   * Content to render when the media query does **not** match.
   *
   * @default null
   */
  fallback?: ReactNode;
}
/**
 * Conditionally render content based on terminal dimensions.
 *
 * `Match` evaluates a media query against the current terminal size and
 * renders `children` when all conditions are met, or `fallback` otherwise.
 * The component re-renders automatically on terminal resize.
 *
 * All query props are combined with AND — every specified constraint must
 * be satisfied for `children` to render.
 *
 * @example
 * ```tsx
 * // Show wide layout on terminals ≥ 80 columns
 * <Match minColumns={80}>
 *   <HorizontalLayout />
 * </Match>
 * ```
 *
 * @example
 * ```tsx
 * // With a fallback for narrow terminals
 * <Match minColumns={80} fallback={<CompactView />}>
 *   <FullView />
 * </Match>
 * ```
 *
 * @example
 * ```tsx
 * // Compound query — width AND height
 * <Match minColumns={120} minRows={30}>
 *   <DashboardLayout />
 * </Match>
 * ```
 * @category Core
 */
declare function Match(
  { children, fallback, minColumns, maxColumns, minRows, maxRows }: MatchProps,
): React.JSX.Element | null;

/**
 * Static keybind registry for terminal applications.
 *
 * Create a typed registry of scoped keybinds that serves as the single
 * source of truth for keyboard shortcuts, command-palette entries, and
 * help-dialog content.
 *
 * @example
 * ```tsx
 * import { createKeybindRegistry } from "@semos-labs/glyph";
 *
 * const registry = createKeybindRegistry({
 *   global: [
 *     { key: "?", display: "?", description: "Show help", action: "openHelp", command: "help" },
 *     { key: "q", display: "q", description: "Quit", action: "quit", command: "quit" },
 *   ],
 *   list: [
 *     { key: "j", display: "j / ↓", description: "Next item", action: "next" },
 *     { key: "down", display: "j / ↓", description: "Next item", action: "next" },
 *     { key: "k", display: "k / ↑", description: "Previous item", action: "prev" },
 *     { key: "up", display: "k / ↑", description: "Previous item", action: "prev" },
 *   ],
 * });
 * ```
 * @module
 */
/**
 * A single keybind definition within a scope.
 *
 * @example
 * ```tsx
 * const def: KeybindDef = {
 *   key: "shift+d",
 *   display: "D",
 *   description: "Delete item",
 *   action: "delete",
 *   command: "delete",
 * };
 * ```
 */
interface KeybindDef {
  /**
   * Key combo string used for matching (e.g. `"shift+d"`, `"ctrl+u"`, `":"`).
   * Leave empty (`""`) for command-only entries with no keyboard shortcut.
   */
  key: string;
  /** Human-readable display string shown in help dialogs (e.g. `"D"`, `"Ctrl+u"`). */
  display: string;
  /** Short description of what the keybind does. */
  description: string;
  /** Action identifier used to look up the handler in a handlers map. */
  action: string;
  /** Optional command name for the command palette. Omit to exclude from commands. */
  command?: string;
}
/**
 * A command entry extracted from the registry.
 */
interface CommandDef {
  /** The command name (from {@link KeybindDef.command}). */
  name: string;
  /** Description of the command. */
  description: string;
  /** Action identifier to dispatch. */
  action: string;
}
/**
 * Options for {@link KeybindRegistry.getKeybindsForHelp}.
 */
interface HelpOptions<S extends string> {
  /** Related sub-mode scopes to include after the primary scope. */
  related?: S[];
  /** Human-readable titles for scopes. Falls back to the scope key. */
  scopeTitles?: Partial<Record<S, string>>;
  /**
   * Which scope is the global scope (always appended last).
   * Default: `"global"` if it exists in the registry, otherwise omitted.
   */
  globalScope?: S;
}
/**
 * A typed keybind registry with helper methods.
 *
 * Created by {@link createKeybindRegistry}. Provides access to the raw
 * scope→keybind mapping and convenience methods for command lookup,
 * help generation, and more.
 *
 * @example
 * ```tsx
 * const commands = registry.getAllCommands();
 * const match = registry.findCommand("goto tomorrow");
 * const help = registry.getKeybindsForHelp("timeline");
 * ```
 */
interface KeybindRegistry<S extends string = string> {
  /** The raw scope→keybinds mapping. */
  readonly scopes: Readonly<Record<S, KeybindDef[]>>;
  /**
   * Get de-duplicated keybinds for a scope (unique by `display`).
   *
   * @param scope - Scope name.
   * @returns Keybinds with duplicate display values removed.
   */
  getKeybindsForScope(scope: S): KeybindDef[];
  /**
   * Collect every keybind that has a `command` field, sorted by name.
   *
   * @returns Sorted array of command definitions.
   */
  getAllCommands(): CommandDef[];
  /**
   * Find a command by user input text.
   *
   * Supports exact matches and parameterised commands (e.g. `"goto <date>"`
   * matches input `"goto tomorrow"` with `args = "tomorrow"`).
   *
   * @param input - Raw user input from the command bar.
   * @returns Matched command with optional args, or `null`.
   */
  findCommand(input: string): {
    name: string;
    action: string;
    args?: string;
  } | null;
  /**
   * Build sections for a help dialog: context-specific, related sub-modes,
   * then global keybinds.
   *
   * @param context - The primary scope to display.
   * @param options - Optional related scopes and titles.
   * @returns Ordered sections for rendering.
   */
  getKeybindsForHelp(context: S, options?: HelpOptions<S>): {
    title: string;
    keybinds: KeybindDef[];
  }[];
}
/**
 * Create a static keybind registry from a scope→keybinds mapping.
 *
 * The returned registry object exposes the raw data together with
 * helper methods for command lookup, help generation, and scope queries.
 *
 * @param scopes - A record mapping scope names to arrays of keybind definitions.
 * @returns A frozen {@link KeybindRegistry} instance.
 *
 * @example
 * ```tsx
 * import { createKeybindRegistry } from "@semos-labs/glyph";
 *
 * const registry = createKeybindRegistry({
 *   global: [
 *     { key: "?", display: "?", description: "Show help", action: "openHelp", command: "help" },
 *     { key: ":", display: ":", description: "Open command bar", action: "openCommand" },
 *     { key: "q", display: "q", description: "Quit", action: "quit", command: "quit" },
 *   ],
 *   list: [
 *     { key: "j", display: "j / ↓", description: "Next item", action: "next" },
 *     { key: "down", display: "j / ↓", description: "Next item", action: "next" },
 *     { key: "k", display: "k / ↑", description: "Previous item", action: "prev" },
 *     { key: "up", display: "k / ↑", description: "Previous item", action: "prev" },
 *     { key: "return", display: "Enter", description: "Open item", action: "open" },
 *   ],
 * });
 * ```
 * @category Keybindings
 */
declare function createKeybindRegistry<S extends string>(
  scopes: Record<S, KeybindDef[]>,
): KeybindRegistry<S>;

/**
 * Map of action identifiers to handler functions.
 *
 * Actions whose handler is `undefined` are skipped (no `Keybind` is rendered).
 */
type ActionHandlers = Record<string, (() => void) | undefined>;
/**
 * Props for the {@link ScopedKeybinds} component.
 */
interface ScopedKeybindsProps<S extends string = string> {
  /** The keybind registry to read from. */
  registry: KeybindRegistry<S>;
  /** Which scope to bind. */
  scope: S;
  /**
   * Map of action names to handler functions.
   * Only keybinds whose action has a truthy handler are bound.
   */
  handlers: ActionHandlers;
  /** Enable / disable all keybinds in this scope. Default `true`. */
  enabled?: boolean;
  /**
   * When `true`, keybinds run **before** focused-input handlers,
   * overriding duplicate keys from non-priority scopes.
   */
  priority?: boolean;
}
/**
 * Declarative keybind binding driven by a {@link KeybindRegistry} scope.
 *
 * Reads keybind definitions from the given `scope`, filters to those with a
 * matching handler, and renders a `<Keybind>` for each one. When `priority`
 * is set, all rendered keybinds fire before focused-input handlers, letting
 * them override duplicate keys from other scopes.
 *
 * @example
 * ```tsx
 * import { createKeybindRegistry, ScopedKeybinds } from "@semos-labs/glyph";
 *
 * const registry = createKeybindRegistry({
 *   global: [
 *     { key: "q", display: "q", description: "Quit", action: "quit" },
 *   ],
 *   list: [
 *     { key: "j", display: "j / ↓", description: "Next", action: "next" },
 *     { key: "down", display: "j / ↓", description: "Next", action: "next" },
 *   ],
 * });
 *
 * function MyList() {
 *   return (
 *     <ScopedKeybinds
 *       registry={registry}
 *       scope="list"
 *       handlers={{ next: () => moveDown(), prev: () => moveUp() }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Priority keybinds override duplicate keys from other scopes
 * <ScopedKeybinds
 *   registry={registry}
 *   scope="dialog"
 *   handlers={{ confirm: save, cancel: close }}
 *   priority
 * />
 * ```
 * @category Keybindings
 */
declare function ScopedKeybinds<S extends string>(
  { registry, scope, handlers, enabled, priority }: ScopedKeybindsProps<S>,
): React.JSX.Element | null;

/**
 * Props for the {@link HelpDialog} component.
 */
interface HelpDialogProps<S extends string = string> {
  /** The keybind registry to display help from. */
  registry: KeybindRegistry<S>;
  /**
   * The currently active scope (determines which keybinds are shown first).
   * Additional scopes (including global) are appended automatically.
   */
  context: S;
  /**
   * Options forwarded to {@link KeybindRegistry.getKeybindsForHelp},
   * including scope titles and related scopes.
   */
  helpOptions?: HelpOptions<S>;
  /**
   * Whether the help dialog is currently visible.
   * When `false`, nothing is rendered.
   */
  open: boolean;
  /** Called when the dialog should close (e.g. Escape pressed). */
  onClose: () => void;
  /**
   * Key combo that toggles the dialog open / closed.
   * Default: `"?"`.
   * Set to `""` or `null` to disable the built-in keybind
   * (you'll manage toggling yourself).
   */
  toggleKey?: string | null;
  /** Title shown at the top of the dialog. Default: `"Keyboard Shortcuts"`. */
  title?: string;
  /** Placeholder text for the filter input. Default: `"Filter shortcuts…"`. */
  filterPlaceholder?: string;
  /** Optional style overrides for the dialog card. */
  style?: Style;
  /** Optional style overrides for the backdrop overlay. */
  backdropStyle?: Style;
  /**
   * Width of the dialog card (columns). Default: `48`.
   */
  width?: number;
  /**
   * Height of the dialog card. Default: `"80%"`.
   */
  height?: number | `${number}%`;
  /**
   * Width of the shortcut key column (columns). Default: `12`.
   */
  keyColumnWidth?: number;
  /**
   * Optional additional content rendered below the keybind list.
   */
  children?: ReactNode;
}
/**
 * Full-screen help dialog that displays keybinds from a {@link KeybindRegistry}.
 *
 * The dialog auto-registers a toggle keybind (default `?`) so users can
 * open it without any extra wiring. Keybinds are grouped by scope,
 * filtered in real-time, and displayed inside a scrollable overlay.
 *
 * @example
 * ```tsx
 * import { HelpDialog, createKeybindRegistry } from "@semos-labs/glyph";
 *
 * const registry = createKeybindRegistry({
 *   global: [
 *     { key: "?", display: "?", description: "Show help", action: "help", command: "help" },
 *     { key: "q", display: "q", description: "Quit", action: "quit", command: "quit" },
 *   ],
 *   list: [
 *     { key: "j", display: "j / ↓", description: "Next item", action: "next" },
 *   ],
 * });
 *
 * function App() {
 *   const [showHelp, setShowHelp] = useState(false);
 *
 *   return (
 *     <Box style={{ flexDirection: "column", flexGrow: 1 }}>
 *       <MyContent />
 *       <HelpDialog
 *         registry={registry}
 *         context="list"
 *         helpOptions={{ scopeTitles: { global: "Global", list: "List" } }}
 *         open={showHelp}
 *         onClose={() => setShowHelp(false)}
 *         toggleKey="?"
 *       />
 *     </Box>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Disable the built-in toggle keybind and manage it yourself
 * <HelpDialog
 *   registry={registry}
 *   context="editor"
 *   open={helpVisible}
 *   onClose={() => setHelpVisible(false)}
 *   toggleKey={null}
 * />
 * ```
 * @category Keybindings
 */
declare function HelpDialog<S extends string>(
  {
    registry,
    context,
    helpOptions,
    open,
    onClose,
    toggleKey,
    title,
    filterPlaceholder,
    style,
    backdropStyle,
    width,
    height,
    keyColumnWidth,
    children,
  }: HelpDialogProps<S>,
): React.JSX.Element;

/**
 * Visual type for a status bar message.
 */
type MessageType = "info" | "success" | "warning" | "error" | "progress";
/**
 * A message displayed in the status bar.
 *
 * @example
 * ```tsx
 * const bar = useStatusBar();
 * bar.showMessage({ text: "Saved!", type: "success" });
 * bar.showMessage({ text: "Syncing…", type: "progress", durationMs: 0 });
 * ```
 */
interface StatusBarMessage {
  /** Message text. */
  text: string;
  /** Visual variant. Default `"info"`. */
  type?: MessageType;
  /**
   * Auto-dismiss duration in ms.
   * Overrides the component-level `messageDuration` for this message.
   * Set `0` to persist until manually cleared.
   */
  durationMs?: number;
}
/**
 * Value exposed by the StatusBar context.
 */
interface StatusBarContextValue {
  /**
   * Display a message in the status bar.
   * Pass a string for a simple info message or a {@link StatusBarMessage} for full control.
   */
  showMessage(message: StatusBarMessage | string): void;
  /** Immediately clear the current message. */
  clearMessage(): void;
}
/**
 * Access the status bar message API from anywhere inside a {@link StatusBar}.
 *
 * @returns An object with `showMessage` and `clearMessage` methods.
 *
 * @example
 * ```tsx
 * const bar = useStatusBar();
 *
 * bar.showMessage("Quick info");
 * bar.showMessage({ text: "Saved!", type: "success" });
 * bar.showMessage({ text: "Loading…", type: "progress", durationMs: 0 });
 * bar.clearMessage();
 * ```
 * @category Feedback
 */
declare function useStatusBar(): StatusBarContextValue;
/**
 * Props for the {@link StatusBar} component.
 */
interface StatusBarProps {
  /**
   * Keybind registry — enables command mode.
   * When provided, pressing `commandKey` opens a command palette with
   * filterable commands extracted from the registry.
   */
  commands?: KeybindRegistry<any>;
  /**
   * Called when a command is executed from the palette.
   *
   * @param action - The `action` identifier of the selected command.
   * @param args - Optional argument string for parameterised commands.
   */
  onCommand?: (action: string, args?: string) => void;
  /** Key that activates command mode. Default `":"`. */
  commandKey?: string;
  /** Placeholder text for the command input. Default `"Type a command…"`. */
  commandPlaceholder?: string;
  /**
   * Called as the user types in search mode.
   * Providing this callback enables search mode (activated by `searchKey`).
   */
  onSearch?: (query: string) => void;
  /** Called when Enter is pressed in search mode. */
  onSearchSubmit?: (query: string) => void;
  /** Called when search mode is dismissed (Escape). */
  onSearchDismiss?: () => void;
  /** Called when Up/Down is pressed in search mode. */
  onSearchNavigate?: (direction: "up" | "down") => void;
  /** Key that activates search mode. Default `"/"`. */
  searchKey?: string;
  /** Placeholder text for the search input. Default `"Search…"`. */
  searchPlaceholder?: string;
  /**
   * Default content shown on the left side when idle and no message is active.
   * Typically contextual info like "next event" or "selected file".
   */
  status?: ReactNode;
  /**
   * Content rendered on the right side of the bar.
   * Supports any single-line content (clock, auth indicator, key hints, etc.).
   */
  right?: ReactNode;
  /** Style applied to the status bar row. */
  style?: Style;
  /** Default auto-dismiss duration for messages in ms. Default `3000`. */
  messageDuration?: number;
  /**
   * Application content.
   * Rendered above the status bar in a column layout.
   * Descendants can call {@link useStatusBar} to post messages.
   */
  children?: ReactNode;
}
/**
 * Unified status bar with optional command palette, search, and message system.
 *
 * Wraps application content in a column layout with the bar pinned at the
 * bottom. Descendants can call {@link useStatusBar} to post messages that
 * appear in the bar.
 *
 * **Command mode** (optional) — activated by pressing `commandKey` (default
 * `":"`). Shows a filterable command palette built from the provided
 * {@link KeybindRegistry}. Requires `commands` and `onCommand` props.
 *
 * **Search mode** (optional) — activated by pressing `searchKey` (default
 * `"/"`). Calls `onSearch` as the user types. Requires `onSearch` prop.
 *
 * **Messages** — call `useStatusBar().showMessage()` from anywhere in the
 * tree to display temporary status messages (success, error, progress, etc.).
 *
 * @example
 * ```tsx
 * import { StatusBar, useStatusBar, createKeybindRegistry } from "@semos-labs/glyph";
 *
 * const registry = createKeybindRegistry({
 *   global: [
 *     { key: "q", display: "q", description: "Quit", action: "quit", command: "quit" },
 *     { key: "?", display: "?", description: "Help", action: "help", command: "help" },
 *   ],
 * });
 *
 * function App() {
 *   return (
 *     <StatusBar
 *       commands={registry}
 *       onCommand={(action) => dispatch(action)}
 *       onSearch={(q) => search(q)}
 *       right={<Text bold>12:30</Text>}
 *       status={<Text dim>Ready</Text>}
 *     >
 *       <Box style={{ flexGrow: 1 }}>
 *         <MainContent />
 *       </Box>
 *     </StatusBar>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Post messages from anywhere in the tree
 * function SaveButton() {
 *   const bar = useStatusBar();
 *
 *   const save = async () => {
 *     bar.showMessage({ text: "Saving…", type: "progress", durationMs: 0 });
 *     await doSave();
 *     bar.showMessage({ text: "Saved!", type: "success" });
 *   };
 *
 *   return <Button label="Save" onPress={save} />;
 * }
 * ```
 * @category Feedback
 */
declare function StatusBar({
  commands,
  onCommand,
  commandKey,
  commandPlaceholder,
  onSearch,
  onSearchSubmit,
  onSearchDismiss,
  onSearchNavigate,
  searchKey,
  searchPlaceholder,
  status,
  right,
  style,
  messageDuration,
  children,
}: StatusBarProps): React.JSX.Element;

/**
 * Props for the {@link DebugOverlay} component.
 */
interface DebugOverlayProps {
  /** Show per-phase breakdown (layout / paint / diff / swap). Defaults to `true`. */
  phases?: boolean;
  /** Show sparkline graph of recent frame times. Defaults to `true`. */
  sparkline?: boolean;
  /** Corner to anchor the overlay. Defaults to `"top-right"`. */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Override the default overlay style. Merged on top of the base style. */
  style?: Style;
}
/**
 * Floating debug HUD showing real-time rendering metrics.
 *
 * Renders as an absolute-positioned overlay in a chosen corner of the
 * screen.  Displays current frame time, average, and optionally a
 * per-phase breakdown and sparkline history — useful for profiling
 * without leaving the application.
 *
 * Respects the `debug` flag from `render(element, { debug: true })`.
 * When debug mode is off, this component renders nothing — safe to
 * leave in your tree unconditionally.
 *
 * @example
 * ```tsx
 * import { DebugOverlay } from "@semos-labs/glyph";
 *
 * function App() {
 *   return (
 *     <Box style={{ width: "100%", height: "100%" }}>
 *       <MyContent />
 *       <DebugOverlay />
 *     </Box>
 *   );
 * }
 * ```
 * @category Core
 */
declare function DebugOverlay(
  { phases, sparkline: showSparkline, position, style: userStyle }:
    DebugOverlayProps,
): react_jsx_runtime.JSX.Element | null;

/**
 * Controls which grid lines are drawn.
 *
 * | Variant | Surrounding border | Header separator | Row separators | Column separators |
 * |---|---|---|---|---|
 * | `"full"` | ✓ | ✓ | ✓ | ✓ |
 * | `"clean"` | ✗ | ✓ | ✗ | ✗ |
 * | `"clean-vertical"` | ✗ | ✓ | ✗ | ✓ |
 *
 * @category Tables
 */
type TableVariant = "full" | "clean" | "clean-vertical";
/**
 * Horizontal alignment for cell content.
 * @category Tables
 */
type CellAlign = "left" | "center" | "right";
/**
 * Vertical alignment for cell content.
 * @category Tables
 */
type CellVerticalAlign = "top" | "center" | "bottom";
/**
 * Props for the {@link Table} component.
 */
interface TableProps {
  /** Border drawing style. Default `"single"`. */
  border?: BorderStyle;
  /** Border / grid-line color. */
  borderColor?: Color;
  /**
   * Layout variant controlling which grid lines are drawn.
   *
   * - `"full"` — all borders: surrounding border, row separators, and
   *   column separators (default).
   * - `"clean"` — only a horizontal rule separating the header (first
   *   row) from the rest. No surrounding border, no column borders.
   * - `"clean-vertical"` — same as `"clean"` plus vertical borders
   *   between columns. No surrounding border, no horizontal borders
   *   between data rows.
   *
   * @default "full"
   */
  variant?: TableVariant;
  /**
   * When `true`, each column shrinks to the width of its widest cell
   * content instead of distributing space equally.
   *
   * @default false
   */
  wrap?: boolean;
  /** Additional style for the outer table container. */
  style?: Style;
  /** {@link TableRow} children. */
  children?: ReactNode;
}
/**
 * Bordered table built entirely with flexbox.
 *
 * Renders seamless box-drawing borders around and between every row
 * and cell. Compose with {@link TableRow} (or {@link TableHeaderRow})
 * and {@link TableCell}.
 *
 * Cells support **rich content** — any React element works as cell
 * children, including `<Progress>`, `<Spinner>`, `<Link>`, `<Box>`
 * layouts, and `<Text>` with inline styling. Multi-line cells are
 * fully supported; vertical borders stretch automatically.
 *
 * @example
 * Basic text table
 * ```tsx
 * <Table border="single" borderColor="cyan">
 *   <TableRow>
 *     <TableCell>Name</TableCell>
 *     <TableCell>Age</TableCell>
 *   </TableRow>
 *   <TableRow>
 *     <TableCell>Alice</TableCell>
 *     <TableCell>30</TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Clean variant with header row
 * ```tsx
 * <Table variant="clean" borderColor="gray">
 *   <TableHeaderRow>
 *     <TableCell>Name</TableCell>
 *     <TableCell>Score</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>Alice</TableCell>
 *     <TableCell>98</TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Status indicators — colored icons with text
 * ```tsx
 * <Table border="round" borderColor="cyan">
 *   <TableHeaderRow>
 *     <TableCell>Service</TableCell>
 *     <TableCell>Status</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>API</TableCell>
 *     <TableCell>
 *       <Box style={{ flexDirection: "row", gap: 1 }}>
 *         <Text style={{ color: "green" }}>●</Text>
 *         <Text>Healthy</Text>
 *       </Box>
 *     </TableCell>
 *   </TableRow>
 *   <TableRow>
 *     <TableCell>Database</TableCell>
 *     <TableCell>
 *       <Box style={{ flexDirection: "row", gap: 1 }}>
 *         <Text style={{ color: "red" }}>●</Text>
 *         <Text>Down</Text>
 *       </Box>
 *     </TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Progress bars in cells — wrap in a flex box so width resolves correctly
 * ```tsx
 * <Table borderColor="blue">
 *   <TableHeaderRow>
 *     <TableCell>Task</TableCell>
 *     <TableCell>Progress</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>Build</TableCell>
 *     <TableCell>
 *       <Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
 *         <Progress value={0.75} showPercent />
 *       </Box>
 *     </TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Multi-line cells — stacked content with vertical borders
 * ```tsx
 * <Table border="double" borderColor="green">
 *   <TableHeaderRow>
 *     <TableCell>Project</TableCell>
 *     <TableCell>Details</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>
 *       <Box style={{ flexDirection: "column" }}>
 *         <Text style={{ bold: true }}>glyph-core</Text>
 *         <Text style={{ dim: true }}>v2.4.1</Text>
 *       </Box>
 *     </TableCell>
 *     <TableCell>
 *       <Box style={{ flexDirection: "column" }}>
 *         <Box style={{ flexDirection: "row", gap: 1 }}>
 *           <Text style={{ color: "green" }}>+142</Text>
 *           <Text style={{ color: "red" }}>-38</Text>
 *         </Box>
 *         <Text style={{ dim: true }}>Last commit: 2h ago</Text>
 *       </Box>
 *     </TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Spinners and links
 * ```tsx
 * <Table variant="clean-vertical" borderColor="magenta">
 *   <TableHeaderRow>
 *     <TableCell>Service</TableCell>
 *     <TableCell>Activity</TableCell>
 *     <TableCell>Docs</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>Auth</TableCell>
 *     <TableCell>
 *       <Spinner label="Processing" style={{ color: "green" }} />
 *     </TableCell>
 *     <TableCell>
 *       <Link href="https://docs.example.com/auth">
 *         <Text style={{ color: "blueBright", underline: true }}>
 *           docs.example.com
 *         </Text>
 *       </Link>
 *     </TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Cell alignment
 * ```tsx
 * <Table borderColor="yellow">
 *   <TableHeaderRow>
 *     <TableCell>Left (default)</TableCell>
 *     <TableCell align="center">Centered</TableCell>
 *     <TableCell align="right">Right-aligned</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>Alice</TableCell>
 *     <TableCell align="center">98</TableCell>
 *     <TableCell align="right">
 *       <Text style={{ color: "green" }}>✓ Pass</Text>
 *     </TableCell>
 *   </TableRow>
 * </Table>
 * ```
 * @category Tables
 */
declare function Table(
  { children, style, border, borderColor, variant, wrap }: TableProps,
): ReactElement;
/**
 * Props for the {@link TableRow} component.
 */
interface TableRowProps {
  /** Style applied to the content row (the row containing the cells). */
  style?: Style;
  /** {@link TableCell} children. */
  children?: ReactNode;
}
/**
 * A single row inside a {@link Table}.
 *
 * Must be a direct child of `<Table>`. Contains one or more
 * {@link TableCell} elements. Cells can hold any React content — when
 * one cell is taller than others (e.g. multi-line content), vertical
 * borders stretch to match.
 *
 * @example
 * Plain text row
 * ```tsx
 * <TableRow>
 *   <TableCell>Alice</TableCell>
 *   <TableCell>30</TableCell>
 * </TableRow>
 * ```
 *
 * @example
 * Rich content row — status badge, progress bar, link
 * ```tsx
 * <TableRow>
 *   <TableCell style={{ bold: true }}>API Gateway</TableCell>
 *   <TableCell>
 *     <Box style={{ flexDirection: "row", gap: 1 }}>
 *       <Text style={{ color: "green" }}>●</Text>
 *       <Text>Healthy</Text>
 *     </Box>
 *   </TableCell>
 *   <TableCell>
 *     <Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
 *       <Progress value={0.42} />
 *     </Box>
 *   </TableCell>
 *   <TableCell>
 *     <Link href="https://api.example.com" focusable={false}>
 *       <Text style={{ color: "blueBright", underline: true }}>
 *         api.example.com
 *       </Text>
 *     </Link>
 *   </TableCell>
 * </TableRow>
 * ```
 *
 * @example
 * Multi-line row — stacked content in cells
 * ```tsx
 * <TableRow>
 *   <TableCell>
 *     <Box style={{ flexDirection: "column" }}>
 *       <Text style={{ bold: true }}>glyph-core</Text>
 *       <Text style={{ dim: true, italic: true }}>v2.4.1</Text>
 *     </Box>
 *   </TableCell>
 *   <TableCell>
 *     <Box style={{ flexDirection: "column" }}>
 *       <Text>142 changes</Text>
 *       <Text style={{ dim: true }}>Last commit: 2h ago</Text>
 *     </Box>
 *   </TableCell>
 * </TableRow>
 * ```
 * @category Tables
 */
declare function TableRow(props: TableRowProps): ReactElement;
/**
 * Props for the {@link TableCell} component.
 */
interface TableCellProps {
  /** Style for the cell container. Horizontal padding defaults to `1`. */
  style?: Style;
  /**
   * Cell content — can be plain text, numbers, or **any React element**.
   *
   * Strings and numbers are automatically wrapped in a `Text` element.
   * Rich content (e.g. `<Progress>`, `<Spinner>`, `<Box>` layouts,
   * `<Link>`, `<Text>` with inline styling) is passed through as-is.
   *
   * For `<Progress>` bars, wrap them in a flex box so `width: "100%"`
   * resolves relative to the wrapper instead of overflowing the cell:
   *
   * ```tsx
   * <TableCell>
   *   <Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
   *     <Progress value={0.7} showPercent />
   *   </Box>
   * </TableCell>
   * ```
   *
   * For multi-line cells, use a vertical `<Box>` layout:
   *
   * ```tsx
   * <TableCell>
   *   <Box style={{ flexDirection: "column" }}>
   *     <Text style={{ bold: true }}>Title</Text>
   *     <Text style={{ dim: true }}>Subtitle</Text>
   *   </Box>
   * </TableCell>
   * ```
   */
  children?: ReactNode;
  /**
   * Horizontal alignment of cell content.
   *
   * - `"left"` — align to the start (default)
   * - `"center"` — center content
   * - `"right"` — align to the end
   *
   * @default "left"
   */
  align?: CellAlign;
  /**
   * Vertical alignment of cell content (useful for multi-line rows).
   *
   * - `"top"` — align to the top (default)
   * - `"center"` — center vertically
   * - `"bottom"` — align to the bottom
   *
   * @default "top"
   */
  verticalAlign?: CellVerticalAlign;
  /**
   * Minimum content width hint (in columns) for `wrap` mode measurement.
   *
   * When a cell contains non-text content (e.g. `<Progress>`, `<Spinner>`,
   * or complex layouts), the automatic text-length measurement returns `0`.
   * Set `minWidth` to tell the table how wide the content should be so
   * column sizing works correctly in `wrap` mode.
   *
   * Has no effect when the table's `wrap` prop is `false` (the default).
   *
   * @example
   * ```tsx
   * <TableCell minWidth={20}>
   *   <Progress value={0.5} />
   * </TableCell>
   * ```
   */
  minWidth?: number;
}
/**
 * A single cell inside a {@link TableRow}.
 *
 * Accepts **any React content** as children — plain strings, numbers, or
 * rich elements like `<Progress>`, `<Spinner>`, `<Link>`, `<Box>`
 * layouts, nested `<Text>` with inline styles, and more.
 *
 * Strings and numbers are automatically wrapped in a `Text` element.
 * Horizontal padding defaults to `1` character on each side (overridable
 * via `style`).
 *
 * @example
 * Simple text
 * ```tsx
 * <TableCell>Hello</TableCell>
 * <TableCell style={{ bold: true, color: "cyan" }}>World</TableCell>
 * ```
 *
 * @example
 * Status indicator with colored icon
 * ```tsx
 * <TableCell>
 *   <Box style={{ flexDirection: "row", gap: 1 }}>
 *     <Text style={{ color: "green" }}>●</Text>
 *     <Text>Healthy</Text>
 *   </Box>
 * </TableCell>
 * ```
 *
 * @example
 * Progress bar — wrap in a flex box so width resolves correctly
 * ```tsx
 * <TableCell>
 *   <Box style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }}>
 *     <Progress value={0.65} showPercent />
 *   </Box>
 * </TableCell>
 * ```
 *
 * @example
 * Spinner with label
 * ```tsx
 * <TableCell>
 *   <Spinner label="Syncing..." style={{ color: "cyan" }} />
 * </TableCell>
 * ```
 *
 * @example
 * Clickable link
 * ```tsx
 * <TableCell>
 *   <Link href="https://docs.example.com" focusable={false}>
 *     <Text style={{ color: "blueBright", underline: true }}>
 *       View docs
 *     </Text>
 *   </Link>
 * </TableCell>
 * ```
 *
 * @example
 * Multi-line stacked content
 * ```tsx
 * <TableCell>
 *   <Box style={{ flexDirection: "column" }}>
 *     <Text style={{ bold: true }}>glyph-core</Text>
 *     <Text style={{ dim: true, italic: true }}>v2.4.1</Text>
 *   </Box>
 * </TableCell>
 * ```
 *
 * @example
 * Alignment — centered spinner with vertical centering for tall rows
 * ```tsx
 * <TableCell align="center" verticalAlign="center">
 *   <Spinner label="Loading..." style={{ color: "yellow" }} />
 * </TableCell>
 * ```
 *
 * @example
 * Right-aligned numeric value
 * ```tsx
 * <TableCell align="right">
 *   <Text style={{ color: "green", bold: true }}>$1,234.56</Text>
 * </TableCell>
 * ```
 * @category Tables
 */
declare function TableCell(
  { children, style, align, verticalAlign, minWidth: _minWidth }:
    TableCellProps,
): ReactElement;
/**
 * Props for the {@link TableHeaderRow} component.
 */
interface TableHeaderRowProps {
  /** Style applied to the header row. Bold text is applied by default. */
  style?: Style;
  /** {@link TableCell} children representing column headers. */
  children?: ReactNode;
}
/**
 * Convenience component for table header rows.
 *
 * Behaves exactly like {@link TableRow} but applies bold text styling
 * by default, reducing boilerplate for the common pattern of bolding
 * every header cell.
 *
 * @example
 * Basic header
 * ```tsx
 * <Table borderColor="cyan">
 *   <TableHeaderRow>
 *     <TableCell>Name</TableCell>
 *     <TableCell>Status</TableCell>
 *     <TableCell>Score</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>Alice</TableCell>
 *     <TableCell>Active</TableCell>
 *     <TableCell>98</TableCell>
 *   </TableRow>
 * </Table>
 * ```
 *
 * @example
 * Colored header with alignment
 * ```tsx
 * <Table border="round" borderColor="magenta">
 *   <TableHeaderRow style={{ color: "magentaBright" }}>
 *     <TableCell>Service</TableCell>
 *     <TableCell align="center">Status</TableCell>
 *     <TableCell align="right">Load</TableCell>
 *   </TableHeaderRow>
 *   <TableRow>
 *     <TableCell>API Gateway</TableCell>
 *     <TableCell align="center">
 *       <Text style={{ color: "green" }}>● Healthy</Text>
 *     </TableCell>
 *     <TableCell align="right">42%</TableCell>
 *   </TableRow>
 * </Table>
 * ```
 * @category Tables
 */
declare function TableHeaderRow(props: TableHeaderRowProps): ReactElement;

/**
 * Subscribe to raw keyboard input.
 *
 * The handler is called for **every** key press that is not consumed by a
 * focused input handler or a priority {@link Keybind}. This is the
 * lowest-level input hook — prefer `Keybind` for simple shortcuts and
 * component-level handlers for focused input.
 *
 * @param handler - Callback receiving the parsed {@link Key}.
 * @param deps - Dependency array (same semantics as `useEffect`).
 *
 * @example
 * ```tsx
 * useInput((key) => {
 *   if (key.name === "q" && !key.ctrl) exit();
 * });
 * ```
 * @category Keybindings
 */
declare function useInput(handler: (key: Key) => void, deps?: any[]): void;

/**
 * Return type of {@link useFocus}.
 */
interface UseFocusResult {
  /** `true` when this element currently holds focus. */
  focused: boolean;
  /** Programmatically request focus for this element. */
  focus(): void;
}
/**
 * Low-level hook that registers a node in the focus system and tracks
 * whether it is currently focused.
 *
 * For most use-cases, prefer the higher-level {@link useFocusable} hook
 * or built-in focusable components (`Button`, `Input`, …).
 *
 * @param nodeRef - React ref pointing to the underlying {@link GlyphNode}.
 * @returns An object with the current `focused` state and a `focus()` method.
 *
 * @example
 * ```tsx
 * const nodeRef = useRef<GlyphNode>(null);
 * const { focused, focus } = useFocus(nodeRef);
 *
 * <Box ref={nodeRef} focusable style={{ bg: focused ? "cyan" : undefined }}>
 *   {focused ? "I have focus!" : "Press Tab"}
 * </Box>
 * ```
 * @category Navigation
 */
declare function useFocus(nodeRef?: {
  current: GlyphNode | null;
}): UseFocusResult;

interface UseFocusableOptions {
  /** Whether the element is currently disabled (skipped in tab order)
   */
  disabled?: boolean;
  /** Called when the element receives focus */
  onFocus?: () => void;
  /** Called when the element loses focus */
  onBlur?: () => void;
  /**
   * Key handler when focused. Return `true` to consume the key.
   * This runs after priority handlers but before global handlers.
   */
  onKeyPress?: (key: Key) => boolean | void;
}
interface UseFocusableResult {
  /** Ref to attach to your focusable element */
  ref: (node: GlyphNode | null) => void;
  /** Whether this element is currently focused */
  isFocused: boolean;
  /** Programmatically request focus on this element */
  focus: () => void;
  /** Programmatically blur (unfocus) this element */
  blur: () => void;
  /** The focus ID (useful for conditional logic) */
  focusId: string | null;
}
/**
 * Hook to make any element focusable with keyboard support.
 *
 * @example
 * ```tsx
 * function CustomPicker({ onSelect }) {
 *   const { ref, isFocused, focus } = useFocusable({
 *     onKeyPress: (key) => {
 *       if (key.name === "return") {
 *         onSelect();
 *         return true;
 *       }
 *       return false;
 *     },
 *   });
 *
 *   return (
 *     <Box
 *       ref={ref}
 *       focusable
 *       style={{
 *         border: "round",
 *         borderColor: isFocused ? "cyan" : "gray"
 *       }}
 *     >
 *       <Text>Custom Picker</Text>
 *     </Box>
 *   );
 * }
 * ```
 * @category Navigation
 */
declare function useFocusable(
  options?: UseFocusableOptions,
): UseFocusableResult;

/**
 * Subscribe to the computed layout of a node.
 *
 * Returns a {@link LayoutRect} that updates whenever the layout engine
 * recalculates positions (e.g. on resize or content change).
 *
 * @param nodeRef - React ref pointing to the target {@link GlyphNode}.
 * @returns Current layout rectangle (outer + inner bounds).
 *
 * @example
 * ```tsx
 * const boxRef = useRef<GlyphNode>(null);
 * const layout = useLayout(boxRef);
 *
 * <Box ref={boxRef}>
 *   <Text>Width: {layout.innerWidth} Height: {layout.innerHeight}</Text>
 * </Box>
 * ```
 * @category Layout
 */
declare function useLayout(nodeRef?: {
  current: GlyphNode | null;
}): LayoutRect;

/**
 * Return type of {@link useApp}.
 */
interface UseAppResult {
  /** Terminate the application, optionally with an exit code. */
  exit(code?: number): void;
  /** Force a full redraw of the entire screen (clear + repaint). */
  forceRedraw(): void;
  /** Current terminal width in columns. Updates on resize. */
  columns: number;
  /** Current terminal height in rows. Updates on resize. */
  rows: number;
  /** Duration of the last `performRender` call in milliseconds. */
  lastFrameTime: number;
  /** Per-phase breakdown of the last frame's render time. */
  frameTiming: FrameTiming;
  /** Whether debug mode is enabled via `render(element, { debug: true })`. */
  debug: boolean;
}
/**
 * Access application-level utilities: exit, terminal dimensions.
 *
 * Must be called inside a Glyph render tree (i.e. inside a component
 * passed to {@link render}).
 *
 * The returned `columns` and `rows` are reactive — components that
 * destructure them will automatically re-render when the terminal is
 * resized.  This is implemented via `useSyncExternalStore` under the
 * hood, subscribing to the same resize event that drives
 * {@link useMediaQuery}.
 *
 * @example
 * ```tsx
 * const { exit, columns, rows } = useApp();
 *
 * <Text>Terminal size: {columns}×{rows}</Text>
 * <Button label="Quit" onPress={() => exit()} />
 * ```
 * @category Core
 */
declare function useApp(): UseAppResult;

/**
 * Descriptor for a single focusable element in the registry.
 */
interface FocusableElement {
  /** Unique focus ID */
  id: string;
  /** The GlyphNode */
  node: GlyphNode;
  /** Current layout (position, size) */
  layout: LayoutRect;
  /** Node type (box, input, etc.) */
  type: string;
}
/**
 * Return type of {@link useFocusRegistry}.
 */
interface FocusRegistryValue {
  /** All currently registered focusable elements */
  elements: FocusableElement[];
  /** Currently focused element ID */
  focusedId: string | null;
  /** Request focus on a specific element */
  requestFocus: (id: string) => void;
  /** Move to next focusable element */
  focusNext: () => void;
  /** Move to previous focusable element */
  focusPrev: () => void;
  /** Manually refresh the element list (useful after layout updates) */
  refresh: () => void;
}
/**
 * Access all registered focusable elements and navigation helpers.
 *
 * Useful for building custom navigation UIs, accessibility overlays,
 * or debug tools. Respects the current {@link FocusScope} trap.
 *
 * @returns Registry value, or `null` outside a Glyph render tree.
 *
 * @example
 * ```tsx
 * const registry = useFocusRegistry();
 * if (registry) {
 *   console.log(`${registry.elements.length} focusable elements`);
 *   registry.focusNext();
 * }
 * ```
 * @category Navigation
 */
declare function useFocusRegistry(): FocusRegistryValue | null;

/**
 * Returns a function that scrolls the nearest parent {@link ScrollView}
 * to make the referenced node visible.
 *
 * This is the non-focusable counterpart to `handle.scrollIntoView()` —
 * use it with plain `Box` refs or any `GlyphNode`.
 *
 * Works both when the calling component is **inside** the ScrollView
 * (via React context) and when it is **outside** (by walking up the
 * target node's parent chain).
 *
 * @param nodeRef - React ref pointing to the target node.
 * @returns A stable callback you can invoke to scroll to the node.
 *
 * @example
 * ```tsx
 * const boxRef = useRef<GlyphNode>(null);
 * const scrollIntoView = useScrollIntoView(boxRef);
 *
 * // Later, e.g. in an effect or event handler:
 * scrollIntoView();                       // minimal scroll
 * scrollIntoView({ block: "center" });    // center in viewport
 * ```
 * @category Navigation
 */
declare function useScrollIntoView(nodeRef: {
  current: GlyphNode | null;
}): (options?: ScrollIntoViewOptions) => void;

/**
 * Subscribe to terminal dimensions and evaluate a media query reactively.
 *
 * Returns `true` when **all** conditions in `query` are satisfied and
 * automatically re-renders the component when the result changes (e.g.
 * on terminal resize).
 *
 * Conditions are combined with AND — every specified constraint must be
 * met for the hook to return `true`.
 *
 * @param query - A {@link MediaQueryInput} object describing the conditions.
 * @returns Whether the query currently matches.
 *
 * @example
 * ```tsx
 * function App() {
 *   const isWide = useMediaQuery({ minColumns: 80 });
 *
 *   return (
 *     <Box style={{ flexDirection: isWide ? "row" : "column" }}>
 *       <Sidebar />
 *       <MainContent />
 *     </Box>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Compound query — all conditions must match
 * const isDesktop = useMediaQuery({ minColumns: 120, minRows: 30 });
 * ```
 * @category Layout
 */
declare function useMediaQuery(query: MediaQueryInput): boolean;

/**
 * Subscribe to all global mouse events.
 *
 * The handler receives every mouse event (click, move, wheel) along with
 * the hit-tested `GlyphNode` at the cursor position (or `null` if none).
 *
 * @example
 * ```tsx
 * useMouse((event, node) => {
 *   if (event.type === "mousedown") {
 *     console.log("Clicked at", event.x, event.y);
 *   }
 * });
 * ```
 * @category Input
 */
declare function useMouse(
  handler: (event: MouseEvent, node: GlyphNode | null) => void,
): void;

/**
 * Input mask utilities for Glyph Input component.
 *
 * Mask pattern characters:
 * - `9` - Digit (0-9)
 * - `a` - Letter (a-z, A-Z)
 * - `*` - Alphanumeric (a-z, A-Z, 0-9)
 * - Any other character is treated as a literal (separator)
 *
 * @example
 * ```tsx
 * import { createMask } from "@semos-labs/glyph";
 *
 * // Phone: (123) 456-7890
 * const phoneMask = createMask("(999) 999-9999");
 * <Input onBeforeChange={phoneMask} />
 *
 * // Date: 12/31/2024
 * const dateMask = createMask("99/99/9999");
 * <Input onBeforeChange={dateMask} />
 *
 * // License plate: ABC-1234
 * const plateMask = createMask("aaa-9999");
 * <Input onBeforeChange={plateMask} />
 * ```
 */
interface MaskOptions {
  /** The mask pattern */
  mask: string;
  /** Placeholder character for unfilled positions (default: "_") */
  placeholder?: string;
  /** Show placeholder in output (default: false) */
  showPlaceholder?: boolean;
}
/**
 * Creates a mask handler for use with Input's onBeforeChange prop.
 *
 * @param maskOrOptions - Mask pattern string or options object
 * @returns onBeforeChange handler function
 * @category Form
 */
declare function createMask(
  maskOrOptions: string | MaskOptions,
): (newValue: string, oldValue: string) => string | false | void;
/**
 * Pre-built mask patterns for common use cases.
 * @category Form
 */
declare const masks: {
  /** US Phone: (123) 456-7890 */
  usPhone: (newValue: string, oldValue: string) => string | false | void;
  /** International Phone: +1 234 567 8900 */
  intlPhone: (newValue: string, oldValue: string) => string | false | void;
  /** Date MM/DD/YYYY */
  dateUS: (newValue: string, oldValue: string) => string | false | void;
  /** Date DD/MM/YYYY */
  dateEU: (newValue: string, oldValue: string) => string | false | void;
  /** Date YYYY-MM-DD */
  dateISO: (newValue: string, oldValue: string) => string | false | void;
  /** Time HH:MM */
  time: (newValue: string, oldValue: string) => string | false | void;
  /** Time HH:MM:SS */
  timeFull: (newValue: string, oldValue: string) => string | false | void;
  /** Credit Card: 1234 5678 9012 3456 */
  creditCard: (newValue: string, oldValue: string) => string | false | void;
  /** SSN: 123-45-6789 */
  ssn: (newValue: string, oldValue: string) => string | false | void;
  /** ZIP Code: 12345 */
  zip: (newValue: string, oldValue: string) => string | false | void;
  /** ZIP+4: 12345-6789 */
  zipPlus4: (newValue: string, oldValue: string) => string | false | void;
  /** IPv4: 192.168.001.001 */
  ipv4: (newValue: string, oldValue: string) => string | false | void;
  /** MAC Address: AA:BB:CC:DD:EE:FF */
  mac: (newValue: string, oldValue: string) => string | false | void;
};

/**
 * Terminal-aware character and string width calculation.
 *
 * Replaces `string-width` which incorrectly treats many BMP
 * emoji-capable characters (↗, ✓, ♥, ⚡, ☀ …) as width 2.
 * Terminals render these as 1 cell.  Only genuine CJK / fullwidth
 * characters and supplementary-plane emoji (above U+FFFF) are 2 cells.
 *
 * @module ttyWidth
 */
/**
 * Compute the display width of a string as rendered in a terminal.
 *
 * Handles ANSI escape codes (stripped), grapheme clusters (emoji sequences),
 * and uses terminal-accurate character widths instead of the over-eager
 * emoji classification in `string-width` v7.
 *
 * Drop-in replacement for `string-width`.
 *
 * @param str - The string to measure.
 * @returns Terminal cell count.
 *
 * @example
 * ```ts
 * ttyStringWidth("hello")         // 5
 * ttyStringWidth("↗ docs")        // 6  (string-width returns 7!)
 * ttyStringWidth("文字")           // 4  (CJK, correctly 2 each)
 * ttyStringWidth("\x1b[31mred\x1b[0m") // 3  (ANSI stripped)
 * ```
 * @category Core
 */
declare function ttyStringWidth(str: string): number;
/**
 * Compute the display width of a single character in a terminal cell.
 *
 * Fast-paths ASCII (always 1) and uses {@link codepointWidth} for
 * non-ASCII.  Used by the diff engine for cursor tracking.
 *
 * @param ch - A single character (may be a grapheme cluster).
 * @returns 0, 1, or 2.
 *
 * @example
 * ```ts
 * ttyCharWidth("a")  // 1
 * ttyCharWidth("文") // 2
 * ttyCharWidth("↗")  // 1
 * ```
 * @category Core
 */
declare function ttyCharWidth(ch: string): number;

/**
 * ANSI escape code parser for text with embedded formatting.
 *
 * Parses strings containing ANSI SGR (Select Graphic Rendition) codes
 * and returns an array of styled segments.
 */

interface AnsiStyle {
  fg?: Color;
  bg?: Color;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}
interface StyledSegment {
  text: string;
  style: AnsiStyle;
}
/**
 * Parse a string with ANSI escape codes into styled segments.
 *
 * Handles:
 * - SGR codes: \x1b[<params>m (colors, bold, italic, etc.)
 * - Resets escape sequences to plain text
 *
 * @param input String potentially containing ANSI escape codes
 * @returns Array of segments with text and associated style
 * @category Core
 */
declare function parseAnsi(input: string): StyledSegment[];
/**
 * Strip all ANSI escape codes from a string.
 * Useful for measuring visible width.
 * @category Core
 */
declare function stripAnsi(input: string): string;

/**
 * Terminal capability detection for image protocols
 */
interface TerminalCapabilities {
  name: string;
  supportsKittyGraphics: boolean;
  supportsIterm2Images: boolean;
  supportsSixel: boolean;
}
/**
 * Detect which terminal we're running in and what image protocols it supports
 * @category Core
 */
declare function detectTerminalCapabilities(
  debug?: boolean,
): TerminalCapabilities;
/**
 * Check if the terminal supports any inline image protocol
 * @category Core
 */
declare function supportsInlineImages(): boolean;

/**
 * Default column thresholds for each {@link Breakpoint}.
 *
 * Breakpoints are evaluated **mobile-first** — the largest threshold that
 * does not exceed the current terminal width wins.
 *
 * | Breakpoint | Columns |
 * |------------|---------|
 * | `base`     | 0       |
 * | `sm`       | 40      |
 * | `md`       | 80      |
 * | `lg`       | 120     |
 * | `xl`       | 160     |
 *
 * @category Layout
 */
declare const defaultBreakpoints: Readonly<Record<Breakpoint, number>>;
/**
 * Resolve a single {@link Responsive} value to its concrete type.
 *
 * Uses **mobile-first** logic: iterates breakpoints from smallest to
 * largest, picking the value from the last breakpoint whose threshold is
 * ≤ `columns`.
 *
 * @param value - A plain value or responsive breakpoint object.
 * @param columns - Current terminal width in columns.
 * @returns The concrete resolved value.
 *
 * @example
 * ```ts
 * resolveResponsiveValue({ base: "column", md: "row" }, 100);
 * // => "row"  (100 ≥ 80)
 *
 * resolveResponsiveValue(42, 100);
 * // => 42  (plain values pass through)
 * ```
 * @category Layout
 */
declare function resolveResponsiveValue<T>(
  value:
    | T
    | {
      [K in Breakpoint]?: T;
    },
  columns: number,
): T;
/**
 * Resolve all {@link Responsive} values in a {@link Style} to produce a
 * {@link ResolvedStyle} with only concrete values.
 *
 * @param style - The (possibly responsive) style object from a component.
 * @param columns - Current terminal width in columns.
 * @param _rows - Current terminal height in rows (reserved for future
 *   row-based breakpoints).
 * @returns A new style object with every responsive value collapsed.
 *
 * @example
 * ```ts
 * const resolved = resolveStyle(
 *   { padding: { base: 0, md: 1 }, bg: "red" },
 *   100,
 *   40,
 * );
 * // => { padding: 1, bg: "red" }
 * ```
 * @category Layout
 */
declare function resolveStyle(
  style: Style,
  columns: number,
  _rows: number,
): ResolvedStyle;

export {
  type ActionHandlers,
  type AlertOptions,
  type AnsiStyle,
  type AppHandle,
  type BorderStyle,
  Box,
  type BoxProps,
  type Breakpoint,
  Button,
  type ButtonHandle,
  type ButtonProps,
  type CellAlign,
  type CellVerticalAlign,
  Checkbox,
  type CheckboxHandle,
  type CheckboxProps,
  type Color,
  type CommandDef,
  type ConfirmOptions,
  createKeybindRegistry,
  createMask,
  DebugOverlay,
  type DebugOverlayProps,
  defaultBreakpoints,
  detectTerminalCapabilities,
  type DialogContextValue,
  DialogHost,
  type DialogHostProps,
  type DimensionValue,
  type FocusableElement,
  type FocusableHandle,
  type FocusRegistryValue,
  FocusScope,
  type FocusScopeProps,
  type FrameTiming,
  type GlobalMouseHandler,
  HelpDialog,
  type HelpDialogProps,
  type HelpOptions,
  type HexColor,
  Image,
  type ImageHandle,
  type ImageProps,
  type ImageState,
  Input,
  type InputHandle,
  type InputProps,
  type InputType,
  JumpNav,
  type JumpNavProps,
  type Key,
  Keybind,
  type KeybindDef,
  type KeybindProps,
  type KeybindRegistry,
  type LayoutRect,
  Link,
  type LinkHandle,
  type LinkProps,
  List,
  type ListHandle,
  type ListItemInfo,
  type ListProps,
  type MaskOptions,
  masks,
  Match,
  type MatchProps,
  type MediaQueryInput,
  Menu,
  type MenuItem,
  type MenuProps,
  type MessageType,
  type MouseContextValue,
  type MouseEvent,
  type MouseEventHandler,
  type NamedColor,
  parseAnsi,
  Portal,
  type PortalProps,
  Progress,
  type ProgressProps,
  Radio,
  type RadioHandle,
  type RadioItem,
  type RadioProps,
  render,
  type RenderOptions,
  type ResolvedStyle,
  resolveResponsiveValue,
  resolveStyle,
  type Responsive,
  type RGBColor,
  ScopedKeybinds,
  type ScopedKeybindsProps,
  type ScrollIntoViewOptions,
  ScrollView,
  type ScrollViewHandle,
  type ScrollViewProps,
  Select,
  type SelectHandle,
  type SelectItem,
  type SelectProps,
  Spacer,
  type SpacerProps,
  Spinner,
  type SpinnerProps,
  StatusBar,
  type StatusBarContextValue,
  type StatusBarMessage,
  type StatusBarProps,
  stripAnsi,
  type Style,
  type StyledSegment,
  supportsInlineImages,
  Table,
  TableCell,
  type TableCellProps,
  TableHeaderRow,
  type TableHeaderRowProps,
  type TableProps,
  TableRow,
  type TableRowProps,
  type TableVariant,
  type TerminalCapabilities,
  Text,
  type TextAlign,
  type TextHandle,
  type TextProps,
  type Toast,
  ToastHost,
  type ToastHostProps,
  type ToastPosition,
  type ToastVariant,
  ttyCharWidth,
  ttyStringWidth,
  useApp,
  useDialog,
  useFocus,
  useFocusable,
  type UseFocusableOptions,
  type UseFocusableResult,
  useFocusRegistry,
  useInput,
  useLayout,
  useMediaQuery,
  useMouse,
  useScrollIntoView,
  useStatusBar,
  useToast,
  type VisibleRange,
  type WrapMode,
};
