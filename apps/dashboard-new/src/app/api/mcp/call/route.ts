import { NextRequest, NextResponse } from "next/server";
import {
  handleAiRoute,
  handleCodeGenerate,
  handleCodeAnalyze,
  handleKnowledgeStore,
  handleKnowledgeQuery,
  handleWebSearch,
  handleSystemStatus,
} from "@/lib/mcp/handlers";

export async function POST(req: NextRequest) {
  try {
    const { tool, arguments: args } = await req.json();

    let result;
    switch (tool) {
      case "ai_route":
        result = await handleAiRoute(args);
        break;
      case "code_generate":
        result = await handleCodeGenerate(args);
        break;
      case "code_analyze":
        result = await handleCodeAnalyze(args);
        break;
      case "knowledge_store":
        result = await handleKnowledgeStore(args);
        break;
      case "knowledge_query":
        result = await handleKnowledgeQuery(args);
        break;
      case "web_search":
        result = await handleWebSearch(args);
        break;
      case "system_status":
        result = await handleSystemStatus();
        break;
      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
