import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { profile } from "@/content/site";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Experience", href: "/#experience" },
  { label: "Writing", href: "/blog" },
  { label: "Ideologies", href: "/ideologies" },
  { label: "Ask", href: "/ask" },
  { label: "Referral", href: "/google-refer" },
];

export function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.content = title;
    let ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.content = description;
  }, [title, description]);
  return null;
}

export function SiteShell({ children, compact = false, portfolioLink = true }: { children: React.ReactNode; compact?: boolean; portfolioLink?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // The back-to-top button appears once the visitor is 40% of the way down the page.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(scrollable > 0 && window.scrollY / scrollable >= 0.4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="header-inner">
          <Link href={compact ? "/?site=main" : "/"} className="brand" aria-label="Abhinav Nigam, home">
            Abhinav Nigam
          </Link>
        </div>
      </header>
      {/* Outside the header so it stacks above the open menu. */}
      {compact
        ? portfolioLink && <a href="/?site=main" className="menu-button">Portfolio <ArrowUpRight size={16} aria-hidden="true" /></a>
        : (
          <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(open => !open)}>
            {menuOpen ? "Close" : "Menu"}
            <span className={`menu-icon ${menuOpen ? "is-open" : ""}`} aria-hidden="true" />
          </button>
        )}
      {!compact && (
        <nav id="site-menu" className={`site-menu ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation" hidden={!menuOpen}>
          {navItems.map(item => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <p><a href={`mailto:${profile.email}`}>{profile.email}</a></p>
        </nav>
      )}
      {children}
      <button type="button" className={`to-top ${scrolled ? "is-visible" : ""}`} aria-label="Scroll to top" tabIndex={scrolled ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <ArrowUp size={18} aria-hidden="true" />
      </button>
      <footer className="site-footer">
        <div className="footer-inner">
          <nav className="footer-nav" aria-label="Footer">
            {navItems.map(item => <a key={item.label} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} Abhinav Nigam</span>
            <span>Personal site. Views are my own, not my employer's.</span>
            <span className="footer-links">
              <a href="/bucket-list">Bucket list</a>
              <a href="/knowme">All links</a>
              <a href="/ide">IDE mode</a>
              <a href={`mailto:${profile.email}`}>Email</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ number, eyebrow, title, children }: { number?: string; eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{number && <span className="section-number">{number}</span>}{eyebrow}</p>
      <div className="section-title-row"><h2>{title}</h2>{children && <div className="section-aside">{children}</div>}</div>
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="intro-copy">{children}</div>
    </section>
  );
}

export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="button" href={href}>{children} <ArrowRight size={17} aria-hidden="true" /></a>;
}
