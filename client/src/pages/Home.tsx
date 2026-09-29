import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Phone } from "lucide-react";
import { blogPosts, experiences, featuredWork, profile, skillGroups } from "@/content/site";
import { PageMeta, SectionHeading, SiteShell } from "@/components/site/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      <PageMeta title="Abhinav Nigam — Senior Software Engineer" description="Abhinav Nigam is a Senior Software Engineer at Google with 12+ years of experience building web products, platforms, and reliable engineering teams." />
      <main>
        <section className="hero wrap" id="home">
          <p className="eyebrow"><span className="status-dot" /> Senior Software Engineer <span className="eyebrow-sep">/</span> Google</p>
          <h1>Building useful software.<br /><span>Making complex things clearer.</span></h1>
          <div className="hero-bottom">
            <p className="hero-copy">I'm Abhinav — an engineer with 12+ years building web products and platforms across security, mobility, and customer operations.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#experience">Explore my work <ArrowDown size={16} /></a>
              <a className="text-link" href={`mailto:${profile.email}`}>Get in touch <ArrowUpRight size={16} /></a>
            </div>
          </div>
          <div className="hero-rule" />
          <div className="quick-facts" aria-label="Highlights">
            <div><strong>12+</strong><span>years in software</span></div>
            <div><strong>5–14</strong><span>engineers led across teams</span></div>
            <div><strong>78%</strong><span>fewer flaky tests per week</span></div>
            <div><strong>40%</strong><span>more rides per rider in select cities</span></div>
          </div>
        </section>

        <section className="content-section wrap" id="about">
          <SectionHeading number="01" eyebrow="A little about me" title="Engineering across the stack." />
          <div className="about-grid">
            <p className="lead-copy">From the interface to the systems behind it, I like working on problems where thoughtful engineering makes products easier to use and teams easier to move.</p>
            <div className="about-detail">
              <p>My experience spans Google Cloud SecOps, contact-center products, mobility, financial applications, and consumer platforms. I’ve built shared UI foundations, delivered product features, improved reliability, and led engineering teams.</p>
              <a className="inline-link" href={profile.linkedin} target="_blank" rel="noreferrer">More about my work <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="content-section wrap" id="skills">
          <SectionHeading number="02" eyebrow="Tools of the trade" title="Skills & technologies" />
          <div className="skill-grid">
            {skillGroups.map(group => (
              <div className="skill-group" key={group.label}>
                <h3>{group.label}</h3>
                <div className="tag-list">{group.items.map(item => <span className="tag" key={item}>{item}</span>)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="content-section wrap" id="experience">
          <SectionHeading number="03" eyebrow="Where I've worked" title="Experience" />
          <div className="timeline">
            {experiences.map((item, index) => (
              <article className="timeline-item" key={item.company}>
                <div className="timeline-date">{item.dates}</div>
                <div className="timeline-body">
                  <div className="timeline-title"><h3>{item.company}</h3><span>{item.role}</span></div>
                  <p>{item.summary}</p>
                  <p className="outcome-copy">{item.outcome}</p>
                  <div className="tag-list compact-tags">{item.technologies.map(tag => <span className="tag" key={`${index}-${tag}`}>{tag}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section wrap" id="projects">
          <SectionHeading number="04" eyebrow="Selected work" title="A few problems I've worked on.">
            <a className="inline-link" href="/blog">Read my writing <ArrowUpRight size={15} /></a>
          </SectionHeading>
          <div className="work-list">
            {featuredWork.map((item, index) => (
              <article className="work-card" key={item.title}>
                <div className="work-index">0{index + 1}</div>
                <div className="work-main">
                  <div className="work-title-row"><h3>{item.title}</h3><span className="muted-meta">{item.period}</span></div>
                  <p>{item.description}</p>
                  <div className="tag-list compact-tags">{item.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
                </div>
                <div className="work-result"><span>Outcome</span><strong>{item.result}</strong></div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section wrap education-section">
          <SectionHeading number="05" eyebrow="Education" title="Grounded in fundamentals." />
          <div className="education-row"><strong>B.Tech, Computer Science</strong><span>Guru Gobind Singh Indraprastha University</span><span>2009 — 2013</span></div>
        </section>

        <section className="contact-band" id="contact">
          <div className="wrap contact-inner">
            <div><p className="eyebrow">Have a role or a good problem?</p><h2>Let’s talk.</h2><p className="contact-copy">For roles, referrals, or a thoughtful conversation about engineering.</p></div>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}><Mail size={17} /> {profile.email} <ArrowUpRight size={15} /></a>
              <a href={`tel:${profile.phone.replaceAll("-", "")}`}><Phone size={17} /> {profile.phone}</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn <ArrowUpRight size={15} /></a>
              <a href={profile.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub <ArrowUpRight size={15} /></a>
              <a href="/google-refer">Refer me to Google <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>
        <section className="writing-teaser wrap">
          <div><p className="eyebrow">From the notebook</p><h2>Writing on the web.</h2></div>
          <div className="teaser-posts">{blogPosts.slice(0, 2).map(post => <a href={post.url} key={post.url} target="_blank" rel="noreferrer"><span>{post.date}</span><strong>{post.title}</strong><ArrowUpRight size={15} /></a>)}<a className="all-writing" href="/blog">All writing <ArrowUpRight size={15} /></a></div>
        </section>
      </main>
    </SiteShell>
  );
}
