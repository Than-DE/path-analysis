"use client";
import PathModel from "@/components/ui/path-model";
import { PathModelType } from "./types";
import { Button } from "@/components/ui/button";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MODELS } from "@/lib/models";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  const getRandomPathModel = () => {
    const randomIndex = Math.floor(Math.random() * MODELS.length);
    const model = MODELS[randomIndex];

    // Randomize coefficients
    model.edges = model.edges.map((edge) => {
      const coefficient = +(Math.random() * 2 - 1).toFixed(3);
      if (coefficient === 0) {
        // randomize again if coefficient is 0
        return {
          ...edge,
          coefficient: +(Math.random() * 2 - 1).toFixed(3),
        };
      }
      return {
        ...edge,
        coefficient: +(Math.random() * 2 - 1).toFixed(3),
      };
    });

    return model;
  };

  const [showCoefficients, setShowCoefficients] = useState(true);
  const [showDisturbanceTerms, setShowDisturbanceTerms] = useState(true);
  const [pathModel, setPathModel] = useState<PathModelType>(
    getRandomPathModel()
  );

  const [detail, setDetail] = useState("");

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

  return (
    <div className="dark gap-16 font-[family-name:var(--font-geist-sans)]">
      <header className="p-3 z-[999] flex items-center justify-between bg-zinc-900/90 backdrop-blur-md fixed top-0 w-full">
        <h1 className="">Path Analysis experiments</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setPathModel(getRandomPathModel())}
          >
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
                  checked={showDisturbanceTerms}
                  onCheckedChange={(v) => setShowDisturbanceTerms(v)}
                />
                <Label htmlFor="show-disturbance">Show disturbance terms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-coefficients"
                  checked={showCoefficients}
                  onCheckedChange={(v) => setShowCoefficients(v)}
                />
                <Label htmlFor="show-coefficients">
                  Show path coefficients
                </Label>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
      <div className="flex flex-col relative h-screen max-h-screen overflow-hidden">
        <div className="fixed bottom-4 left-4">
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
            "fixed min-h-16 top-24 right-4 text-xs w-64 p-2 bg-zinc-800/70 rounded-lg text-zinc-300 duration-200 transition-opacity",
            detail === "" ? "opacity-0" : "opacity-100"
          )}
        >
          {detail}
        </div>
        <PathModel
          pathModel={pathModel}
          showDisturbanceTerms={showDisturbanceTerms}
          showCoefficients={showCoefficients}
          onNodeClick={(node) => {
            if (node.type === "exogenous") {
              toast.error("No regression equation for exogenous variables");
              return;
            }
          }}
          onNodeHover={(node) => {
            if (node.type === "endogenous") {
              setDetail(getRegressionEquation(pathModel, node.id));
            }
          }}
          onNodeLeave={() => setDetail("")}
        />
      </div>
    </div>
  );
}
