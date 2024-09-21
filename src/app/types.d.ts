export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface NodeProcessed extends Node {
  type: "endogenous" | "exogenous";
}

export interface Edge {
  source: string;
  target: string;
  coefficient: number;
  isUnknownEffect: boolean;
}

export interface PathModelType {
  nodes: Node[];
  edges: Edge[];
}
