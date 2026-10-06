import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { experiences, featuredWork, profile, skillGroups } from "@/content/site";
import { Lens } from "@/components/site/Lens";
import { PageMeta, PillLink, SectionHeading, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";

const capabilities = [
  { line: "Web platforms", pill: "12+ years", detail: "Google Cloud SecOps · Observe.ai · Jio.com · Rapido" },
  { line: "Engineering teams", pill: "5–14 led", detail: "Google 5 · Observe.ai 8 · Rapido 14 · Reliance Jio 8" },
  { line: "Reliability", pill: "78% fewer flaky tests", detail: "Flaky tests cut from 14 to 3 per week" },
  { line: "Product impact", pill: "40% more rides per rider", detail: "Rejection 19% → 7% · First interactive 1.7s → 0.8s" },
];

// "Google" set in the brand's letter colours. Screen readers get the plain word.
const googleWord = (
  <span className="google-word" role="img" aria-label="Google">
    {["G", "o", "o", "g", "l", "e"].map((letter, index) => <span key={index} aria-hidden="true">{letter}</span>)}
  </span>
);

const roleLine = <p className="eyebrow"><span className="status-dot" /> Senior Software Engineer at {googleWord}</p>;

function WorkSlider() {
  const track = useRef<HTMLDivElement>(null);
  const resetTimer = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = featuredWork.length;

  const goTo = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index % count);
  };

  // Always slides right to left. A copy of the first card sits after the last one; once the copy is in view
  // the track jumps back to the real first card, which looks identical, so the loop never rewinds.
  // Stops while the pointer or keyboard focus is on the slider, in background tabs, and for reduced-motion users.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const el = track.current;
      if (!el || document.hidden) return;
      let position = Math.round(el.scrollLeft / el.clientWidth);
      if (position >= count) { el.scrollTo({ left: 0, behavior: "instant" }); position = 0; }
      goTo(position + 1);
      if (position + 1 === count) {
        window.clearTimeout(resetTimer.current);
        resetTimer.current = window.setTimeout(() => el.scrollTo({ left: 0, behavior: "instant" }), 900);
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, count]);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  return (
    <div className="work-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="slider-track" ref={track} onScroll={event => setActive(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth) % count)}>
        {[...featuredWork, featuredWork[0]].map((item, index) => (
          <article className="work-card" key={index} aria-hidden={index === count ? true : undefined}>
            <p className="work-count">0{(index % count) + 1} / 0{count}</p>
            <p className="work-result">{item.result}</p>
            <div className="work-caption">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span>{item.period}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="slider-dots" role="group" aria-label="Selected work">
        {featuredWork.map((item, index) => (
          <button type="button" key={item.title} className={index === active ? "is-active" : undefined} aria-label={`Show ${item.title}`} aria-pressed={index === active} onClick={() => goTo(index)} />
        ))}
      </div>
    </div>
  );
}

// Every few seconds two company names flip out, trade places and flip back in.
function EmployerGrid() {
  const [names, setNames] = useState(() => experiences.map(item => item.company));
  const [flipping, setFlipping] = useState<number[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = experiences.length;
    let swap = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const a = Math.floor(Math.random() * count);
      const b = (a + 1 + Math.floor(Math.random() * (count - 1))) % count;
      setFlipping([a, b]);
      // Swap while both names are edge-on, so the change is never seen.
      swap = window.setTimeout(() => {
        setNames(current => { const next = [...current]; [next[a], next[b]] = [next[b], next[a]]; return next; });
        setFlipping([]);
      }, 400);
    }, 3000);
    return () => { window.clearInterval(timer); window.clearTimeout(swap); };
  }, []);

  return (
    <ul className="employers">
      {names.map((name, index) => <li key={index}><span className={flipping.includes(index) ? "is-flipping" : undefined}>{name}</span></li>)}
    </ul>
  );
}

export default function Home() {
  return (
    <SiteShell>
      <PageMeta {...pageMeta.home} />
      <main>
        <Lens
          className="hero"
          id="home"
          back={<>
            <div className="header-inner"><span className="brand">Abhinav Nigam</span></div>
            <div className="wrap">
              {/* Same layout as the front, with an empty box where the photo sits, so the lines wrap identically. */}
              <div className="hero-head">
                <div>{roleLine}<p className="hero-title">I lead teams and<br />ship real outcomes.</p></div>
                <span className="hero-photo" />
              </div>
            </div>
          </>}
        >
          <div className="wrap">
            <div className="hero-head">
              <div>{roleLine}<h1 className="hero-title" data-lens>I engineer products,<br />platforms and teams.</h1></div>
              <img className="hero-photo" src="/abhinav.jpg" alt="Abhinav Nigam" width="400" height="400" />
            </div>
            <WorkSlider />
          </div>
        </Lens>

        <section className="content-section wrap" id="about">
          <h2 className="statement">From the interface to the systems behind it, I make complex things clearer.</h2>
          <div className="about-grid">
            <p>I'm Abhinav, an engineer with {profile.experience} building web products and platforms across security, mobility, and customer operations. I like problems where thoughtful engineering makes products easier to use and teams easier to move.</p>
            <p>My experience spans Google Cloud SecOps, contact-center products, mobility, financial applications, and consumer platforms. I've built shared UI foundations, delivered product features, improved reliability, and led engineering teams.</p>
          </div>
        </section>

        <section className="content-section wrap" aria-label="Companies I have worked at">
          <EmployerGrid />
        </section>

        <section className="content-section wrap" aria-label="Capabilities">
          <ul className="mega">
            {capabilities.map(item => <li key={item.line}>{item.line} <span className="pill">{item.pill}</span><span className="mega-back">{item.detail}</span></li>)}
          </ul>
        </section>

        <section className="content-section wrap" id="experience">
          <SectionHeading eyebrow="Experience" title="Where I've worked." />
          <div className="row-list">
            {experiences.map(item => (
              <article className="row" key={item.company}>
                <div className="row-meta">{item.dates}</div>
                <div className="row-body">
                  <h3>{item.company} <span>{item.role}</span></h3>
                  <p>{item.summary}</p>
                  <p className="outcome">{item.outcome}</p>
                  <p className="stack">{item.technologies.join(" · ")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section wrap" id="skills">
          <SectionHeading eyebrow="Skills" title="Tools of the trade." />
          <dl className="skill-grid">
            {skillGroups.map(group => (
              <div key={group.label}><dt>{group.label}</dt><dd>{group.items.join(", ")}</dd></div>
            ))}
          </dl>
        </section>

        <Lens
          className="contact"
          id="contact"
          back={<div className="wrap"><p className="statement">Tell me what you're building.<br />I'm listening.</p></div>}
        >
          <div className="wrap">
            <h2 className="statement" data-lens>Have a role or a good problem?<br />Let's talk.</h2>
            <PillLink href="/knowme">Get in touch</PillLink>
            <div className="contact-links">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a>
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
              <a href={profile.devto} target="_blank" rel="noreferrer">DEV.to <ArrowUpRight size={15} /></a>
              <a href={profile.medium} target="_blank" rel="noreferrer">Medium <ArrowUpRight size={15} /></a>
              <a href="/google-refer">Google referral <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </Lens>
      </main>
    </SiteShell>
  );
}
