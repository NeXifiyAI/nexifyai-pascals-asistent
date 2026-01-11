/**
 * ============================================================
 * NEXIFY AI - TWENTY CRM CLIENT
 * REST/GraphQL API Integration
 * ============================================================
 */

// ============================================================
// CONFIG
// ============================================================

const TWENTY_API_URL = process.env.TWENTY_API_URL || "https://api.twenty.com";
const TWENTY_API_KEY = process.env.TWENTY_API_KEY || "";

// ============================================================
// TYPES
// ============================================================

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  companyId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  domainName?: string;
  address?: string;
  employees?: number;
  linkedinUrl?: string;
  annualRecurringRevenue?: number;
  idealCustomerProfile?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  amount?: number;
  closeDate?: string;
  stage: "NEW" | "SCREENING" | "MEETING" | "PROPOSAL" | "CUSTOMER" | "LOST";
  probability?: number;
  companyId?: string;
  personId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  body?: string;
  dueAt?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: string;
  companyId?: string;
  personId?: string;
  opportunityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title?: string;
  body: string;
  companyId?: string;
  personId?: string;
  opportunityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface CreatePersonInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  companyId?: string;
}

export interface CreateCompanyInput {
  name: string;
  domainName?: string;
  address?: string;
  employees?: number;
  linkedinUrl?: string;
}

export interface CreateOpportunityInput {
  name: string;
  amount?: number;
  closeDate?: string;
  stage?: Opportunity["stage"];
  companyId?: string;
  personId?: string;
}

// ============================================================
// API CLIENT
// ============================================================

class TwentyCRMClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || TWENTY_API_URL;
    this.apiKey = apiKey || TWENTY_API_KEY;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/rest/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twenty API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ============================================================
  // PEOPLE
  // ============================================================

  async getPeople(limit = 50): Promise<PaginatedResponse<Person>> {
    return this.request<PaginatedResponse<Person>>(`people?limit=${limit}`);
  }

  async getPerson(id: string): Promise<Person> {
    return this.request<Person>(`people/${id}`);
  }

  async createPerson(data: CreatePersonInput): Promise<Person> {
    return this.request<Person>("people", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePerson(
    id: string,
    data: Partial<CreatePersonInput>,
  ): Promise<Person> {
    return this.request<Person>(`people/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deletePerson(id: string): Promise<void> {
    await this.request(`people/${id}`, { method: "DELETE" });
  }

  async searchPeople(query: string): Promise<Person[]> {
    const result = await this.request<PaginatedResponse<Person>>(
      `people?filter[or][0][firstName][ilike]=%${query}%&filter[or][1][lastName][ilike]=%${query}%&filter[or][2][email][ilike]=%${query}%`,
    );
    return result.data;
  }

  // ============================================================
  // COMPANIES
  // ============================================================

  async getCompanies(limit = 50): Promise<PaginatedResponse<Company>> {
    return this.request<PaginatedResponse<Company>>(`companies?limit=${limit}`);
  }

  async getCompany(id: string): Promise<Company> {
    return this.request<Company>(`companies/${id}`);
  }

  async createCompany(data: CreateCompanyInput): Promise<Company> {
    return this.request<Company>("companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompany(
    id: string,
    data: Partial<CreateCompanyInput>,
  ): Promise<Company> {
    return this.request<Company>(`companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: string): Promise<void> {
    await this.request(`companies/${id}`, { method: "DELETE" });
  }

  // ============================================================
  // OPPORTUNITIES
  // ============================================================

  async getOpportunities(limit = 50): Promise<PaginatedResponse<Opportunity>> {
    return this.request<PaginatedResponse<Opportunity>>(
      `opportunities?limit=${limit}`,
    );
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`opportunities/${id}`);
  }

  async createOpportunity(data: CreateOpportunityInput): Promise<Opportunity> {
    return this.request<Opportunity>("opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOpportunity(
    id: string,
    data: Partial<CreateOpportunityInput>,
  ): Promise<Opportunity> {
    return this.request<Opportunity>(`opportunities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateOpportunityStage(
    id: string,
    stage: Opportunity["stage"],
  ): Promise<Opportunity> {
    return this.updateOpportunity(id, { stage });
  }

  // ============================================================
  // TASKS
  // ============================================================

  async getTasks(limit = 50): Promise<PaginatedResponse<Task>> {
    return this.request<PaginatedResponse<Task>>(`tasks?limit=${limit}`);
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    return this.request<Task>("tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.request<Task>(`tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async completeTask(id: string): Promise<Task> {
    return this.updateTask(id, { status: "DONE" });
  }

  // ============================================================
  // NOTES
  // ============================================================

  async getNotes(limit = 50): Promise<PaginatedResponse<Note>> {
    return this.request<PaginatedResponse<Note>>(`notes?limit=${limit}`);
  }

  async createNote(data: Partial<Note>): Promise<Note> {
    return this.request<Note>("notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  async getDashboardStats(): Promise<{
    totalContacts: number;
    totalCompanies: number;
    totalDeals: number;
    openDeals: number;
    pipelineValue: number;
  }> {
    const [people, companies, opportunities] = await Promise.all([
      this.getPeople(1000),
      this.getCompanies(1000),
      this.getOpportunities(1000),
    ]);

    const openDeals = opportunities.data.filter(
      (o) => !["CUSTOMER", "LOST"].includes(o.stage),
    );
    const pipelineValue = openDeals.reduce(
      (sum, o) => sum + (o.amount || 0),
      0,
    );

    return {
      totalContacts: people.totalCount,
      totalCompanies: companies.totalCount,
      totalDeals: opportunities.totalCount,
      openDeals: openDeals.length,
      pipelineValue,
    };
  }
}

// ============================================================
// SINGLETON
// ============================================================

let crmClient: TwentyCRMClient | null = null;

export function getCRMClient(): TwentyCRMClient {
  if (!crmClient) {
    crmClient = new TwentyCRMClient();
  }
  return crmClient;
}

// ============================================================
// EXPORTS
// ============================================================

export default TwentyCRMClient;
export { TwentyCRMClient };
