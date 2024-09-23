import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChartScatter, Pi } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { toast } from "sonner";

export default function Toolbar() {
  const { selectedTool, setSelectedTool } = useStore();

  const tools = [
    {
      icon: <Pi />,
      tool: "equations",
      description: "Regression equations",
      instructions:
        "Click on an endogenous variable to show its regression equation",
    },
    {
      icon: <ChartScatter />,
      tool: "implied-correlations",
      description: "Implied correlations",
      instructions: "Select two variables to show their implied correlation",
    },
  ] as const;

  const handleSelectTool = (tool: string) => {
    setSelectedTool(tool as any);
    toast.info(tools.find((t) => t.tool === tool)?.instructions);
  };

  return (
    <aside className=" z-[999] bg-zinc-900 p-1 fixed left-4 top-24 rounded-lg border border-zinc-800 flex flex-col gap-3">
      <TooltipProvider delayDuration={300}>
        {tools.map((tool) => (
          <Tooltip key={tool.tool}>
            <TooltipTrigger asChild>
              <button
                className={cn("p-2 rounded-lg", {
                  "hover:bg-zinc-800": selectedTool !== tool.tool,
                  "bg-zinc-800": selectedTool === tool.tool,
                })}
                onClick={() => handleSelectTool(tool.tool)}
              >
                {tool.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{tool.description}</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </aside>
  );
}
