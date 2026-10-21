export type Domain = "Healthcare" | "Education" | "Finance" | "E-commerce" | "Other";
export type Complexity = "Basic" | "Intermediate" | "Advanced";
export type GeneratorName = "template" | "gemini";
export type CapabilityStatus = "Implemented" | "Demo/Simulated" | "Planned";

export interface Section {
  key: string;
  title: string;
  content: string[];
}

export interface TechItem {
  name: string;
  category: string;
  purpose: string;
  status: "MVP" | "Proposed";
}

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
  auth: string;
}

export interface FieldDef {
  name: string;
  type: string;
  notes: string;
}

export interface EntityDef {
  name: string;
  purpose: string;
  fields: FieldDef[];
  relationships: string[];
}

export interface RiskItem {
  title: string;
  impact: string;
  mitigation: string;
}

export interface ArchNode {
  id: string;
  label: string;
  kind: string;
  implemented: boolean;
}

export interface ArchEdge {
  source: string;
  target: string;
  label: string | null;
  planned: boolean;
}

export interface Architecture {
  mermaid: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  implementedSummary: string;
  proposedSummary: string;
}

export interface ProjectMeta {
  generator: GeneratorName;
  model: string | null;
  llmConfigured: boolean;
  simulatedAgents: boolean;
  generatedAt: string;
  notes: string[];
}

export interface Project {
  id: string;
  title: string;
  idea: string;
  domain: Domain;
  complexity: Complexity;
  createdAt: string;
  updatedAt: string;
  status: "ready";
  summary: string;
  sections: Section[];
  techStack: TechItem[];
  apiEndpoints: ApiEndpoint[];
  databaseEntities: EntityDef[];
  risks: RiskItem[];
  nextSteps: string[];
  architecture: Architecture;
  meta: ProjectMeta;
}

export interface ProjectSummary {
  id: string;
  title: string;
  domain: Domain;
  complexity: Complexity;
  createdAt: string;
  sectionCount: number;
  generator: GeneratorName;
}

export interface ProjectList {
  items: ProjectSummary[];
  count: number;
}

export interface Health {
  status: "ok";
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  projects: number;
  generator: {
    default: string;
    active: string;
    llmConfigured: boolean;
  };
  storage: string;
}

export interface GenerateInput {
  title: string;
  idea: string;
  domain: Domain;
  complexity: Complexity;
}
