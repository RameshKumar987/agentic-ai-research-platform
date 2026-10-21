import { useEffect, useId, useState } from "react";
import { ArrowRight, LoaderCircle, Workflow } from "lucide-react";
import type { Architecture } from "../lib/types";

type RenderState = "loading" | "ready" | "failed";

interface MermaidDiagramProps {
  architecture: Architecture;
}

export function MermaidDiagram({ architecture }: MermaidDiagramProps) {
  const rawId = useId();
  const diagramId = `rh-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [state, setState] = useState<RenderState>("loading");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let active = true;
    setState("loading");
    setSvg("");

    import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif",
          themeVariables: {
            background: "#0f1422",
            primaryColor: "#171f33",
            primaryTextColor: "#e8ebf3",
            primaryBorderColor: "#8b5cf6",
            lineColor: "#55617d",
            secondaryColor: "#101728",
            tertiaryColor: "#101728",
            fontSize: "14px",
            edgeLabelBackground: "#0f1422",
            clusterBkg: "#0b101d",
            clusterBorder: "#2a3450",
            titleColor: "#e8ebf3",
          },
        });
        return mermaid.render(diagramId, architecture.mermaid);
      })
      .then((result) => {
        if (active) {
          setSvg(result.svg);
          setState("ready");
        }
      })
      .catch((error: unknown) => {
        console.warn("Mermaid render failed; using fallback diagram.", error);
        if (active) setState("failed");
      });

    return () => {
      active = false;
    };
  }, [architecture.mermaid, diagramId]);

  if (state === "loading") {
    return (
      <div className="mermaid-loading" aria-busy="true">
        <LoaderCircle size={18} className="spin" aria-hidden="true" />
        Rendering architecture diagram...
      </div>
    );
  }

  if (state === "failed") {
    return <FallbackDiagram architecture={architecture} />;
  }

  return (
    <div
      className="mermaid-canvas"
      aria-label="Proposed architecture flowchart"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function FallbackDiagram({ architecture }: { architecture: Architecture }) {
  const implemented = architecture.nodes.filter((node) => node.implemented);
  const proposed = architecture.nodes.filter((node) => !node.implemented && node.id !== "user");

  return (
    <div className="fallback-diagram">
      <div className="fallback-note">
        <Workflow size={16} aria-hidden="true" />
        Mermaid could not render here, so this is the static fallback view.
      </div>
      <div className="fallback-row">
        <span className="fallback-label">Implemented in this MVP</span>
        <div className="fallback-chain">
          {implemented.map((node, index) => (
            <span key={node.id} className="fallback-chain-item">
              <span className="fallback-node fallback-node-implemented">{node.label}</span>
              {index < implemented.length - 1 && <ArrowRight size={15} aria-hidden="true" />}
            </span>
          ))}
        </div>
      </div>
      <div className="fallback-row">
        <span className="fallback-label">Proposed pipeline (not executed)</span>
        <div className="fallback-chain">
          {proposed.map((node, index) => (
            <span key={node.id} className="fallback-chain-item">
              <span className="fallback-node">{node.label}</span>
              {index < proposed.length - 1 && <ArrowRight size={15} aria-hidden="true" />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
