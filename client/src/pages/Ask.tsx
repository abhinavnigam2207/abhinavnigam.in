import { ArrowUpRight, ArrowUp, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
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

// Applies a layout-changing update inside a view transition, so the photo, title and input glide between the
// welcome layout and the chat layout (see the view-transition rules in minimal.css). Browsers without the API,
// and visitors who prefer reduced motion, get the change at once.
function withTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (callback: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const transition = doc.startViewTransition(() => flushSync(update));
  // The browser skips the animation when the tab is hidden; the update still applies, so the rejection is harmless.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}

export default function AskAbhinav() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const ask = trpc.assistant.ask.useMutation();
  const chatting = messages.length > 0;
  // Bumped when the chat is closed, so a reply still in flight is not added to the next chat.
  const session = useRef(0);
  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatting) listEnd.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [chatting, messages.length, ask.isPending]);

  const submit = (event?: FormEvent, question = draft) => {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || ask.isPending) return;
    const prior = messages.slice(-6).map(message => ({ role: message.role, content: message.content }));
    const addQuestion = () => {
      setMessages(previous => [...previous, { role: "user", content: trimmed }]);
      setDraft("");
    };
    if (chatting) addQuestion(); else withTransition(addQuestion);

    const startedIn = session.current;
    const reply = (message: ChatMessage) => { if (session.current === startedIn) setMessages(previous => [...previous, message]); };
    ask.mutate({ question: trimmed, history: prior }, {
      onSuccess: result => reply({ role: "assistant", content: result.answer, sources: result.sources }),
      onError: () => reply({ role: "assistant", content: "I couldn't reach the source service just now. Please try again in a moment." }),
    });
  };

  const closeChat = () => {
    session.current += 1;
    ask.reset();
    withTransition(() => { setMessages([]); setDraft(""); });
  };

  return (
    <SiteShell compact portfolioLink={false}>
      <PageMeta {...pageMeta.ask} />
      <main className="ask-page">
        {chatting && (
          <div className="ask-chip">
            <img className="ask-chip-avatar" src="/abhinav.jpg" alt="" width="32" height="32" />
            <h1>Ask <em>Abhinav</em></h1>
            <button type="button" onClick={closeChat} aria-label="Close chat"><X size={16} aria-hidden="true" /><span>Close chat</span></button>
          </div>
        )}
        <section className={`ask-content ${chatting ? "has-messages" : ""}`}>
          {chatting ? (
            <div className="message-list" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => (
                <article className={`chat-message ${message.role === "user" ? "from-user" : "from-assistant"}`} key={`${index}-${message.role}`}>
                  <div className="message-content">
                    <p>{message.content}</p>
                    {message.sources && message.sources.length > 0 && <div className="answer-sources"><span>Sources</span>{message.sources.map(source => <a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noreferrer" : undefined} key={source.title}>{source.title}<ArrowUpRight size={12} /></a>)}</div>}
                  </div>
                </article>
              ))}
              {ask.isPending && <div className="thinking-line" role="status" aria-label="Thinking"><span /><span /><span /></div>}
              <div ref={listEnd} />
            </div>
          ) : (
            <div className="ask-welcome">
              <img className="avatar" src="/abhinav.jpg" alt="Abhinav Nigam" width="72" height="72" />
              <h1>Ask <em>Abhinav</em></h1>
              <p className="ask-subtitle">Chat about my work, engineering, or sci-fi, or play a quick game. Facts about me come from my CV and public writing.</p>
            </div>
          )}
          <form className="ask-form" onSubmit={event => submit(event)}>
            <label className="sr-only" htmlFor="ask-input">Ask Abhinav a question</label>
            <Search size={18} aria-hidden="true" />
            <textarea id="ask-input" rows={1} maxLength={700} placeholder="Ask about work, tech or sci-fi" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} disabled={ask.isPending} />
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || ask.isPending}><ArrowUp size={17} /></button>
          </form>
          {!chatting && <div className="prompt-grid" aria-label="Suggested questions">{prompts.map(prompt => <button type="button" key={prompt} onClick={() => submit(undefined, prompt)}>{prompt}</button>)}</div>}
          <p className="ask-disclaimer">An AI assistant answering from a small, cited source set. If a detail isn't in those sources, it should say so.</p>
        </section>
      </main>
    </SiteShell>
  );
}
