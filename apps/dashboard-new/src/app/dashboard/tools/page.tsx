import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconTool,
  IconCode,
  IconSearch,
  IconBrain,
  IconRobot,
  IconWorld,
} from "@tabler/icons-react";

const tools = [
  {
    name: "ai_route",
    description: "Route task to best AI model",
    status: "active",
    icon: IconRobot,
  },
  {
    name: "code_generate",
    description: "Generate code in any language",
    status: "active",
    icon: IconCode,
  },
  {
    name: "code_analyze",
    description: "Analyze code for issues",
    status: "active",
    icon: IconCode,
  },
  {
    name: "knowledge_store",
    description: "Store in Qdrant + Memory",
    status: "active",
    icon: IconBrain,
  },
  {
    name: "knowledge_query",
    description: "Query from Qdrant",
    status: "active",
    icon: IconSearch,
  },
  {
    name: "web_search",
    description: "Search the web",
    status: "stub",
    icon: IconWorld,
  },
];

export default function ToolsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground">
          MCP Tools und Fähigkeiten die mir zur Verfügung stehen
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <tool.icon className="h-4 w-4" />
                {tool.name}
              </CardTitle>
              <Badge
                variant={tool.status === "active" ? "default" : "secondary"}
              >
                {tool.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTool className="h-5 w-5" />
            Tool Integration
          </CardTitle>
          <CardDescription>
            Diese Tools werden automatisch in Chat-Konversationen verfügbar
            gemacht.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tool-Calling via Vercel AI SDK wird hier konfiguriert...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
