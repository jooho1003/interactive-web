import type { Edge, Node } from "../schema/story";

export function availableEdges(node: Node, nodes: Map<string, Node>): Edge[] {
  return node.edges.filter((edge) => nodes.get(edge.to)?.available === true);
}

export function glowEdgeId(node: Node, flags: Record<string, boolean>): string | null {
  if (!node.glow) return null;
  const switched = node.glow.switchWhen?.every((flag) => flags[flag]) ?? false;
  return switched ? (node.glow.secondary ?? node.glow.primary) : node.glow.primary;
}

export function preloadEdges(node: Node, nodes: Map<string, Node>) {
  for (const edge of availableEdges(node, nodes)) {
    const target = nodes.get(edge.to);
    if (!target) continue;
    if (target.media.kind === "still") {
      const image = new Image();
      image.decoding = "async";
      image.src = target.media.src;
    }
  }
}

