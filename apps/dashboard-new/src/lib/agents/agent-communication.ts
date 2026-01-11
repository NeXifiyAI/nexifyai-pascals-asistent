/**
 * ============================================================
 * NEXIFY AI - AGENT COMMUNICATION SYSTEM
 * Inter-Agent Messaging via Supabase Realtime
 * ============================================================
 */

import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from "@supabase/supabase-js";

// ============================================================
// TYPES
// ============================================================

export type AgentType =
  | "orchestrator" // Main coordinator
  | "coder" // Code Agent
  | "deployer" // Deployment Agent
  | "designer" // Design Agent
  | "content" // Content Agent
  | "seo" // SEO Agent
  | "legal" // Legal Agent
  | "support" // Support Agent
  | "tester"; // Testing Agent

export interface AgentMessage {
  id?: string;
  from_agent: AgentType;
  to_agent: AgentType | "broadcast";
  message_type: "task" | "result" | "error" | "status" | "request" | "response";
  subject: string;
  content: string;
  data?: Record<string, unknown>;
  task_id?: string;
  priority: "urgent" | "high" | "normal" | "low";
  requires_response: boolean;
  response_to?: string;
  created_at?: string;
  read_at?: string;
}

export interface AgentStatus {
  agent_type: AgentType;
  status: "idle" | "busy" | "offline" | "error";
  current_task?: string;
  tasks_completed: number;
  last_heartbeat: string;
  capabilities: string[];
}

// ============================================================
// SUPABASE SCHEMA ADDITION (run in SQL Editor)
// ============================================================
/*
-- Agent Messages Table
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  message_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  task_id UUID REFERENCES task_queue(id),
  priority TEXT NOT NULL DEFAULT 'normal',
  requires_response BOOLEAN DEFAULT FALSE,
  response_to UUID REFERENCES agent_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_messages_to ON agent_messages(to_agent);
CREATE INDEX idx_agent_messages_unread ON agent_messages(to_agent, read_at) WHERE read_at IS NULL;

-- Agent Status Table
CREATE TABLE IF NOT EXISTS agent_status (
  agent_type TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline',
  current_task TEXT,
  tasks_completed INT DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  capabilities TEXT[] DEFAULT '{}'
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE agent_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
*/

// ============================================================
// AGENT COMMUNICATION CLASS
// ============================================================

export class AgentCommunicator {
  private supabase: SupabaseClient;
  private agentType: AgentType;
  private channel: RealtimeChannel | null = null;
  private messageHandlers: Map<string, (msg: AgentMessage) => Promise<void>> =
    new Map();

  constructor(agentType: AgentType) {
    this.agentType = agentType;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  async initialize(): Promise<void> {
    // Register agent status
    await this.updateStatus("idle");

    // Subscribe to messages for this agent
    this.channel = this.supabase
      .channel(`agent_${this.agentType}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
          filter: `to_agent=eq.${this.agentType}`,
        },
        async (payload) => {
          await this.handleIncomingMessage(payload.new as AgentMessage);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
          filter: "to_agent=eq.broadcast",
        },
        async (payload) => {
          await this.handleIncomingMessage(payload.new as AgentMessage);
        },
      )
      .subscribe();

    // Start heartbeat
    this.startHeartbeat();

    console.log(`[${this.agentType}] Agent initialized and listening`);
  }

  // ============================================================
  // MESSAGING
  // ============================================================

  async sendMessage(
    to: AgentType | "broadcast",
    subject: string,
    content: string,
    options: Partial<AgentMessage> = {},
  ): Promise<string | null> {
    const message: Omit<AgentMessage, "id" | "created_at"> = {
      from_agent: this.agentType,
      to_agent: to,
      message_type: options.message_type || "task",
      subject,
      content,
      data: options.data,
      task_id: options.task_id,
      priority: options.priority || "normal",
      requires_response: options.requires_response || false,
      response_to: options.response_to,
    };

    const { data, error } = await this.supabase
      .from("agent_messages")
      .insert(message)
      .select("id")
      .single();

    if (error) {
      console.error(`[${this.agentType}] Failed to send message:`, error);
      return null;
    }

    console.log(`[${this.agentType}] Sent to ${to}: ${subject}`);
    return data.id;
  }

  async sendTaskToAgent(
    to: AgentType,
    taskName: string,
    taskData: Record<string, unknown>,
    taskId?: string,
  ): Promise<string | null> {
    return this.sendMessage(to, `Task: ${taskName}`, JSON.stringify(taskData), {
      message_type: "task",
      data: taskData,
      task_id: taskId,
      priority: "high",
      requires_response: true,
    });
  }

  async sendResult(
    to: AgentType,
    originalMessageId: string,
    result: Record<string, unknown>,
  ): Promise<string | null> {
    return this.sendMessage(to, "Task Result", JSON.stringify(result), {
      message_type: "result",
      data: result,
      response_to: originalMessageId,
    });
  }

  async sendError(
    to: AgentType,
    error: string,
    details?: Record<string, unknown>,
  ): Promise<string | null> {
    return this.sendMessage(to, "Error", error, {
      message_type: "error",
      data: details,
      priority: "urgent",
    });
  }

  async broadcast(subject: string, content: string): Promise<string | null> {
    return this.sendMessage("broadcast", subject, content, {
      message_type: "status",
    });
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  onMessage(
    messageType: string,
    handler: (msg: AgentMessage) => Promise<void>,
  ): void {
    this.messageHandlers.set(messageType, handler);
  }

  private async handleIncomingMessage(message: AgentMessage): Promise<void> {
    console.log(
      `[${this.agentType}] Received from ${message.from_agent}: ${message.subject}`,
    );

    // Mark as read
    await this.supabase
      .from("agent_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", message.id);

    // Find handler
    const handler = this.messageHandlers.get(message.message_type);
    if (handler) {
      try {
        await handler(message);
      } catch (err) {
        console.error(`[${this.agentType}] Handler error:`, err);
        if (message.requires_response) {
          await this.sendError(message.from_agent, String(err));
        }
      }
    } else {
      console.warn(
        `[${this.agentType}] No handler for message type: ${message.message_type}`,
      );
    }
  }

  // ============================================================
  // STATUS MANAGEMENT
  // ============================================================

  async updateStatus(
    status: AgentStatus["status"],
    currentTask?: string,
  ): Promise<void> {
    await this.supabase.from("agent_status").upsert({
      agent_type: this.agentType,
      status,
      current_task: currentTask || null,
      last_heartbeat: new Date().toISOString(),
    });
  }

  async incrementTasksCompleted(): Promise<void> {
    await this.supabase.rpc("increment_agent_tasks", {
      p_agent_type: this.agentType,
    });
  }

  async getAgentStatus(agent: AgentType): Promise<AgentStatus | null> {
    const { data } = await this.supabase
      .from("agent_status")
      .select("*")
      .eq("agent_type", agent)
      .single();

    return data as AgentStatus | null;
  }

  async getAllAgentStatuses(): Promise<AgentStatus[]> {
    const { data } = await this.supabase
      .from("agent_status")
      .select("*")
      .order("agent_type");

    return (data as AgentStatus[]) || [];
  }

  private startHeartbeat(): void {
    setInterval(async () => {
      await this.supabase
        .from("agent_status")
        .update({ last_heartbeat: new Date().toISOString() })
        .eq("agent_type", this.agentType);
    }, 30000); // Every 30 seconds
  }

  // ============================================================
  // INBOX
  // ============================================================

  async getUnreadMessages(): Promise<AgentMessage[]> {
    const { data } = await this.supabase
      .from("agent_messages")
      .select("*")
      .or(`to_agent.eq.${this.agentType},to_agent.eq.broadcast`)
      .is("read_at", null)
      .order("created_at", { ascending: true });

    return (data as AgentMessage[]) || [];
  }

  async getMessageHistory(limit = 50): Promise<AgentMessage[]> {
    const { data } = await this.supabase
      .from("agent_messages")
      .select("*")
      .or(
        `to_agent.eq.${this.agentType},from_agent.eq.${this.agentType},to_agent.eq.broadcast`,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    return (data as AgentMessage[]) || [];
  }

  // ============================================================
  // REQUEST/RESPONSE PATTERN
  // ============================================================

  async requestFromAgent<T>(
    agent: AgentType,
    request: string,
    data?: Record<string, unknown>,
    timeoutMs = 60000,
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const messageId = await this.sendMessage(agent, request, request, {
        message_type: "request",
        data,
        requires_response: true,
      });

      if (!messageId) {
        reject(new Error("Failed to send request"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Request to ${agent} timed out`));
      }, timeoutMs);

      // Listen for response
      const checkResponse = async () => {
        const { data: response } = await this.supabase
          .from("agent_messages")
          .select("*")
          .eq("response_to", messageId)
          .single();

        if (response) {
          clearTimeout(timeout);
          resolve(response.data as T);
        } else {
          setTimeout(checkResponse, 1000);
        }
      };

      checkResponse();
    });
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  async shutdown(): Promise<void> {
    await this.updateStatus("offline");
    if (this.channel) {
      await this.channel.unsubscribe();
    }
    console.log(`[${this.agentType}] Agent shut down`);
  }
}

// ============================================================
// ORCHESTRATOR - MAIN COORDINATOR
// ============================================================

export class OrchestratorAgent extends AgentCommunicator {
  constructor() {
    super("orchestrator");
  }

  async initialize(): Promise<void> {
    await super.initialize();

    // Handle task results from agents
    this.onMessage("result", async (msg) => {
      console.log(`[Orchestrator] Task result from ${msg.from_agent}`);
      // Update task in queue
      if (msg.task_id) {
        await this.supabase.rpc("complete_task", {
          p_task_id: msg.task_id,
          p_output: msg.data,
        });
      }
      // Check for next task
      await this.dispatchNextTask();
    });

    // Handle errors
    this.onMessage("error", async (msg) => {
      console.error(
        `[Orchestrator] Error from ${msg.from_agent}: ${msg.content}`,
      );
      if (msg.task_id) {
        await this.supabase.rpc("fail_task", {
          p_task_id: msg.task_id,
          p_error: msg.content,
        });
      }
    });

    // Handle status updates
    this.onMessage("status", async (msg) => {
      console.log(
        `[Orchestrator] Status from ${msg.from_agent}: ${msg.subject}`,
      );
    });
  }

  async dispatchNextTask(): Promise<void> {
    const { data: task } = await this.supabase.rpc("get_next_task", {
      p_agent_type: null,
    });

    if (!task) {
      console.log("[Orchestrator] No pending tasks");
      return;
    }

    const agentType = task.agent_type || this.inferAgentType(task.type);
    const agentStatus = await this.getAgentStatus(agentType as AgentType);

    if (agentStatus?.status === "idle") {
      await this.sendTaskToAgent(
        agentType as AgentType,
        task.name,
        {
          ...task.input_data,
          task_id: task.id,
          description: task.description,
        },
        task.id,
      );
    } else {
      console.log(`[Orchestrator] Agent ${agentType} is busy, waiting...`);
      // Re-queue for later
      setTimeout(() => this.dispatchNextTask(), 10000);
    }
  }

  private inferAgentType(taskType: string): AgentType {
    const mapping: Record<string, AgentType> = {
      feature: "coder",
      bug_fix: "coder",
      code_review: "coder",
      deployment: "deployer",
      infrastructure: "deployer",
      setup: "deployer",
      design: "designer",
      automation: "deployer",
      testing: "tester",
      documentation: "content",
    };
    return mapping[taskType] || "coder";
  }

  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  async startAutonomousMode(): Promise<void> {
    console.log("[Orchestrator] Starting autonomous mode...");
    await this.broadcast(
      "System Online",
      "Orchestrator starting autonomous task processing",
    );

    // Initial dispatch
    await this.dispatchNextTask();

    // Poll for new tasks every 30 seconds
    setInterval(async () => {
      const statuses = await this.getAllAgentStatuses();
      const idleAgents = statuses.filter((s) => s.status === "idle");

      if (idleAgents.length > 0) {
        await this.dispatchNextTask();
      }
    }, 30000);
  }
}

// ============================================================
// CODER AGENT
// ============================================================

export class CoderAgent extends AgentCommunicator {
  constructor() {
    super("coder");
  }

  async initialize(): Promise<void> {
    await super.initialize();

    this.onMessage("task", async (msg) => {
      await this.updateStatus("busy", msg.subject);

      try {
        const result = await this.processTask(
          msg.data as Record<string, unknown>,
        );
        await this.sendResult("orchestrator", msg.id!, result);
        await this.incrementTasksCompleted();
      } catch (err) {
        await this.sendError("orchestrator", String(err), {
          task: msg.subject,
        });
      } finally {
        await this.updateStatus("idle");
      }
    });
  }

  private async processTask(
    taskData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // This is where the actual coding logic would go
    // For now, we'll simulate task processing
    console.log(`[Coder] Processing task:`, taskData);

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return {
      success: true,
      files_created: taskData.file ? [taskData.file] : [],
      message: `Task completed: ${taskData.description || "Unknown task"}`,
    };
  }
}

// ============================================================
// DEPLOYER AGENT
// ============================================================

export class DeployerAgent extends AgentCommunicator {
  constructor() {
    super("deployer");
  }

  async initialize(): Promise<void> {
    await super.initialize();

    this.onMessage("task", async (msg) => {
      await this.updateStatus("busy", msg.subject);

      try {
        const result = await this.processDeployment(
          msg.data as Record<string, unknown>,
        );
        await this.sendResult("orchestrator", msg.id!, result);
        await this.incrementTasksCompleted();
      } catch (err) {
        await this.sendError("orchestrator", String(err), {
          task: msg.subject,
        });
      } finally {
        await this.updateStatus("idle");
      }
    });
  }

  private async processDeployment(
    taskData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    console.log(`[Deployer] Processing deployment:`, taskData);

    // Simulate deployment
    await new Promise((resolve) => setTimeout(resolve, 10000));

    return {
      success: true,
      deployed_to: taskData.domain || taskData.host,
      message: `Deployment completed`,
    };
  }
}

// ============================================================
// FACTORY & STARTUP
// ============================================================

export function createAgent(type: AgentType): AgentCommunicator {
  switch (type) {
    case "orchestrator":
      return new OrchestratorAgent();
    case "coder":
      return new CoderAgent();
    case "deployer":
      return new DeployerAgent();
    default:
      return new AgentCommunicator(type);
  }
}

// Start all agents for autonomous operation
export async function startAllAgents(): Promise<void> {
  const orchestrator = new OrchestratorAgent();
  const coder = new CoderAgent();
  const deployer = new DeployerAgent();

  await Promise.all([
    orchestrator.initialize(),
    coder.initialize(),
    deployer.initialize(),
  ]);

  // Start autonomous mode
  await (orchestrator as OrchestratorAgent).startAutonomousMode();

  console.log("=".repeat(60));
  console.log("NEXIFY AI - AUTONOMOUS MODE ACTIVE");
  console.log("=".repeat(60));
  console.log("Agents online: orchestrator, coder, deployer");
  console.log("Tasks will be processed automatically.");
  console.log("=".repeat(60));
}
