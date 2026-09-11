import type { CSSProperties } from "react";
import type { Edge, Lang, Node } from "../schema/story";
import { ArrowIcon } from "./icons";

type NavigationProps = {
  node: Node;
  edges: Edge[];
  glowId: string | null;
  lang: Lang;
  onNavigate: (to: string) => void;
  onHover: () => void;
  mediaBounds: { left: number; top: number; width: number; height: number };
};

function boxStyle(box: { x: number; y: number; w: number; h: number }, mediaBounds: NavigationProps["mediaBounds"]): CSSProperties {
  return {
    left: mediaBounds.left + mediaBounds.width * box.x / 100,
    top: mediaBounds.top + mediaBounds.height * box.y / 100,
    width: mediaBounds.width * box.w / 100,
    height: mediaBounds.height * box.h / 100,
  };
}

export function NavigationUi({ node, edges, glowId, lang, onNavigate, onHover, mediaBounds }: NavigationProps) {
  const arrowEdges = edges.filter((edge): edge is Extract<Edge, { arrow: "left" | "up" | "right" }> => "arrow" in edge);
  const menuEdges = edges.filter((edge): edge is Extract<Edge, { kind: "menu" }> => edge.kind === "menu");

  return (
    <>
      {arrowEdges.map((edge) => (
        <button
          key={edge.id}
          className={`direction-arrow direction-${edge.arrow} ${glowId === edge.id ? "is-glowing" : ""}`}
          onClick={() => onNavigate(edge.to)}
          onMouseEnter={onHover}
          type="button"
          aria-label={node.title[lang]}
        >
          <ArrowIcon direction={edge.arrow} />
        </button>
      ))}
      {node.question && menuEdges.length > 0 && (
        <div className="menu-stack" data-eid="question">
          <h1>{node.question[lang]}</h1>
          <div className="menu-list">
            {menuEdges.map((edge) => (
              <button
                key={edge.id}
                className={`menu-button ${glowId === edge.id ? "is-glowing" : ""}`}
                onClick={() => onNavigate(edge.to)}
                onMouseEnter={onHover}
                type="button"
              >
                {edge.text[lang]}
              </button>
            ))}
          </div>
        </div>
      )}
      {menuEdges.map((edge) => edge.hotspot && (
        <button
          key={`${edge.id}-hotspot`}
          className="hotspot"
          style={boxStyle(edge.hotspot, mediaBounds)}
          onClick={() => onNavigate(edge.to)}
          onMouseEnter={onHover}
          type="button"
          aria-label={edge.text[lang]}
        />
      ))}
    </>
  );
}
