"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconKey, IconCheck, IconCopy } from "@tabler/icons-react";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    qdrant_url: "",
    qdrant_key: "",
    tavily: "",
    github: "",
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    qdrant_key: false,
    tavily: false,
    github: false,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("nexify_api_keys");
      if (stored) {
        try {
          setApiKeys(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored API keys", e);
        }
      }
    }
  }, []);

  const handleSave = async () => {
    localStorage.setItem("nexify_api_keys", JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalte deine API Keys und Integrationen
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconKey className="h-5 w-5" />
            <CardTitle>API Keys</CardTitle>
          </div>
          <CardDescription>
            Konfiguriere externe Service-Integrationen für deinen AI-Assistenten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI */}
          <div className="space-y-2">
            <Label htmlFor="openai">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="openai"
                type={showKeys.openai ? "text" : "password"}
                value={apiKeys.openai}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, openai: e.target.value })
                }
                placeholder="sk-proj-..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setShowKeys({ ...showKeys, openai: !showKeys.openai })
                }
              >
                {showKeys.openai ? "🙈" : "👁️"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKeys.openai)}
                disabled={!apiKeys.openai}
              >
                <IconCopy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Für GPT-4o, Code Generation, Embeddings
            </p>
          </div>

          {/* Qdrant */}
          <div className="space-y-2">
            <Label htmlFor="qdrant_url">Qdrant URL</Label>
            <Input
              id="qdrant_url"
              value={apiKeys.qdrant_url}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, qdrant_url: e.target.value })
              }
              placeholder="https://xxx.gcp.cloud.qdrant.io"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qdrant_key">Qdrant API Key</Label>
            <div className="flex gap-2">
              <Input
                id="qdrant_key"
                type={showKeys.qdrant_key ? "text" : "password"}
                value={apiKeys.qdrant_key}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, qdrant_key: e.target.value })
                }
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setShowKeys({ ...showKeys, qdrant_key: !showKeys.qdrant_key })
                }
              >
                {showKeys.qdrant_key ? "🙈" : "👁️"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKeys.qdrant_key)}
                disabled={!apiKeys.qdrant_key}
              >
                <IconCopy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Vector Database für Brain Memory
            </p>
          </div>

          {/* Tavily (Web Search) */}
          <div className="space-y-2">
            <Label htmlFor="tavily">Tavily API Key (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tavily"
                type={showKeys.tavily ? "text" : "password"}
                value={apiKeys.tavily}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, tavily: e.target.value })
                }
                placeholder="tvly-..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setShowKeys({ ...showKeys, tavily: !showKeys.tavily })
                }
              >
                {showKeys.tavily ? "🙈" : "👁️"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Für Web-Recherche und aktuelle Informationen
            </p>
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">
              GitHub Personal Access Token (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="github"
                type={showKeys.github ? "text" : "password"}
                value={apiKeys.github}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, github: e.target.value })
                }
                placeholder="ghp_..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setShowKeys({ ...showKeys, github: !showKeys.github })
                }
              >
                {showKeys.github ? "🙈" : "👁️"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Für Repository-Zugriff und Code-Management
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              {saved ? "Gespeichert!" : "Speichern"}
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Konfiguration</CardTitle>
          <CardDescription>
            Überprüfe welche Services aktiv sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>OpenAI</span>
              <span
                className={apiKeys.openai ? "text-green-600" : "text-gray-400"}
              >
                {apiKeys.openai ? "✓ Konfiguriert" : "○ Nicht konfiguriert"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Qdrant</span>
              <span
                className={
                  apiKeys.qdrant_url && apiKeys.qdrant_key
                    ? "text-green-600"
                    : "text-gray-400"
                }
              >
                {apiKeys.qdrant_url && apiKeys.qdrant_key
                  ? "✓ Konfiguriert"
                  : "○ Nicht konfiguriert"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tavily (Web Search)</span>
              <span
                className={apiKeys.tavily ? "text-green-600" : "text-gray-400"}
              >
                {apiKeys.tavily ? "✓ Konfiguriert" : "○ Optional"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>GitHub</span>
              <span
                className={apiKeys.github ? "text-green-600" : "text-gray-400"}
              >
                {apiKeys.github ? "✓ Konfiguriert" : "○ Optional"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
