import { PathModelType } from "@/app/types";

export const MODELS: PathModelType[] = [
  {
    nodes: [
      { id: "X1", label: "X1", x: 200, y: 150 },
      { id: "X2", label: "X2", x: 400, y: 150 },
      { id: "X3", label: "X3", x: 400, y: 350 },
      { id: "X4", label: "X4", x: 600, y: 350 },
      { id: "X5", label: "X5", x: 700, y: 150 },
    ],
    edges: [
      { source: "X1", target: "X2", coefficient: -1, isUnknownEffect: false },
      { source: "X2", target: "X5", coefficient: -1, isUnknownEffect: false },
      { source: "X3", target: "X1", coefficient: -1, isUnknownEffect: false },
      { source: "X3", target: "X2", coefficient: -1, isUnknownEffect: false },
      { source: "X4", target: "X3", coefficient: -1, isUnknownEffect: false },
      { source: "X4", target: "X5", coefficient: -1, isUnknownEffect: false },
    ],
  },
  {
    nodes: [
      { id: "X1", label: "X1", x: 100, y: 150 },
      { id: "X2", label: "X2", x: 300, y: 150 }, // 200px apart
      { id: "X3", label: "X3", x: 300, y: 350 }, // 200px apart
      { id: "X4", label: "X4", x: 500, y: 350 }, // 200px apart
      { id: "X5", label: "X5", x: 500, y: 550 }, // 200px apart
      { id: "X6", label: "X6", x: 700, y: 550 }, // 200px apart
      { id: "X7", label: "X7", x: 700, y: 150 }, // 200px apart
    ],
    edges: [
      { source: "X1", target: "X2", coefficient: -1, isUnknownEffect: false },
      { source: "X2", target: "X4", coefficient: -1, isUnknownEffect: false },
      { source: "X1", target: "X3", coefficient: -1, isUnknownEffect: false },
      { source: "X3", target: "X4", coefficient: -1, isUnknownEffect: false },
      { source: "X4", target: "X5", coefficient: -1, isUnknownEffect: false },
      { source: "X5", target: "X6", coefficient: -1, isUnknownEffect: false },
      { source: "X6", target: "X7", coefficient: -1, isUnknownEffect: false },
    ],
  },
  {
    nodes: [
      { id: "X1", label: "X1", x: 300, y: 150 },
      { id: "X2", label: "X2", x: 500, y: 150 }, // 200px apart
      { id: "X3", label: "X3", x: 300, y: 350 }, // 200px apart
      { id: "X4", label: "X4", x: 500, y: 350 }, // 200px apart
      { id: "X5", label: "X5", x: 700, y: 150 }, // 200px apart
      { id: "X6", label: "X6", x: 700, y: 350 }, // 200px apart
    ],
    edges: [
      { source: "X1", target: "X2", coefficient: -1, isUnknownEffect: false },
      { source: "X1", target: "X3", coefficient: -1, isUnknownEffect: false },
      { source: "X2", target: "X4", coefficient: -1, isUnknownEffect: false },
      { source: "X3", target: "X4", coefficient: -1, isUnknownEffect: false },
      { source: "X4", target: "X5", coefficient: -1, isUnknownEffect: false },
      { source: "X5", target: "X6", coefficient: -1, isUnknownEffect: false },
    ],
  },
  {
    nodes: [
      { id: "X1", label: "X1", x: 300, y: 350 },
      { id: "X2", label: "X2", x: 500, y: 350 },
      { id: "X3", label: "X3", x: 700, y: 350 },
      { id: "X4", label: "X4", x: 500, y: 150 },
    ],
    edges: [
      {
        source: "X1",
        target: "X2",
        coefficient: -1,
        isUnknownEffect: false,
      },
      {
        source: "X2",
        target: "X3",
        coefficient: -1,
        isUnknownEffect: false,
      },
      {
        source: "X1",
        target: "X4",
        coefficient: -1,
        isUnknownEffect: false,
      },
      {
        source: "X2",
        target: "X4",
        coefficient: -1,
        isUnknownEffect: false,
      },
      { source: "X3", target: "X4", coefficient: -1, isUnknownEffect: true },
    ],
  },
];
