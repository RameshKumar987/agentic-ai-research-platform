import type { GenerateInput, Health, Project, ProjectList } from "./types";

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const TIMEOUT_MS = 25_000;

export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly fields: ApiFieldError[];
  readonly status: number;

  constructor(message: string, code = "NETWORK_ERROR", status = 0, fields: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fields = fields;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const error = payload?.error;
      if (error) {
        throw new ApiError(
          error.message ?? "The request could not be completed.",
          error.code ?? "REQUEST_FAILED",
          response.status,
          error.fields ?? [],
        );
      }
      const detail = payload?.detail;
      throw new ApiError(
        typeof detail === "string" ? detail : "The request could not be completed.",
        "REQUEST_FAILED",
        response.status,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Is the backend running?", "TIMEOUT");
    }
    throw new ApiError(
      "Could not reach the API. Start the FastAPI backend on port 8000 and try again.",
      "NETWORK_ERROR",
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function getHealth(): Promise<Health> {
  return request<Health>("/api/health");
}

export function listProjects(): Promise<ProjectList> {
  return request<ProjectList>("/api/projects");
}

export function getProject(projectId: string): Promise<Project> {
  return request<Project>(`/api/projects/${encodeURIComponent(projectId)}`);
}

export function generateResearch(input: GenerateInput): Promise<Project> {
  return request<Project>("/api/research/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
