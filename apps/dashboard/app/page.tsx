import Link from "next/link";
import { Zap, Bot, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(255,11.11%,7.06%)] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(255,11.11%,7.06%)]/80 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold">NeXify AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Preise
            </a>
            <a
              href="#about"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Über uns
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Anmelden
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-medium px-4 py-2 rounded-full text-sm hover:opacity-90 transition"
            >
              <Zap className="h-4 w-4" />
              Jetzt starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Dein persönlicher AI-Assistent
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Intelligenz die{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                arbeitet
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              NeXify AI versteht deine Anforderungen, führt komplexe Aufgaben
              aus und lernt kontinuierlich dazu. Programmierung, Recherche,
              Analyse - alles aus einer Hand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition"
              >
                <Zap className="h-5 w-5" />
                Kostenlos starten
              </Link>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 border border-white/20 text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/5 transition"
              >
                Mehr erfahren
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div id="features" className="mt-32 grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Autonomer Assistent
              </h3>
              <p className="text-gray-400">
                Führt komplexe Aufgaben selbstständig aus, plant mehrstufige
                Prozesse und lernt aus jeder Interaktion.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sicher & Privat</h3>
              <p className="text-gray-400">
                Ende-zu-Ende-Verschlüsselung, lokale Verarbeitung wo möglich,
                und volle Kontrolle über deine Daten.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-emerald-500/50 transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Neueste Modelle</h3>
              <p className="text-gray-400">
                Zugriff auf GPT-4o, Claude 3.5 und weitere führende KI-Modelle
                für beste Ergebnisse.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Bereit durchzustarten?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Keine Kreditkarte erforderlich. Starte jetzt und erlebe die
              Zukunft der KI-Assistenz.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-semibold px-8 py-4 rounded-full text-lg hover:opacity-90 transition"
            >
              <Zap className="h-5 w-5" />
              Jetzt starten
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold">NeXify AI</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 NeXify AI. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}
