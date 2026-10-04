import { ArrowUpRight, ArrowUp, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { trpc } from "@/lib/trpc";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
};

const prompts = [
  "What has Abhinav worked on at Google?",
  "Which measurable outcomes are in his CV?",
  "When would you pick micro-frontends?",
  "Give me a sci-fi riddle.",
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
      <PageMeta {...pageMeta.ask} />
      <main className="ask-page">
        <section className={`ask-content ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="ask-welcome">
              <img className="avatar" src="/abhinav.jpg" alt="Abhinav Nigam" width="72" height="72" />
              <h1>Ask <em>Abhinav</em></h1>
              <p className="ask-subtitle">Chat about my work, engineering, or sci-fi, or play a quick game. Facts about me come from my CV and public writing.</p>
            </div>
          ) : (
            <div className="message-list" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <article className={`chat-message ${message.role === "user" ? "from-user" : "from-assistant"}`} key={`${index}-${message.role}`}>
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
          <form className="ask-form" onSubmit={event => submit(event)}>
            <label className="sr-only" htmlFor="ask-input">Ask Abhinav a question</label>
            <Search size={18} aria-hidden="true" />
            <textarea id="ask-input" rows={1} maxLength={700} placeholder="Ask about work, tech or sci-fi" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} disabled={ask.isPending} />
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || ask.isPending}><ArrowUp size={17} /></button>
          </form>
          {messages.length === 0 && <div className="prompt-grid" aria-label="Suggested questions">{prompts.map(prompt => <button type="button" key={prompt} onClick={() => submit(undefined, prompt)}>{prompt}</button>)}</div>}
          <p className="ask-disclaimer">An AI assistant answering from a small, cited source set. If a detail isn't in those sources, it should say so.</p>
        </section>
      </main>
    </SiteShell>
  );
}
