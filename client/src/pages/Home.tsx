import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { blogPosts, experiences, featuredWork, profile, skillGroups } from "@/content/site";
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
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  return (
    <div className="work-slider">
      <div className="slider-dots" role="group" aria-label="Selected work">
        {featuredWork.map((item, index) => (
          <button type="button" key={item.title} className={index === active ? "is-active" : undefined} aria-label={`Show ${item.title}`} aria-pressed={index === active} onClick={() => goTo(index)} />
        ))}
      </div>
      <div className="slider-track" ref={track} onScroll={event => setActive(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}>
        {featuredWork.map((item, index) => (
          <article className="work-card" key={item.title}>
            <p className="work-count">0{index + 1} / 0{featuredWork.length}</p>
            <p className="work-result">{item.result}</p>
            <div className="work-caption">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span>{item.period}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
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
            <div className="wrap">{roleLine}<p className="hero-title">I lead engineers,<br />ship outcomes and scale.</p></div>
          </>}
        >
          <div className="wrap">
            {roleLine}
            <h1 className="hero-title" data-lens>I engineer products,<br />platforms and teams.</h1>
            <WorkSlider />
          </div>
        </Lens>

        <section className="content-section wrap" id="about">
          <div className="about-head">
            <h2 className="statement">From the interface to the systems behind it, I make complex things clearer.</h2>
            <img className="portrait" src="/abhinav.jpg" alt="Abhinav Nigam" width="400" height="400" loading="lazy" />
          </div>
          <div className="about-grid">
            <p>I'm Abhinav, an engineer with {profile.experience} building web products and platforms across security, mobility, and customer operations. I like problems where thoughtful engineering makes products easier to use and teams easier to move.</p>
            <p>My experience spans Google Cloud SecOps, contact-center products, mobility, financial applications, and consumer platforms. I've built shared UI foundations, delivered product features, improved reliability, and led engineering teams.</p>
          </div>
        </section>

        <section className="content-section wrap" aria-label="Capabilities">
          <ul className="mega">
            {capabilities.map(item => <li key={item.line}>{item.line} <span className="pill">{item.pill}</span><span className="mega-back">{item.detail}</span></li>)}
          </ul>
          <div className="center"><PillLink href="#experience">View experience</PillLink></div>
        </section>

        <section className="content-section wrap" aria-label="Companies I have worked at">
          <ul className="employers">
            {experiences.map(item => <li key={item.company}>{item.company}</li>)}
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

        <section className="content-section wrap" id="writing">
          <SectionHeading eyebrow="Writing" title="Notes from building for the web.">
            <a className="text-link" href="/blog">All writing <ArrowUpRight size={15} /></a>
          </SectionHeading>
          <div className="link-list">
            {blogPosts.map(post => (
              <a href={post.url} key={post.url} target="_blank" rel="noreferrer">
                <span>{post.date}</span><strong>{post.title}</strong><ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        </section>

        <Lens
          className="contact"
          id="contact"
          back={<div className="wrap"><p className="statement">Tell me what you're building.<br />I'm listening.</p></div>}
        >
          <div className="wrap">
            <h2 className="statement" data-lens>Have a role or a good problem?<br />Let's talk.</h2>
            <PillLink href={`mailto:${profile.email}`}>Get in touch</PillLink>
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
