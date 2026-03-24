
import { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react";

interface TerminalProps {
  onClose?: () => void;
}

export function Terminal({ onClose }: TerminalProps) {
  const [history, setHistory] = useState<string[]>([
    "Technical Event Review Management System [Version 1.0.0]",
    "(c) 2026 Admin Portal. All rights reserved.",
    "",
    "Type 'help' for available commands.",
  ]);
  const [input, setInput] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `> ${input}`];

    switch (cmd) {
      case "help":
        newHistory.push(
          "Available commands:",
          "  help     - Show this help message",
          "  clear    - Clear terminal history",
          "  status   - Check system status",
          "  teams    - List current active teams",
          "  db       - Database connection info",
          "  version  - Show system version",
          "  exit     - Close terminal"
        );
        break;
      case "clear":
        setHistory([]);
        setInput("");
        return;
      case "status":
        newHistory.push(
          "System Status: ONLINE",
          "Database: CONNECTED (MongoDB)",
          "API Server: RUNNING",
          "Active Sessions: 12"
        );
        break;
      case "teams":
        newHistory.push(
          "Active Teams:",
          "  TM001 - Team Alpha (Selected: P001)",
          "  TM002 - Team Beta (Selected: P002)",
          "  TM003 - Team Gamma (Selected: P003)"
        );
        break;
      case "db":
        newHistory.push(
          "Database Configuration:",
          "  Database: mongodb_event_review",
          "  Host: cluster0.mongodb.net",
          "  Connection Limit: 100",
          "  SSL: Enabled"
        );
        break;
      case "version":
        newHistory.push("v1.0.0-stable (build 20260225)");
        break;
      case "exit":
        if (onClose) onClose();
        break;
      default:
        newHistory.push(`Command not found: ${cmd}. Type 'help' for assistance.`);
    }

    setHistory(newHistory);
    setInput("");
  };

  return (
    <div
      className={`fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl transition-all duration-300 z-50 flex flex-col font-mono text-sm overflow-hidden ${
        isMaximized 
          ? "w-[90vw] h-[80vh] bottom-[5vh] right-[5vw]" 
          : "w-[500px] h-[350px]"
      }`}
    >
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-gray-300 font-semibold">Admin Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-slate-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto text-cyan-400/90 custom-scrollbar bg-slate-950"
      >
        {history.map((line, i) => (
          <div key={i} className="mb-1 whitespace-pre-wrap leading-relaxed">
            {line}
          </div>
        ))}
        
        <form onSubmit={handleCommand} className="flex items-center gap-2 mt-2">
          <span className="text-white font-bold">{">"}</span>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white focus:ring-0 p-0"
            placeholder="Type command..."
          />
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #020617;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}
