"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { Node, NodeProcessed, PathModelType } from "@/app/types";
import colors from "tailwindcss/colors";

type PathModelProps = {
  pathModel: PathModelType;
  showDisturbanceTerms: boolean;
  showCoefficients: boolean;
  onNodeClick?: (node: NodeProcessed, event: PointerEvent) => void;
  onNodeHover?: (node: NodeProcessed, event: PointerEvent) => void;
  onNodeLeave?: () => void;
};

const PathModel: React.FC<PathModelProps> = ({
  pathModel,
  showDisturbanceTerms,
  showCoefficients,
  onNodeClick,
  onNodeHover,
  onNodeLeave,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeSize = 100; // Width and height of square nodes
  const disturbanceRadius = 15; // Radius of disturbance circles

  useEffect(() => {
    const zoom = d3
      .zoom<any, any>()
      .scaleExtent([0.5, 1.5])
      .translateExtent([
        [0, 0],
        [2000, 2000],
      ])
      .on("zoom", (event) => {
        svg.select("g").attr("transform", event.transform);
      });
    const svg = d3.select(svgRef.current);

    // Clear any previous SVG content
    svg.selectAll("*").remove();

    const container = svg.append("g").attr("id", "path-model-container");

    svg.call(zoom);

    // Create arrowhead marker for directed edges
    container
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("orient", "auto-start-reverse")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0 0 10 5 0 10 3 5")
      .attr("fill", colors.zinc[50]);

    // Function to find incoming edges for a node
    const getIncomingEdges = (nodeId: string) => {
      return pathModel.edges.filter((edge) => edge.target === nodeId);
    };

    // Identify endogenous nodes
    const endogenousNodes = pathModel.nodes.filter((node) => {
      return getIncomingEdges(node.id).length > 0;
    });

    const drawnEdges = new Set();

    pathModel.edges.forEach((edge) => {
      if (drawnEdges.has(edge.source + "-" + edge.target)) return;

      const source = getNode(pathModel, edge.source);
      const target = getNode(pathModel, edge.target);

      const { x: x1Offset, y: y1Offset } = getIntersectionPoint(source, target);
      const { x: x2Offset, y: y2Offset } = getIntersectionPoint(target, source);

      const x1 = source.x + 50 + x1Offset;
      const y1 = source.y + 50 + y1Offset;
      const x2 = target.x + 50 + x2Offset;
      const y2 = target.y + 50 + y2Offset;

      const reciprocalEdge = pathModel.edges.find(
        (e) => e.source === edge.target && e.target === edge.source
      );

      const isUnknownEffect = edge.isUnknownEffect;

      if (isUnknownEffect) {
        // Draw the curved edge for unknown effects
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const curveOffset = 20;

        const controlPointX = midX;
        const controlPointY = midY + curveOffset;

        container
          .append("path")
          .attr(
            "d",
            `M${x1},${y1} Q${controlPointX},${controlPointY} ${x2},${y2}`
          )
          .attr("stroke", colors.zinc[300])
          .attr("fill", "none")
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)")
          .attr("marker-start", "url(#arrowhead)");

        // Add coefficient label
        if (showCoefficients) {
          container
            .append("text")
            .attr("x", midX)
            .attr("y", midY - 5) // Position above the edge
            .attr("fill", colors.zinc[300])
            .text(edge.coefficient);
        }
      } else if (
        reciprocalEdge &&
        !drawnEdges.has(reciprocalEdge.source + "-" + reciprocalEdge.target)
      ) {
        // Handle reciprocal edges
        const midX = (source.x + target.x) / 2 + 50;
        const midY = (source.y + target.y) / 2 + 50;
        const offset = 50;

        const isHorizontal =
          Math.abs(source.y - target.y) < Math.abs(source.x - target.x);

        if (isHorizontal) {
          // Draw horizontal arrows
          // First half
          container
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1 + 10)
            .attr("x2", midX - offset)
            .attr("y2", y1 + 10)
            .attr("stroke", colors.zinc[300])
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

          // Second half
          container
            .append("line")
            .attr("x1", x2)
            .attr("y1", y2)
            .attr("x2", midX + offset)
            .attr("y2", y2)
            .attr("stroke", colors.zinc[300])
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");
        } else {
          // Draw vertical arrows
          // First half
          container
            .append("line")
            .attr("x1", x1 + 10)
            .attr("y1", y1)
            .attr("x2", x1 + 10)
            .attr("y2", midY - offset)
            .attr("stroke", colors.zinc[300])
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");

          // Second half
          container
            .append("line")
            .attr("x1", x2)
            .attr("y1", y2)
            .attr("x2", x2)
            .attr("y2", midY + offset)
            .attr("stroke", colors.zinc[300])
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");
        }

        if (showCoefficients) {
          // Add coefficient label for reciprocal edges
          container
            .append("text")
            .attr("x", midX)
            .attr("y", midY - 5)
            .attr("fill", colors.zinc[300])
            .text(edge.coefficient);
        }

        drawnEdges.add(edge.source + "-" + edge.target);
        drawnEdges.add(reciprocalEdge.source + "-" + reciprocalEdge.target);
      } else {
        // Single arrow for non-reciprocal edges
        container
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", colors.zinc[300])
          .attr("stroke-width", 2)
          .attr("marker-end", "url(#arrowhead)");

        // Add coefficient label for non-reciprocal edges

        if (showCoefficients) {
          container
            .append("text")
            .attr("x", (x1 + x2) / 2)
            .attr("y", (y1 + y2) / 2 - 5)
            .attr("fill", colors.zinc[300])
            .text(edge.coefficient);
        }

        drawnEdges.add(edge.source + "-" + edge.target);
      }
    });

    // Draw nodes (squares)
    container
      .selectAll("rect")
      .data(pathModel.nodes)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", nodeSize)
      .attr("height", nodeSize)
      .attr("fill", colors.zinc[50])
      .attr("stroke", colors.zinc[50])
      .attr("stroke-width", 4)
      .classed(
        "duration-200 hover:cursor-pointer hover:stroke-emerald-500",
        true
      )
      .on("click", (event: PointerEvent, d) => {
        if (onNodeClick) {
          onNodeClick(
            {
              ...d,
              type: endogenousNodes.find((node) => node.id === d.id)
                ? "endogenous"
                : "exogenous",
            },
            event
          );
        }
      })
      .on("mouseover", (event: PointerEvent, d) => {
        if (onNodeHover) {
          onNodeHover(
            {
              ...d,
              type: endogenousNodes.find((node) => node.id === d.id)
                ? "endogenous"
                : "exogenous",
            },
            event
          );
        }
      })
      .on("mouseleave", () => {
        if (onNodeLeave) {
          onNodeLeave();
        }
      });

    // Add labels to nodes
    container
      .selectAll("text.label")
      .data(pathModel.nodes)
      .enter()
      .append("text")
      .attr("x", (d) => d.x + 50)
      .attr("y", (d) => d.y + 55)
      .attr("fill", colors.zinc[800])
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .classed("select-none", true)
      .text((d) => d.label)
      // add propagation of pointer events to the text element
      .style("pointer-events", "none");

    if (!showDisturbanceTerms) return;
    // Draw disturbance terms for endogenous nodes
    endogenousNodes.forEach((node) => {
      // Position disturbance node near the endogenous node
      const disturbanceX = node.x >= 500 ? node.x + 150 : node.x - 50;
      const disturbanceY = node.y >= 300 ? node.y + 150 : node.y;

      // Draw the disturbance circle
      container
        .append("circle")
        .attr("cx", disturbanceX)
        .attr("cy", disturbanceY)
        .attr("r", disturbanceRadius)
        .attr("fill", colors.zinc[100]);

      // Add the "ζ" label inside the disturbance circle
      container
        .append("text")
        .attr("x", disturbanceX)
        .attr("y", disturbanceY + 4) // Adjust for better centering
        .attr("fill", colors.zinc[800])
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .classed("select-none", true)
        .text("ζ");

      // Calculate the closest point on the node's edge
      const disturbanceNode = {
        x: disturbanceX,
        y: disturbanceY,
        label: "z",
        id: "d" + disturbanceX,
      };
      const closestPoint = getClosestPointOnNode(disturbanceNode, node);

      // Draw an edge from disturbance to the endogenous node
      container
        .append("line")
        .attr("x1", disturbanceX)
        .attr("y1", disturbanceY)
        .attr("x2", closestPoint.x)
        .attr("y2", closestPoint.y)
        .attr("stroke", colors.zinc[300])
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");
    });
  }, [pathModel, showCoefficients, showDisturbanceTerms]);

  // Helper function to get node by ID
  const getNode = (pathModel: PathModelProps["pathModel"], id: string) => {
    const n = pathModel.nodes.find((node) => node.id === id);
    if (!n) {
      throw new Error(`Node with ID ${id} not found`);
    }
    return n;
  };

  // Calculate the intersection points between a line and the square node
  const getIntersectionPoint = (source: Node, target: Node) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;

    if (dx === 0) return { x: 0, y: (nodeSize / 2) * Math.sign(dy) };
    if (dy === 0) return { x: (nodeSize / 2) * Math.sign(dx), y: 0 };

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    let offsetX = (nodeSize / 2) * (dx / absDx);
    let offsetY = (nodeSize / 2) * (dy / absDy);

    if (absDx > absDy) offsetY *= absDy / absDx;
    else offsetX *= absDx / absDy;

    return { x: offsetX, y: offsetY };
  };

  const getClosestPointOnNode = (disturbanceNode: Node, targetNode: Node) => {
    const targetCenterX = targetNode.x + 40; // Center of the target node
    const targetCenterY = targetNode.y + 40; // Center of the target node

    const dx = disturbanceNode.x - targetCenterX;
    const dy = disturbanceNode.y - targetCenterY;
    const angle = Math.atan2(dy, dx); // Angle to the disturbance term

    // Calculate coordinates of the closest point on the edge of the target node
    const closestX = targetCenterX + (nodeSize / 2) * Math.cos(angle);
    const closestY = targetCenterY + (nodeSize / 2) * Math.sin(angle);

    return { x: closestX, y: closestY };
  };

  return (
    <svg
      ref={svgRef}
      className="overflow-hidden"
      height="100vh"
      width="100vw"
    />
  );
};

export default PathModel;
