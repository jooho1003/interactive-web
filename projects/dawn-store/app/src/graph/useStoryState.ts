import { useCallback, useMemo, useReducer } from "react";
import type { Story } from "../schema/story";

type State = { nodeId: string; flags: Record<string, boolean> };
type Action = { type: "navigate"; nodeId: string; flag?: string } | { type: "replay"; nodeId: string };

function reducer(state: State, action: Action): State {
  if (action.type === "replay") return { nodeId: action.nodeId, flags: {} };
  return {
    nodeId: action.nodeId,
    flags: action.flag ? { ...state.flags, [action.flag]: true } : state.flags,
  };
}

export function useStoryState(story: Story) {
  const nodeMap = useMemo(() => new Map(story.nodes.map((node) => [node.id, node])), [story]);
  const [state, dispatch] = useReducer(reducer, { nodeId: story.start, flags: {} });
  const currentNode = nodeMap.get(state.nodeId) ?? nodeMap.get(story.start)!;

  const navigate = useCallback((nodeId: string) => {
    const destination = nodeMap.get(nodeId);
    if (!destination?.available) return;
    dispatch({ type: "navigate", nodeId, flag: destination.setsFlag });
  }, [nodeMap]);

  const replay = useCallback(() => dispatch({ type: "replay", nodeId: story.start }), [story.start]);

  return { currentNode, flags: state.flags, nodeMap, navigate, replay };
}

