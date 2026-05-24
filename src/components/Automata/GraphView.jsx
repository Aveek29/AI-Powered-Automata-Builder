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
    shadow: "shadow-md shadow-gray-200/50 dark:shadow-gray-900/30",
  },
  current: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/30",
    border: "border-amber-400 dark:border-amber-500",
    shadow: "shadow-lg shadow-amber-400/30 dark:shadow-amber-500/25",
  },
  selected: {
    bg: "from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/30",
    border: "border-blue-500 dark:border-blue-400",
    shadow: "shadow-lg shadow-blue-400/25 dark:shadow-blue-500/20",
  },
  accepting: {
    bg: "from-emerald-50 to-green-50 dark:from-emerald-900/40 dark:to-green-900/30",
    border: "border-emerald-500 dark:border-emerald-400",
    shadow: "shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30",
  },
  acceptingCurrent: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/30",
    border: "border-amber-400 dark:border-amber-500",
    shadow: "shadow-lg shadow-amber-400/30 dark:shadow-amber-500/25",
  },
};

function getStyle(style) {
  return STATE_COLORS[style] || STATE_COLORS.default;
}

function StateNode({ data, selected }) {
  const isCurrent = data.isCurrent;
  const isAccepting = data.isAccepting;

  let styleKey;
  if (isCurrent && isAccepting) styleKey = "acceptingCurrent";
  else if (isCurrent) styleKey = "current";
  else if (selected) styleKey = "selected";
  else if (isAccepting) styleKey = "accepting";
  else styleKey = "default";

  const s = getStyle(styleKey);

  return (
    <div className="relative">
      {data.isStart && (
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg width="52" height="18" viewBox="0 0 52 18" className="drop-shadow-sm">
            <text x="0" y="13" fontSize="11" fontWeight="800" fill="#3b82f6" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" letterSpacing="1">START</text>
            <line x1="42" y1="9" x2="48" y2="9" stroke="#3b82f6" strokeWidth="2.5" />
            <polygon points="48,3 52,9 48,15" fill="#3b82f6" />
          </svg>
        </div>
      )}

      <div
        className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center font-bold text-base bg-gradient-to-br border-2 transition-all duration-300 ease-out cursor-pointer select-none ${s.bg} ${s.border} ${s.shadow} ${
          isCurrent ? "scale-110" : selected ? "scale-105" : "hover:scale-105 hover:shadow-xl"
        }`}
        style={{ borderWidth: isCurrent ? 3 : isAccepting ? 3 : 2 }}
      >
        {isAccepting && (
          <div
            className={`absolute rounded-full border-[3px] ${
              isCurrent
                ? "border-amber-400/70 dark:border-amber-500/70 inset-[5px]"
                : "border-emerald-500/70 dark:border-emerald-400/70 inset-[5px]"
            }`}
          />
        )}
        {isCurrent && (
          <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400/40 dark:border-amber-500/30 animate-pulse" />
        )}
        <span className="relative z-10 font-mono text-[14px] font-bold text-gray-800 dark:text-gray-100">
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="!w-0 !h-0 !border-0 !bg-transparent" />
      <Handle type="target" position={Position.Left} className="!w-0 !h-0 !border-0 !bg-transparent" />
    </div>
  );
}

const nodeTypes = { stateNode: StateNode };

function buildEdgeKey(a, b) {
  return a < b ? `${a}|||${b}` : `${b}|||${a}`;
}

function layoutStates(states) {
  const n = states.length;
  if (n <= 4) {
    const radius = 180;
    const cx = 200;
    const cy = 180;
    return states.map((s, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }

  const cols = Math.ceil(Math.sqrt(n));
  const spacingX = 260;
  const spacingY = 200;
  return states.map((_, i) => ({
    x: (i % cols) * spacingX + 80,
    y: Math.floor(i / cols) * spacingY + 80,
  }));
}

export default function GraphView({ automata, currentState, onStateClick }) {
  const { nodes: freshNodes, edges: freshEdges } = useMemo(() => {
    if (!automata) return { nodes: [], edges: [] };

    const states = automata.states || [];
    const transitions = automata.transitions || [];
    const startState = automata.start || (states.length > 0 ? states[0] : "");
    const accepting = automata.accepting || (states.length > 0 ? [states[states.length - 1]] : []);

    const positions = layoutStates(states);

    const nodes = states.map((s, i) => ({
      id: s,
      type: "stateNode",
      data: {
        label: s,
        isStart: s === startState,
        isAccepting: accepting.includes(s),
        isCurrent: s === currentState,
      },
      position: positions[i],
    }));

    const root = document.documentElement;
    const themeColor = getComputedStyle(root).getPropertyValue("--theme-primary").trim() || "#3b82f6";

    const edgeMap = new Map();
    transitions.forEach((t) => {
      const key = `${t.from}->${t.to}`;
      if (edgeMap.has(key)) {
        edgeMap.get(key).inputs.add(t.input);
      } else {
        edgeMap.set(key, { from: t.from, to: t.to, inputs: new Set([t.input]) });
      }
    });

    const reversePairs = new Set();
    const keys = Array.from(edgeMap.keys());
    for (const k of keys) {
      const [a, b] = k.split("->");
      const rk = `${b}->${a}`;
      if (keys.includes(rk) && a !== b) {
        reversePairs.add(buildEdgeKey(a, b));
      }
    }

    const edges = Array.from(edgeMap.values()).map((val) => {
      const isSelfLoop = val.from === val.to;
      const sortedInputs = Array.from(val.inputs).sort();
      const pairKey = buildEdgeKey(val.from, val.to);
      const hasReverse = reversePairs.has(pairKey) && !isSelfLoop;

      const label = sortedInputs.join(",");

      const edge = {
        id: `e-${val.from}-${val.to}-${sortedInputs.join("-")}`,
        source: val.from,
        target: val.to,
        label,
        style: {
          stroke: themeColor,
          strokeWidth: 2.5,
        },
        labelStyle: {
          fontWeight: 800,
          fontSize: 12,
          fill: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', 'Inter', monospace",
        },
        labelBgStyle: {
          fill: themeColor,
          fillOpacity: 1,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 6,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 22,
          height: 22,
          color: themeColor,
        },
      };

      if (isSelfLoop) {
        edge.type = "smoothstep";
        edge.style.strokeWidth = 2;
        edge.style.opacity = 0.7;
        edge.markerEnd.width = 18;
        edge.markerEnd.height = 18;
        edge.labelStyle.fontSize = 11;
        edge.labelBgPadding = [6, 3];
      } else if (hasReverse) {
        edge.type = "smoothstep";
        edge.sourcePosition = Position.Right;
        edge.targetPosition = Position.Left;
      } else {
        edge.type = "smoothstep";
        edge.sourcePosition = Position.Right;
        edge.targetPosition = Position.Left;
      }

      return edge;
    });

    return { nodes, edges };
  }, [automata, currentState]);

  const graphHeight = useMemo(() => {
    const count = (automata?.states?.length || 0);
    if (count <= 3) return "h-[300px] md:h-[350px] lg:h-[400px]";
    return "h-[350px] md:h-[450px] lg:h-[500px]";
  }, [automata]);

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
      <div className="flex items-center justify-center h-[250px] md:h-[350px] lg:h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 text-gray-400 dark:text-gray-500 transition-colors duration-200">
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
    <div className={"border border-gray-200/80 dark:border-gray-700/50 rounded-xl overflow-hidden transition-colors duration-200 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/30 dark:to-gray-800/20 " + graphHeight}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        attributionPosition="bottom-left"
        minZoom={0.35}
        maxZoom={3}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2.5 },
        }}
      >
        <Background
          gap={20}
          size={1}
          color="var(--bg-grid-color, #d1d5db)"
          style={{ backgroundColor: "transparent" }}
        />
        <Controls
          showInteractive={false}
          className="!bg-white/85 dark:!bg-gray-800/85 !backdrop-blur-sm !border !border-gray-200/50 dark:!border-gray-700/50 !rounded-lg !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}
