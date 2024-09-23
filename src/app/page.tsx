"use client";
import PathModel from "@/components/ui/path-model";
import { PathModelType, Node, Edge } from "./types";
import { Button } from "@/components/ui/button";
import { MixerHorizontalIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useStore } from "@/lib/store";
import Toolbar from "@/components/ui/toolbar";

export default function Home() {
  const {
    options,
    setOption,
    pathModel,
    setPathModel,
    selectedTool,
    toolDetail,
    setToolDetail,
    selectedNodes,
    setSelectedNodes,
  } = useStore();

  function getRegressionEquation(
    pathModel: PathModelType,
    targetNodeId: string
  ): string {
    const node = pathModel.nodes.find((n) => n.id === targetNodeId);
    if (!node) return "";

    const incomingEdges = pathModel.edges.filter(
      (edge) => edge.target === targetNodeId
    );
    const terms: string[] = [];

    incomingEdges.forEach((edge) => {
      const sourceNode = pathModel.nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        terms.push(`(${edge.coefficient}) * ${sourceNode.label}`);
      }
    });

    // Include disturbance term if needed
    const disturbanceTerm = `ζ${targetNodeId.replace(/\w/i, "")}`; // Assuming disturbance term is present
    if (terms.length > 0) {
      return `${targetNodeId} = ${terms.join(" + ")} + ${disturbanceTerm}`;
    } else {
      return `${targetNodeId} = ${disturbanceTerm}`;
    }
  }

  function getNodeById(pathModel: PathModelType, nodeId: string): Node {
    return pathModel.nodes.find((node) => node.id === nodeId)!;
  }

  function getImpliedCorrelation(
    pathModel: PathModelType,
    node1: Node,
    node2: Node
  ) {
    const impliedCorrelation = {
      total: 0,
      components: [] as { edges: Edge[]; contribution: number }[],
    };

    function findPaths(
      currentNode: Node,
      targetNode: Node,
      visited: Set<string>,
      path: Edge[],
      accCoefficient: number,
      directionChanges: number,
      unknownEffectsUsed: number
    ) {
      if (currentNode.id === targetNode.id) {
        // Add the current path contribution
        impliedCorrelation.total += accCoefficient;
        impliedCorrelation.components.push({
          edges: [...path],
          contribution: accCoefficient,
        });
        return;
      }

      visited.add(currentNode.id);

      // Iterate over edges to find paths
      pathModel.edges.forEach((edge) => {
        let nextNode: Node | null = null;
        const newCoefficient = accCoefficient * edge.coefficient;
        let newDirectionChanges = directionChanges;
        let newUnknownEffectsUsed = unknownEffectsUsed;

        // Follow the direction of the arrow (source -> target)
        if (edge.source === currentNode.id && !visited.has(edge.target)) {
          nextNode = getNodeById(pathModel, edge.target);
        }
        // Allow one change in direction (target -> source)
        else if (
          edge.target === currentNode.id &&
          !visited.has(edge.source) &&
          directionChanges < 1
        ) {
          nextNode = getNodeById(pathModel, edge.source);
          newDirectionChanges += 1; // Increment direction change count
        }

        if (nextNode) {
          // Check if it's an unknown effect (double-headed arrow)
          if (edge.isUnknownEffect) {
            if (unknownEffectsUsed < 1) {
              newUnknownEffectsUsed += 1;
            } else {
              // Skip if more than one unknown effect is used
              return;
            }
          }

          // Recursively search for the target node through valid paths
          findPaths(
            nextNode,
            targetNode,
            visited,
            [...path, edge], // Add the current edge to the path
            newCoefficient,
            newDirectionChanges,
            newUnknownEffectsUsed
          );
        }
      });

      visited.delete(currentNode.id); // Backtrack
    }

    // Start finding paths from node1 to node2
    findPaths(node1, node2, new Set(), [], 1, 0, 0);

    return {
      impliedCorrelation: impliedCorrelation.total,
      breakdown: impliedCorrelation.components,
    };
  }

  useEffect(() => {
    if (selectedNodes.length === 2) {
      const { impliedCorrelation, breakdown } = getImpliedCorrelation(
        pathModel,
        getNodeById(pathModel, selectedNodes[0])!,
        getNodeById(pathModel, selectedNodes[1])!
      );

      console.log(impliedCorrelation, breakdown);

      setToolDetail(
        <div>
          <p className="border-b border-zinc-400">
            = {impliedCorrelation.toFixed(3)}
          </p>
          {breakdown.map((component, i) => (
            <div key={i}>
              <span>
                {component.edges.map((edge, idx) => {
                  const previousEdge = component.edges[idx - 1];
                  if (previousEdge && previousEdge.target !== edge.source) {
                    return (
                      <span key={`${edge.source}-${idx}`}>
                        {" -> "}
                        <span>{edge.source}</span>
                      </span>
                    );
                  }
                  return (
                    <span key={`${edge.source}-${idx}`}>
                      {idx === 0 && <span>{edge.source}</span>}
                      <span>
                        {" "}
                        {" -> "} {edge.target}
                      </span>
                    </span>
                  );
                })}
              </span>
              <span> ({component.contribution.toFixed(3)})</span>
            </div>
          ))}
        </div>
      );
    }
  }, [selectedNodes]);

  return (
    <div className="gap-16 font-[family-name:var(--font-geist-sans)]">
      <header className="p-3 z-[999] flex items-center justify-between bg-zinc-900/90 backdrop-blur-md fixed top-0 w-full">
        <h1 className="">Path Analysis experiments</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setPathModel()}>
            <ReloadIcon className="mr-2" />
            Change model
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <MixerHorizontalIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              className="w-80 bg-zinc-950 text-zinc-200 space-y-2 dark"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-disturbance"
                  checked={options.showDisturbanceTerms}
                  onCheckedChange={(v) => setOption("showDisturbanceTerms", v)}
                />
                <Label htmlFor="show-disturbance">Show disturbance terms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-coefficients"
                  checked={options.showCoefficients}
                  onCheckedChange={(v) => setOption("showCoefficients", v)}
                />
                <Label htmlFor="show-coefficients">
                  Show path coefficients
                </Label>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
      <Toolbar />
      <div className="flex flex-col relative h-screen max-h-screen overflow-hidden">
        <div className="fixed bottom-4 left-4">
          <div className="md:hidden">Does not work well on mobile devices</div>
          <Link
            href="https://marckohler.dev"
            target="_blank"
            rel="noopener"
            className="text-zinc-700 hover:text-zinc-500 duration-200"
          >
            marckohler.dev
          </Link>
        </div>
        <div
          className={cn(
            "fixed top-24 right-4 text-sm w-64 p-3 bg-zinc-800/70 rounded-lg text-zinc-300 duration-200 transition-opacity",
            toolDetail === null ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="font-bold mb-2">
            {selectedTool === "equations"
              ? "Regression equation"
              : "Implied correlation"}
          </div>
          {toolDetail}
        </div>
        <PathModel
          pathModel={pathModel}
          onNodeClick={(node) => {
            if (selectedTool === "equations") {
              if (node.type === "exogenous") {
                toast.error("No regression equation for exogenous variables");
                setToolDetail(null);
                return;
              }
              if (node.type === "endogenous") {
                setToolDetail(getRegressionEquation(pathModel, node.id));
              }
            } else if (selectedTool === "implied-correlations") {
              // if node already selected, deselect it
              if (selectedNodes.includes(node.id)) {
                setSelectedNodes(selectedNodes.filter((n) => n !== node.id));
              } else {
                if (selectedNodes.length < 2) {
                  setSelectedNodes([...selectedNodes, node.id]);
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
