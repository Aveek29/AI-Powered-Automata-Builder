import { useEffect, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

const STATE_COLORS = {
  default: {
    bg: "from-white to-gray-50 dark:from-gray-700 dark:to-gray-650",
    border: "border-gray-400 dark:border-gray-500",
  },
  current: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/30",
    border: "border-amber-400 dark:border-amber-500",
  },
  selected: {
    bg: "from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/30",
    border: "border-blue-500 dark:border-blue-400",
  },
  accepting: {
    bg: "from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/30",
    border: "border-emerald-500 dark:border-emerald-400",
  },
  acceptingCurrent: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/30",
    border: "border-amber-400 dark:border-amber-500",
  },
};

function StateNode({ data, selected }) {
  const isCurrent = data.isCurrent;
  const isAccepting = data.isAccepting;

  let style;
  if (isCurrent && isAccepting) style = STATE_COLORS.acceptingCurrent;
  else if (isCurrent) style = STATE_COLORS.current;
  else if (selected) style = STATE_COLORS.selected;
  else if (isAccepting) style = STATE_COLORS.accepting;
  else style = STATE_COLORS.default;

  const borderColor = isCurrent
    ? "border-amber-400 dark:border-amber-500"
    : isAccepting
      ? "border-emerald-500 dark:border-emerald-400"
      : selected
        ? "border-blue-500 dark:border-blue-400"
        : "border-gray-400 dark:border-gray-500";

  return (
    <div className="relative">
      {data.isStart && (
        <div className="absolute -left-9 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">Start</span>
            <svg width="14" height="14" viewBox="0 0 20 20">
              <polygon points="0,10 20,0 20,20" fill="#3b82f6" className="drop-shadow-sm" />
            </svg>
          </div>
        </div>
      )}
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br ${style.bg} ${borderColor} transition-all duration-300 ease-out cursor-pointer select-none ${
          isCurrent
            ? "shadow-lg shadow-amber-400/30 dark:shadow-amber-500/20 scale-110"
            : selected
              ? "shadow-md shadow-blue-400/20 dark:shadow-blue-500/10 scale-105"
              : "shadow-sm hover:shadow-md hover:scale-105"
        }`}
        style={{ borderWidth: isCurrent ? 3 : isAccepting ? 3 : 2 }}
      >
        {isAccepting && (
          <div className={`absolute inset-[3px] rounded-full border-2 border-emerald-500/60 dark:border-emerald-400/60 ${isCurrent ? "border-amber-400/60 dark:border-amber-500/60" : ""}`} />
        )}
        {isCurrent && (
          <div className="absolute -inset-1 rounded-full border-2 border-amber-400/40 dark:border-amber-500/30 animate-pulse" />
        )}
        <span className="relative z-10 font-mono text-base">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-800" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white dark:!border-gray-800" />
    </div>
  );
}

const nodeTypes = { stateNode: StateNode };

const EDGE_THEMES = {
  light: { stroke: "#3b82f6", labelFill: "#3b82f6" },
  dark: { stroke: "#3b82f6", labelFill: "#3b82f6" },
  synthwave: { stroke: "#00ffff", labelFill: "#00ffff" },
  aurora: { stroke: "#2dd4bf", labelFill: "#2dd4bf" },
  moss: { stroke: "#eab308", labelFill: "#eab308" },
  amber: { stroke: "#f97316", labelFill: "#f97316" },
  rose: { stroke: "#f472b6", labelFill: "#f472b6" },
  dracula: { stroke: "#a855f7", labelFill: "#a855f7" },
  cyber: { stroke: "#f97316", labelFill: "#f97316" },
  monochrome: { stroke: "#94a3b8", labelFill: "#94a3b8" },
  oceanic: { stroke: "#22c55e", labelFill: "#22c55e" },
  retro: { stroke: "#22c55e", labelFill: "#22c55e" },
};

function getEdgeTheme(themeId) {
  return EDGE_THEMES[themeId] || EDGE_THEMES.light;
}

export default function GraphView({ automata, currentState, onStateClick }) {
  const { nodes: freshNodes, edges: freshEdges } = useMemo(() => {
    if (!automata) return { nodes: [], edges: [] };

    const states = automata.states || [];
    const transitions = automata.transitions || [];
    const startState = automata.start || (states.length > 0 ? states[0] : "");
    const accepting = automata.accepting || (states.length > 0 ? [states[states.length - 1]] : []);

    const cols = Math.ceil(Math.sqrt(states.length));
    const spacingX = 200;
    const spacingY = 140;

    const nodes = states.map((s, i) => ({
      id: s,
      type: "stateNode",
      data: {
        label: s,
        isStart: s === startState,
        isAccepting: accepting.includes(s),
        isCurrent: s === currentState,
      },
      position: {
        x: (i % cols) * spacingX + 60,
        y: Math.floor(i / cols) * spacingY + 60,
      },
    }));

    const root = document.documentElement;
    const themeColor = getComputedStyle(root).getPropertyValue("--theme-primary").trim() || "#3b82f6";

    const edgeIds = new Set();
    const edges = transitions
      .filter((t) => {
        const key = `${t.from}->${t.to}::${t.input}`;
        if (edgeIds.has(key)) return false;
        edgeIds.add(key);
        return true;
      })
      .map((t, i) => {
        const isSelfLoop = t.from === t.to;
        return {
          id: `e-${t.from}-${t.to}-${t.input}`,
          source: t.from,
          target: t.to,
          label: t.input,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 22,
            height: 22,
            color: themeColor,
          },
          style: {
            stroke: themeColor,
            strokeWidth: isSelfLoop ? 1.5 : 2,
            opacity: isSelfLoop ? 0.7 : 0.85,
          },
          labelStyle: {
            fontWeight: 700,
            fontSize: 12,
            fill: themeColor,
            fontFamily: "'Plus Jakarta Sans', monospace",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            rx: 4,
            ry: 4,
          },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
          type: isSelfLoop ? "self" : "smoothstep",
          animated: isSelfLoop,
        };
      });

    return { nodes, edges };
  }, [automata, currentState]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(freshNodes);
    setEdges(freshEdges);
  }, [freshNodes, freshEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_, node) => {
      onStateClick?.(node.id);
    },
    [onStateClick]
  );

  if (!automata) {
    return (
      <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 text-gray-400 dark:text-gray-500 transition-colors duration-200">
        <div className="text-center">
          <svg className="w-14 h-14 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <p className="text-sm font-medium">Convert some text to see the automata graph</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Enter a description and click Convert</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200/80 dark:border-gray-700/50 rounded-xl overflow-hidden transition-colors duration-200 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/30 dark:to-gray-800/20" style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        minZoom={0.4}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2 },
        }}
      >
        <Background
          gap={20}
          size={1.5}
          color="var(--bg-grid-color, #e5e7eb)"
          style={{ backgroundColor: "transparent" }}
        />
        <Controls
          showInteractive={false}
          className="!bg-white/80 dark:!bg-gray-800/80 !backdrop-blur-sm !border !border-gray-200/50 dark:!border-gray-700/50 !rounded-lg !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
