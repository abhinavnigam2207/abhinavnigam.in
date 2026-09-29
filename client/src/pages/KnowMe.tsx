import { ArrowUpRight, Facebook, Github, Instagram, Linkedin, Mail, MessageCircle, PenLine } from "lucide-react";
import { profile } from "@/content/site";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";

const links = [
  { title: "Google referral", detail: "Share a role you think might fit", href: "/google-refer", icon: ArrowUpRight, local: true },
  { title: "Work with me", detail: "For roles, referrals, or collaborations, start a conversation.", href: `mailto:${profile.email}`, icon: Mail },
  { title: "Portfolio & experience", detail: "Selected work, career, and skills", href: "/?site=main", icon: ArrowUpRight, local: true },
  { title: "Writing on DEV.to", detail: "JavaScript, frontend architecture, and more", href: profile.devto, icon: PenLine },
  { title: "Ask Abhinav", detail: "A grounded assistant about my work", href: "/ask", icon: MessageCircle, local: true },
  { title: "GitHub", detail: "Code and open-source work", href: profile.github, icon: Github },
  { title: "LinkedIn", detail: "Professional profile", href: profile.linkedin, icon: Linkedin },
  { title: "Instagram", detail: "Follow along", href: profile.instagram, icon: Instagram },
  { title: "Facebook", detail: "Connect socially", href: profile.facebook, icon: Facebook },
];

export default function KnowMe() {
  return (
    <SiteShell compact>
      <PageMeta title="Know Me — Abhinav Nigam" description="The links and profiles of Abhinav Nigam." />
      <main className="wrap knowme-main">
        <section className="profile-card">
          <div className="profile-avatar"><img src="/brandmark.png" alt="" width="72" height="72" /></div>
          <p className="eyebrow">knowme.abhinavnigam.in</p>
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
        <p className="knowme-footnote">One page, all the right places.</p>
      </main>
    </SiteShell>
  );
}
