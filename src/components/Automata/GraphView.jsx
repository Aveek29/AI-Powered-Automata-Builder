import { useEffect, useMemo, useCallback, useRef } from "react";
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

function getStyle(style) {
  return STATE_COLORS[style] || STATE_COLORS.default;
}

function StateNode({ data, selected }) {
  const isCurrent = data.isCurrent;
  const isAccepting = data.isAccepting;
  const tick = data.transitionTick || 0;

  let styleKey;
  if (isCurrent && isAccepting) styleKey = "acceptingCurrent";
  else if (isCurrent) styleKey = "current";
  else if (selected) styleKey = "selected";
  else if (isAccepting) styleKey = "accepting";
  else styleKey = "default";

  const s = getStyle(styleKey);

  const handleClass = "!w-0 !h-0 !border-0 !bg-transparent !pointer-events-auto";
  const hiddenClass = "!w-1.5 !h-1.5 !border-0 !bg-transparent";

  return (
    <div className="relative">
      {data.isStart && (
        <div className="absolute -left-[72px] top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <svg width="140" height="24" viewBox="0 0 140 24" className="drop-shadow-sm">
            <defs>
              <marker id="startArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>
            <text x="0" y="16" fontSize="13" fontWeight="800" fill="#3b82f6" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" letterSpacing="1.5">START</text>
            <line x1="64" y1="12" x2="118" y2="12" stroke="#3b82f6" strokeWidth="2.5" />
            <line x1="118" y1="12" x2="128" y2="12" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#startArrow)" />
          </svg>
        </div>
      )}

      <div
        className={`relative w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full flex items-center justify-center font-bold bg-gradient-to-br border-2 shadow-md cursor-pointer select-none ${s.bg} ${s.border} ${
          isCurrent ? "scale-110 shadow-lg shadow-amber-400/30 dark:shadow-amber-500/25" : selected ? "scale-105 shadow-md shadow-blue-400/25 dark:shadow-blue-500/20" : "hover:scale-105 hover:shadow-lg"
        }`}
        style={{
          borderWidth: isCurrent || isAccepting ? 3 : 2,
          transition: isCurrent ? "all 0.2s ease-out" : "all 0.3s ease-out",
        }}
      >
        {isAccepting && (
          <div
            className={`absolute rounded-full border-[3px] ${
              isCurrent
                ? "border-amber-400/70 dark:border-amber-500/70 inset-[4px]"
                : "border-emerald-500/70 dark:border-emerald-400/70 inset-[4px]"
            }`}
          />
        )}

        {isCurrent && (
          <div
            key={`flash-${tick}`}
            className="absolute -inset-2 rounded-full border-[3px] border-amber-400/60 dark:border-amber-300/50 animate-node-flash"
          />
        )}

        {isCurrent && (
          <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400/40 dark:border-amber-500/30 animate-pulse" />
        )}

        <span className="relative z-10 font-mono text-[13px] sm:text-[15px] font-bold text-gray-800 dark:text-gray-100 leading-none">
          {data.label}
        </span>
      </div>

      <Handle type="target" id="r" position={Position.Right} className={handleClass} />
      <Handle type="target" id="l" position={Position.Left} className={handleClass} />
      <Handle type="target" id="t" position={Position.Top} className={handleClass} />
      <Handle type="target" id="b" position={Position.Bottom} className={handleClass} />

      <Handle type="source" id="r" position={Position.Right} className={hiddenClass} />
      <Handle type="source" id="l" position={Position.Left} className={hiddenClass} />
      <Handle type="source" id="t" position={Position.Top} className={hiddenClass} />
      <Handle type="source" id="b" position={Position.Bottom} className={hiddenClass} />
    </div>
  );
}

const nodeTypes = { stateNode: StateNode };

function getBestHandlePair(sourcePos, targetPos) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx >= absDy) {
    if (dx >= 0) return { sourceHandle: "r", targetHandle: "l" };
    return { sourceHandle: "l", targetHandle: "r" };
  }
  if (dy >= 0) return { sourceHandle: "b", targetHandle: "t" };
  return { sourceHandle: "t", targetHandle: "b" };
}

function getBidiHandlePair(sourcePos, targetPos) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx >= absDy) {
    if (dx >= 0) {
      return {
        forward: { sourceHandle: "r", targetHandle: "l" },
        reverse: { sourceHandle: "b", targetHandle: "t" },
      };
    }
    return {
      forward: { sourceHandle: "l", targetHandle: "r" },
      reverse: { sourceHandle: "t", targetHandle: "b" },
    };
  }
  if (dy >= 0) {
    return {
      forward: { sourceHandle: "b", targetHandle: "t" },
      reverse: { sourceHandle: "r", targetHandle: "l" },
    };
  }
  return {
    forward: { sourceHandle: "t", targetHandle: "b" },
    reverse: { sourceHandle: "l", targetHandle: "r" },
  };
}

function layoutStates(states) {
  const n = states.length;
  if (n <= 4) {
    const radius = 100;
    const cx = 130;
    const cy = 110;
    return states.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }
  const cols = Math.ceil(Math.sqrt(n));
  const spacingX = 130;
  const spacingY = 100;
  return states.map((_, i) => ({
    x: (i % cols) * spacingX + 60,
    y: Math.floor(i / cols) * spacingY + 60,
  }));
}

export default function GraphView({ automata, currentState, onStateClick }) {
  const graphHeight = useMemo(() => {
    const count = automata?.states?.length || 0;
    if (count <= 3) return "h-[260px] sm:h-[320px] lg:h-[380px]";
    if (count <= 5) return "h-[300px] sm:h-[380px] lg:h-[450px]";
    return "h-[350px] sm:h-[450px] lg:h-[520px]";
  }, [automata]);

  const transitionTick = useRef(0);
  const prevState = useRef(null);
  useEffect(() => {
    if (currentState && currentState !== prevState.current) {
      transitionTick.current += 1;
    }
    prevState.current = currentState;
  }, [currentState]);

  const { nodes: freshNodes, edges: freshEdges } = useMemo(() => {
    if (!automata) return { nodes: [], edges: [] };

    const states = automata.states || [];
    const transitions = automata.transitions || [];
    const startState = automata.start || (states.length > 0 ? states[0] : "");
    const accepting = automata.accepting || (states.length > 0 ? [states[states.length - 1]] : []);

    const positions = layoutStates(states);

    const posMap = {};
    const nodes = states.map((s, i) => {
      posMap[s] = positions[i];
      return {
        id: s,
        type: "stateNode",
        data: {
          label: s,
          isStart: s === startState,
          isAccepting: accepting.includes(s),
          isCurrent: s === currentState,
          transitionTick: transitionTick.current,
        },
        position: positions[i],
      };
    });

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
    const edgeEntries = Array.from(edgeMap.entries());
    for (const [k] of edgeEntries) {
      const [a, b] = k.split("->");
      if (edgeMap.has(`${b}->${a}`) && a !== b) {
        const key = a < b ? `${a}|||${b}` : `${b}|||${a}`;
        reversePairs.add(key);
      }
    }

    const edges = Array.from(edgeMap.values()).map((val) => {
      const isSelfLoop = val.from === val.to;
      const sortedInputs = Array.from(val.inputs).sort();
      const pairKey = val.from < val.to ? `${val.from}|||${val.to}` : `${val.to}|||${val.from}`;
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
          fontSize: isSelfLoop ? 10 : 11,
          fill: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', 'Inter', monospace",
        },
        labelBgStyle: {
          fill: themeColor,
          fillOpacity: 1,
          rx: 5,
          ry: 5,
        },
        labelBgPadding: [7, 3],
        labelBgBorderRadius: 5,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: themeColor,
        },
      };

      if (isSelfLoop) {
        edge.type = "smoothstep";
        edge.sourceHandle = "r";
        edge.targetHandle = "r";
        edge.style.strokeWidth = 1.8;
        edge.style.opacity = 0.7;
        edge.markerEnd.width = 16;
        edge.markerEnd.height = 16;
        return edge;
      }

      const srcPos = posMap[val.from];
      const tgtPos = posMap[val.to];
      if (!srcPos || !tgtPos) {
        edge.type = "smoothstep";
        edge.sourceHandle = "r";
        edge.targetHandle = "l";
        return edge;
      }

      const srcCenter = { x: srcPos.x + 30, y: srcPos.y + 30 };
      const tgtCenter = { x: tgtPos.x + 30, y: tgtPos.y + 30 };

      if (hasReverse) {
        const { forward, reverse } = getBidiHandlePair(srcCenter, tgtCenter);
        const isForward = `${val.from}->${val.to}` < `${val.to}->${val.from}`;
        const handles = isForward ? forward : reverse;
        edge.type = "smoothstep";
        edge.sourceHandle = handles.sourceHandle;
        edge.targetHandle = handles.targetHandle;
      } else {
        const handles = getBestHandlePair(srcCenter, tgtCenter);
        edge.type = "smoothstep";
        edge.sourceHandle = handles.sourceHandle;
        edge.targetHandle = handles.targetHandle;
      }

      return edge;
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
      <div className="flex items-center justify-center h-[200px] sm:h-[280px] lg:h-[350px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30 text-gray-400 dark:text-gray-500 transition-colors duration-200">
        <div className="text-center px-4">
          <svg className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <p className="text-xs sm:text-sm font-medium">Convert some text to see the automata graph</p>
          <p className="text-[11px] sm:text-xs text-gray-300 dark:text-gray-600 mt-1">Enter a description and click Convert</p>
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
        fitViewOptions={{ padding: 0.4 }}
        attributionPosition="bottom-left"
        minZoom={0.3}
        maxZoom={4}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2.5 },
        }}
      >
        <Background gap={16} size={0.8} color="var(--bg-grid-color, #d1d5db)" style={{ backgroundColor: "transparent" }} />
        <Controls showInteractive={false} className="!bg-white/85 dark:!bg-gray-800/85 !backdrop-blur-sm !border !border-gray-200/50 dark:!border-gray-700/50 !rounded-lg !shadow-sm" />
      </ReactFlow>
    </div>
  );
}
