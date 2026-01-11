/**
 * NeXify AI - Plane PM API Client
 * REST API Integration for Project Management
 */

const API_URL = process.env.PLANE_API_URL || "https://pm.nexify-automate.com";
const API_KEY = process.env.PLANE_API_KEY || "";

// Types
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  workspace: string;
  lead?: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  name: string;
  description?: string;
  description_html?: string;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  state: string;
  assignees: string[];
  labels: string[];
  project: string;
}

// API Client Class
class PlaneClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(url?: string, key?: string) {
    this.baseUrl = url || API_URL;
    this.apiKey = key || API_KEY;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Plane API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return this.request("workspaces");
  }

  // Projects
  async getProjects(workspaceSlug: string): Promise<Project[]> {
    return this.request(`workspaces/${workspaceSlug}/projects`);
  }

  async getProject(workspaceSlug: string, projectId: string): Promise<Project> {
    return this.request(`workspaces/${workspaceSlug}/projects/${projectId}`);
  }

  async createProject(
    workspaceSlug: string,
    data: Partial<Project>,
  ): Promise<Project> {
    return this.request(`workspaces/${workspaceSlug}/projects`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Issues
  async getIssues(workspaceSlug: string, projectId: string): Promise<Issue[]> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/issues`,
    );
  }

  async getIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
  ): Promise<Issue> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
    );
  }

  async createIssue(
    workspaceSlug: string,
    projectId: string,
    data: Partial<Issue>,
  ): Promise<Issue> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/issues`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  async updateIssue(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<Issue>,
  ): Promise<Issue> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  }

  // States
  async getStates(workspaceSlug: string, projectId: string): Promise<State[]> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/states`,
    );
  }

  // Cycles (Sprints)
  async getCycles(workspaceSlug: string, projectId: string): Promise<Cycle[]> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/cycles`,
    );
  }

  async createCycle(
    workspaceSlug: string,
    projectId: string,
    data: Partial<Cycle>,
  ): Promise<Cycle> {
    return this.request(
      `workspaces/${workspaceSlug}/projects/${projectId}/cycles`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  }

  // Dashboard Stats
  async getProjectStats(
    workspaceSlug: string,
    projectId: string,
  ): Promise<{
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    backlogIssues: number;
  }> {
    const [issues, states] = await Promise.all([
      this.getIssues(workspaceSlug, projectId),
      this.getStates(workspaceSlug, projectId),
    ]);

    const stateGroups = new Map(states.map((s) => [s.id, s.group]));
    let completed = 0,
      inProgress = 0,
      backlog = 0;

    for (const issue of issues) {
      const group = stateGroups.get(issue.state);
      if (group === "completed") completed++;
      else if (group === "started") inProgress++;
      else if (group === "backlog" || group === "unstarted") backlog++;
    }

    return {
      totalIssues: issues.length,
      completedIssues: completed,
      inProgressIssues: inProgress,
      backlogIssues: backlog,
    };
  }
}

// Singleton
let planeClient: PlaneClient | null = null;

export function getPlaneClient(): PlaneClient {
  if (!planeClient) {
    planeClient = new PlaneClient();
  }
  return planeClient;
}

export default PlaneClient;

export interface State {
  id: string;
  name: string;
  color: string;
  group: "backlog" | "unstarted" | "started" | "completed" | "cancelled";
  sequence: number;
}

export interface Cycle {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  project: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  lead?: string;
  start_date?: string;
  target_date?: string;
  project: string;
}
