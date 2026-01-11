/**
 * NeXify AI - Invoice Ninja API Client
 * REST API Integration for Invoicing
 */

const API_URL =
  process.env.INVOICE_NINJA_URL || "https://invoicing.nexify-automate.com";
const API_TOKEN = process.env.INVOICE_NINJA_TOKEN || "";

// Types
export interface Client {
  id: string;
  name: string;
  display_name: string;
  balance: number;
  paid_to_date: number;
  contacts: Contact[];
  address1?: string;
  city?: string;
  country_id?: string;
  vat_number?: string;
  created_at: number;
  updated_at: number;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_primary: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  client_id: string;
  status_id: string;
  amount: number;
  balance: number;
  discount: number;
  date: string;
  due_date: string;
  line_items: LineItem[];
  public_notes?: string;
  private_notes?: string;
  created_at: number;
  updated_at: number;
}

export interface LineItem {
  product_key: string;
  notes: string;
  cost: number;
  quantity: number;
  tax_name1?: string;
  tax_rate1?: number;
  line_total: number;
}

export interface Product {
  id: string;
  product_key: string;
  notes: string;
  cost: number;
  price: number;
  quantity: number;
  tax_name1?: string;
  tax_rate1?: number;
}

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  date: string;
  transaction_reference?: string;
  invoices: { invoice_id: string; amount: number }[];
}

// API Client Class
class InvoiceNinjaClient {
  private baseUrl: string;
  private token: string;

  constructor(url?: string, token?: string) {
    this.baseUrl = url || API_URL;
    this.token = token || API_TOKEN;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Api-Token": this.token,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Invoice Ninja API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Clients
  async getClients(): Promise<{ data: Client[] }> {
    return this.request("clients");
  }

  async getClient(id: string): Promise<{ data: Client }> {
    return this.request(`clients/${id}`);
  }

  async createClient(data: Partial<Client>): Promise<{ data: Client }> {
    return this.request("clients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Invoices
  async getInvoices(): Promise<{ data: Invoice[] }> {
    return this.request("invoices");
  }

  async getInvoice(id: string): Promise<{ data: Invoice }> {
    return this.request(`invoices/${id}`);
  }

  async createInvoice(data: {
    client_id: string;
    line_items: Partial<LineItem>[];
    date?: string;
    due_date?: string;
  }): Promise<{ data: Invoice }> {
    return this.request("invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendInvoice(id: string): Promise<{ data: Invoice }> {
    return this.request(`invoices/${id}/email`, { method: "POST" });
  }

  async markInvoicePaid(id: string): Promise<{ data: Invoice }> {
    return this.request(`invoices/${id}/mark_paid`, { method: "POST" });
  }

  // Products
  async getProducts(): Promise<{ data: Product[] }> {
    return this.request("products");
  }

  async createProduct(data: Partial<Product>): Promise<{ data: Product }> {
    return this.request("products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments(): Promise<{ data: Payment[] }> {
    return this.request("payments");
  }

  async createPayment(data: Partial<Payment>): Promise<{ data: Payment }> {
    return this.request("payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    outstandingBalance: number;
    invoiceCount: number;
    clientCount: number;
  }> {
    const [invoices, clients] = await Promise.all([
      this.getInvoices(),
      this.getClients(),
    ]);

    const totalRevenue = invoices.data.reduce(
      (s, i) => s + i.amount - i.balance,
      0,
    );
    const outstandingBalance = invoices.data.reduce((s, i) => s + i.balance, 0);

    return {
      totalRevenue,
      outstandingBalance,
      invoiceCount: invoices.data.length,
      clientCount: clients.data.length,
    };
  }
}

// Singleton
let invoiceClient: InvoiceNinjaClient | null = null;

export function getInvoiceClient(): InvoiceNinjaClient {
  if (!invoiceClient) {
    invoiceClient = new InvoiceNinjaClient();
  }
  return invoiceClient;
}

export default InvoiceNinjaClient;
