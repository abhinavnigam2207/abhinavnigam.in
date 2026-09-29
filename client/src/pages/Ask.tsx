import { ArrowUpRight, ArrowUp, MessageCircle, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { trpc } from "@/lib/trpc";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
};

const prompts = [
  "What has Abhinav worked on at Google?",
  "Tell me about his product engineering experience.",
  "What has he written about frontend architecture?",
  "Which measurable outcomes are in his CV?",
];

export default function AskAbhinav() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [requestError, setRequestError] = useState("");
  const ask = trpc.assistant.ask.useMutation({
    onSuccess(result) {
      setMessages(previous => [...previous, { role: "assistant", content: result.answer, sources: result.sources }]);
      setRequestError("");
    },
    onError() {
      setMessages(previous => [...previous, { role: "assistant", content: "I couldn't reach the source service just now. Please try again in a moment." }]);
      setRequestError("");
    },
  });

  const submit = (event?: FormEvent, question = draft) => {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || ask.isPending) return;
    const prior = messages.slice(-6).map(message => ({ role: message.role, content: message.content }));
    setMessages(previous => [...previous, { role: "user", content: trimmed }]);
    setDraft("");
    setRequestError("");
    ask.mutate({ question: trimmed, history: prior });
  };

  return (
    <SiteShell compact>
      <PageMeta title="Ask Abhinav" description="Ask about Abhinav Nigam's experience, skills, and writing. Answers are grounded in cited CV and article sources." />
      <main className="ask-page">
        <div className="ask-topline"><span className="ask-mark"><MessageCircle size={15} /></span><span>Ask Abhinav</span><span className="ask-powered">Grounded in work & writing</span></div>
        <section className={`ask-content ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="ask-welcome">
              <img src="/brandmark.png" alt="" width="54" height="54" />
              <p className="eyebrow">A small window into my work</p>
              <h1>What would you like to know?</h1>
              <p className="ask-subtitle">Ask about my experience, engineering, or articles. Answers use sources from my CV and public writing.</p>
            </div>
          ) : (
            <div className="message-list" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <article className={`chat-message ${message.role === "user" ? "from-user" : "from-assistant"}`} key={`${index}-${message.role}`}>
                  {message.role === "assistant" && <span className="assistant-avatar"><Sparkles size={14} /></span>}
                  <div className="message-content">
                    <p>{message.content}</p>
                    {message.sources && message.sources.length > 0 && <div className="answer-sources"><span>Sources</span>{message.sources.map(source => <a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noreferrer" : undefined} key={source.title}>{source.title}<ArrowUpRight size={12} /></a>)}</div>}
                  </div>
                </article>
              ))}
              {ask.isPending && <div className="thinking-line" role="status"><span className="thinking-dots" /> Looking through the notes…</div>}
            </div>
          )}
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          {messages.length === 0 && <div className="prompt-grid" aria-label="Suggested questions">{prompts.map(prompt => <button type="button" key={prompt} onClick={() => submit(undefined, prompt)}>{prompt}<ArrowUpRight size={14} /></button>)}</div>}
          <form className="ask-form" onSubmit={event => submit(event)}>
            <label className="sr-only" htmlFor="ask-input">Ask Abhinav a question</label>
            <textarea id="ask-input" rows={1} maxLength={700} placeholder="Ask anything about my work…" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} disabled={ask.isPending} />
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || ask.isPending}><ArrowUp size={17} /></button>
          </form>
          <p className="ask-disclaimer">Answers are generated from a small, cited source set. If a detail isn’t in those sources, the assistant should say so.</p>
        </section>
        <div className="ask-bottom"><a href="/?site=main">← Back to portfolio</a><span>ask.abhinavnigam.in</span></div>
      </main>
    </SiteShell>
  );
}
