'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{ name: string; result?: any }>;
}

interface Tool {
  name: string;
  description: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [conversations, setConversations] = useState<Array<{id: string; title: string; date: string}>>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hallo! Ich bin dein NeXify AI Assistent. Ich kann dir bei Programmierung, Recherche, Analysen und vielem mehr helfen. Was kann ich für dich tun?',
      timestamp: new Date()
    }]);

    fetchTools();
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/mcp/tools');
      const data = await res.json();
      setTools(data.tools || []);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    }
  };

  const loadConversations = () => {
    const saved = localStorage.getItem('nexify-conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  };

  const saveConversation = (msgs: Message[]) => {
    const id = activeConversation || Date.now().toString();
    const title = msgs[1]?.content.slice(0, 30) + '...' || 'Neue Unterhaltung';
    const updated = [
      { id, title, date: new Date().toLocaleDateString('de-DE') },
      ...conversations.filter(c => c.id !== id)
    ].slice(0, 20);
    setConversations(updated);
    setActiveConversation(id);
    localStorage.setItem('nexify-conversations', JSON.stringify(updated));
    localStorage.setItem(`nexify-chat-${id}`, JSON.stringify(msgs));
  };

  const loadConversation = (id: string) => {
    const saved = localStorage.getItem(`nexify-chat-${id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
      setActiveConversation(id);
    }
  };

  const newChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hallo! Ich bin dein NeXify AI Assistent. Was kann ich für dich tun?',
      timestamp: new Date()
    }]);
    setActiveConversation(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          tools: tools.map(t => t.name)
        })
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.error || 'Entschuldigung, es gab einen Fehler.',
        timestamp: new Date(),
        toolCalls: data.toolCalls
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Verbindungsfehler. Bitte versuche es erneut.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      {/* Sidebar */}
      <aside className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 bg-[#12121a] border-r border-[#1e1e2e] flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">NeXify AI</h1>
              <p className="text-xs text-gray-500">Pascals Assistent</p>
            </div>
          </div>
          
          <button 
            onClick={newChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neuer Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Verlauf</p>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg hover:bg-[#1e1e2e] transition-colors ${
                activeConversation === conv.id ? 'bg-[#1e1e2e] border border-purple-500/30' : ''
              }`}
            >
              <p className="text-sm truncate">{conv.title}</p>
              <p className="text-xs text-gray-500">{conv.date}</p>
            </button>
          ))}
        </div>

        {/* Tools Section */}
        <div className="p-4 border-t border-[#1e1e2e]">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Verfügbare Tools ({tools.length})</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {tools.slice(0, 8).map(tool => (
              <div key={tool.name} className="flex items-center gap-2 text-xs text-gray-400 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                {tool.name}
              </div>
            ))}
            {tools.length > 8 && (
              <p className="text-xs text-purple-400">+{tools.length - 8} weitere</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-[#1e1e2e] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-[#1e1e2e] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="font-semibold">NeXify AI Chat</h2>
              <p className="text-xs text-gray-500">Autonomer Assistent mit {tools.length} Tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                      : 'bg-[#1e1e2e]'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-purple-400 mb-2">Verwendete Tools:</p>
                        {message.toolCalls.map((tc, i) => (
                          <span key={i} className="inline-block text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded mr-1 mb-1">
                            {tc.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right mr-12' : 'ml-12'}`}>
                  {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="bg-[#1e1e2e] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#1e1e2e]">
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-[#1e1e2e] rounded-2xl border border-[#2e2e3e] focus-within:border-purple-500/50 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben... (Enter zum Senden, Shift+Enter für neue Zeile)"
                rows={1}
                className="w-full bg-transparent px-4 py-4 pr-24 resize-none focus:outline-none max-h-40"
                style={{ minHeight: '56px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3">
            NeXify AI kann Fehler machen. Prüfe wichtige Informationen.
          </p>
        </div>
      </main>
    </div>
  );
}
