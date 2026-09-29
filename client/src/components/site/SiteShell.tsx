import { ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { profile } from "@/content/site";
import { useEffect } from "react";

const navItems = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Writing", href: "/blog" },
  { label: "Ideologies", href: "/ideologies" },
  { label: "Ask", href: "/ask" },
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

export function SiteShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  const [path] = useLocation();
  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="header-inner">
          <Link href={compact ? "/?site=main" : "/"} className="brand" aria-label="Abhinav Nigam, home">
            <img src="/brandmark.png" alt="" width="38" height="38" />
            <span>Abhinav Nigam<span className="brand-period">.</span></span>
          </Link>
          {!compact && (
            <nav className="main-nav" aria-label="Main navigation">
              {navItems.map(item => <a key={item.label} href={item.href} className={path === item.href ? "nav-active" : undefined}>{item.label}</a>)}
            </nav>
          )}
          <Link href="/google-refer" className="header-cta">Refer me <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} Abhinav Nigam</span>
          <span className="footer-note">Built with care. Kept simple.</span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </footer>
    </div>
  );
}

export function SectionHeading({ number, eyebrow, title, children }: { number?: string; eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div className="section-kicker">{number && <span className="section-number">{number}</span>}{eyebrow && <span>{eyebrow}</span>}</div>
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
