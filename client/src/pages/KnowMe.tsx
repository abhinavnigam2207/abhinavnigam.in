import { ExternalLink, Facebook, Github, Instagram, Linkedin, Mail, MessageCircle, User } from "lucide-react";
import { profile } from "@/content/site";
import { Aurora } from "@/components/site/Aurora";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";

const GoogleG = ({ size }: { size: number }) => <img src="/google-g.png" alt="" width={size} height={size} style={{ objectFit: "contain" }} />;
// Medium and DEV marks: the icon set has no brand icons for these two.
const MediumMark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" /></svg>
);
const DevMark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.28-2.2.02-1.84-.03-1.94-.31-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.3zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z" /></svg>
);

const links = [
  { title: "LinkedIn", detail: "Professional profile", href: profile.linkedin, icon: Linkedin },
  { title: "GitHub", detail: "Code and open-source work", href: profile.github, icon: Github },
  { title: "Ask Abhinav", detail: "A grounded assistant about my work", href: "/ask", icon: MessageCircle, local: true },
  { title: "Portfolio & experience", detail: "Selected work, career, and skills", href: "/?site=main", icon: User, local: true },
  { title: "Writing on Medium", detail: "Articles and notes", href: profile.medium, icon: MediumMark },
  { title: "Writing on DEV.to", detail: "JavaScript, frontend architecture, and more", href: profile.devto, icon: DevMark },
  { title: "Work with me", detail: "For roles, referrals, or collaborations, start a conversation.", href: `mailto:${profile.email}`, icon: Mail },
  { title: "Google referral", detail: "Share a role you think might fit", href: "/google-refer", icon: GoogleG, local: true },
  { title: "Instagram", detail: "Follow along", href: profile.instagram, icon: Instagram },
  { title: "Facebook", detail: "Connect socially", href: profile.facebook, icon: Facebook },
];

export default function KnowMe() {
  return (
    <SiteShell compact portfolioLink={false} theme="sky">
      <PageMeta {...pageMeta.knowMe} />
      <main className="wrap knowme-main">
        <Aurora />
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
              <ExternalLink className="bio-link-arrow" size={17} aria-hidden="true" />
            </a>;
          })}
        </section>
      </main>
    </SiteShell>
  );
}
