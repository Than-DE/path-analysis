import { PathModelType } from "@/app/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MODELS } from "./models";
import { ReactNode } from "react";

type Options = {
  showDisturbanceTerms: boolean;
  showCoefficients: boolean;
};

type Tools = "equations" | "implied-correlations";

type Store = {
  options: Options;
  pathModel: PathModelType;
  selectedTool: Tools;
  toolDetail: ReactNode;
  selectedNodes: string[];
};

type Actions = {
  setOption: (key: keyof Options, value: boolean) => void;
  setPathModel: () => void;
  setSelectedTool: (tool: Tools) => void;
  setToolDetail: (detail: ReactNode) => void;
  setSelectedNodes: (nodes: string[]) => void;
};

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

export const useStore = create<Store & Actions>()(
  persist(
    (set) => ({
      pathModel: getRandomPathModel(),
      options: {
        showDisturbanceTerms: true,
        showCoefficients: true,
      },
      selectedTool: "equations",
      toolDetail: null,
      selectedNodes: [],
      setOption: (key, value) =>
        set((state) => ({
          options: {
            ...state.options,
            [key]: value,
          },
        })),
      setPathModel: () =>
        set({
          pathModel: getRandomPathModel(),
          toolDetail: null,
          selectedNodes: [],
        }),
      setSelectedTool: (tool) =>
        set({ selectedTool: tool, toolDetail: null, selectedNodes: [] }),
      setToolDetail: (detail) => set({ toolDetail: detail }),
      setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),
    }),
    {
      name: "app-store",
      storage: undefined,
    }
  )
);
