import { ArrowUpRight, BookOpen, Facebook, Github, Instagram, Linkedin, Mail, MessageCircle, PenLine } from "lucide-react";
import { profile } from "@/content/site";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";

const links = [
  { title: "LinkedIn", detail: "Professional profile", href: profile.linkedin, icon: Linkedin },
  { title: "GitHub", detail: "Code and open-source work", href: profile.github, icon: Github },
  { title: "Ask Abhinav", detail: "A grounded assistant about my work", href: "/ask", icon: MessageCircle, local: true },
  { title: "Portfolio & experience", detail: "Selected work, career, and skills", href: "/?site=main", icon: ArrowUpRight, local: true },
  { title: "Writing on Medium", detail: "Articles and notes", href: profile.medium, icon: BookOpen },
  { title: "Writing on DEV.to", detail: "JavaScript, frontend architecture, and more", href: profile.devto, icon: PenLine },
  { title: "Work with me", detail: "For roles, referrals, or collaborations, start a conversation.", href: `mailto:${profile.email}`, icon: Mail },
  { title: "Google referral", detail: "Share a role you think might fit", href: "/google-refer", icon: ArrowUpRight, local: true },
  { title: "Instagram", detail: "Follow along", href: profile.instagram, icon: Instagram },
  { title: "Facebook", detail: "Connect socially", href: profile.facebook, icon: Facebook },
];

export default function KnowMe() {
  return (
    <SiteShell compact>
      <PageMeta {...pageMeta.knowMe} />
      <main className="wrap knowme-main">
        <section className="profile-card">
          <img className="avatar" src="/abhinav.jpg" alt="Abhinav Nigam" width="112" height="112" />
          <h1>{profile.name}</h1>
          <p className="profile-role">{profile.role} at {profile.company}</p>
          <p className="profile-bio">I build web products, platforms, and tools for teams — and share what I learn along the way.</p>
          <div className="profile-socials" aria-label="Social profiles">
            <a href={profile.github} aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={18} /></a>
            <a href={profile.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={18} /></a>
            <a href={profile.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <a href={profile.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={18} /></a>
            <a href={`mailto:${profile.email}`} aria-label="Email"><Mail size={18} /></a>
          </div>
        </section>
        <section className="bio-links" aria-label="All links">
          {links.map(item => {
            const Icon = item.icon;
            return <a className="bio-link" href={item.href} key={item.title} target={item.local || item.href.startsWith("mailto:") ? undefined : "_blank"} rel={item.local || item.href.startsWith("mailto:") ? undefined : "noreferrer"}>
              <span className="bio-link-icon"><Icon size={18} /></span>
              <span className="bio-link-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
              <ArrowUpRight className="bio-link-arrow" size={17} aria-hidden="true" />
            </a>;
          })}
        </section>
      </main>
    </SiteShell>
  );
}
