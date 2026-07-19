"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        darkMode: true,
        background: "#09090b", // Background to match card
        fontFamily: "inherit",
        primaryColor: "#3b82f6", // Blue for root
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#2563eb",
        secondaryColor: "#8b5cf6", // Purple for branches
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: "#7c3aed",
        tertiaryColor: "#10b981", // Green for leaves
        tertiaryTextColor: "#ffffff",
        tertiaryBorderColor: "#059669",
        lineColor: "#3f3f46",
        clusterBkg: "#18181b"
      },
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          const id = `mermaid-chart-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          
          // Remove max-width to allow native sizing
          let cleanedSvg = svg.replace(/max-width:\s*[^;]+;?/gi, "");
          
          containerRef.current.innerHTML = cleanedSvg;
        } catch (error) {
          console.error("Mermaid parsing failed", error);
          containerRef.current.innerHTML = `<div class="text-red-500 font-bold mb-4">Failed to render mind map.</div><pre class="text-xs text-left text-muted-foreground overflow-auto p-4 bg-background rounded border">${chart}</pre>`;
        }
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  return (
    <div className="w-full h-full flex justify-center items-center overflow-auto bg-card rounded-xl p-4">
      <div ref={containerRef} className="mermaid-container" />
    </div>
  );
};
