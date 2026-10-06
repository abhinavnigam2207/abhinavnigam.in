import { useState, type FormEvent } from "react";
import { Sparkles, X, ArrowUp, ArrowUpRight, MessageCircle } from "lucide-react";
import { trpc } from "../../lib/trpc";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
};

const SUGGESTIONS = [
  "What has Abhinav worked on at Google?",
  "Tell me about his product engineering experience.",
  "What has he written about frontend architecture?",
  "Which measurable outcomes are in his CV?",
];

export function CopilotDrawer({ isOpen, onClose }: CopilotDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");

  const askMutation = trpc.assistant.ask.useMutation({
    onSuccess(result) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer, sources: result.sources },
      ]);
    },
    onError() {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't reach the source service just now. Please try again in a moment or feel free to email Abhinav directly at abhinavnigam2207@gmail.com.",
        },
      ]);
    },
  });

  if (!isOpen) return null;

  const submitQuestion = (q = inputVal) => {
    const trimmed = q.trim();
    if (!trimmed || askMutation.isPending) return;

    const prior = messages.slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInputVal("");
    askMutation.mutate({ question: trimmed, history: prior });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitQuestion();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-vscode-bg border-l border-vscode-border shadow-2xl flex flex-col font-mono text-xs select-text animate-slide-up">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-vscode-bg2 border-b border-vscode-border shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-vscode-purple animate-pulse" />
          <span className="font-semibold text-vscode-bright text-xs font-sans">
            Ask Abhinav Copilot
          </span>
          <span className="text-[10px] text-vscode-purple bg-vscode-purple/10 px-1.5 py-0.5 rounded border border-vscode-purple/20">
            RAG AI
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-vscode-dim hover:text-vscode-text hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
          title="Close Copilot"
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto thin-scroll p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-6 select-none space-y-3">
            <div className="w-12 h-12 rounded-xl bg-vscode-purple/10 text-vscode-purple flex items-center justify-center mx-auto border border-vscode-purple/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-vscode-bright text-sm m-0">
                Ask anything about Abhinav's work
              </h3>
              <p className="text-vscode-dim text-[11px] mt-1 max-w-xs mx-auto leading-relaxed">
                Answers are grounded directly in Abhinav's verified CV, Google engineering highlights, and published DEV.to articles.
              </p>
            </div>

            {/* Prompt Chips */}
            <div className="space-y-1.5 pt-2 text-left">
              <div className="text-[10px] font-semibold text-vscode-dim uppercase tracking-wider px-1">
                Suggested Questions
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submitQuestion(s)}
                  className="w-full text-left p-2.5 rounded-md bg-vscode-bg2 hover:bg-vscode-bg3 border border-vscode-border text-vscode-text hover:text-vscode-purple text-[11px] transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{s}</span>
                  <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 shrink-0 text-vscode-purple" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-lg leading-relaxed text-xs ${
                  m.role === "user"
                    ? "bg-vscode-blue2 text-white font-sans"
                    : "bg-vscode-bg2 border border-vscode-border text-vscode-text font-sans"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Sources list */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-vscode-border/50 text-[10px] font-mono space-y-1">
                    <span className="text-vscode-dim uppercase tracking-wider font-semibold">
                      Cited Sources:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-vscode-border text-vscode-blue2 hover:underline"
                        >
                          <span className="truncate max-w-[180px]">{src.title}</span>
                          <ArrowUpRight size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {askMutation.isPending && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-vscode-bg2 border border-vscode-border text-vscode-dim text-xs select-none">
            <span className="w-2 h-2 rounded-full bg-vscode-purple animate-ping" />
            <span>Consulting Abhinav's RAG knowledge base...</span>
          </div>
        )}
      </div>

      {/* Drawer Input Form */}
      <form onSubmit={onSubmit} className="p-3 bg-vscode-bg2 border-t border-vscode-border select-none">
        <div className="flex items-center gap-2 bg-vscode-bg border border-vscode-border rounded-md px-3 py-1.5 focus-within:border-vscode-purple transition-colors">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask a question about Abhinav's experience..."
            className="flex-1 bg-transparent border-0 outline-none text-vscode-text text-xs font-sans select-text caret-vscode-purple"
            disabled={askMutation.isPending}
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || askMutation.isPending}
            className="p-1 rounded-md bg-vscode-purple text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            title="Send"
          >
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="text-[10px] text-vscode-dim mt-1.5 text-center">
          Grounded in cited CV & publication excerpts with LangChain.
        </p>
      </form>
    </div>
  );
}
