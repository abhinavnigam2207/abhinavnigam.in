import { MapPinned } from "lucide-react";
import { PageIntro, PageMeta, SiteShell } from "@/components/site/SiteShell";

export default function Experiences() {
  return (
    <SiteShell>
      <PageMeta title="Experiences — Abhinav Nigam" description="A list of experiences Abhinav Nigam has completed." />
      <main className="wrap page-main">
        <PageIntro eyebrow="Bucket list · Experiences" title="A life outside the pull request.">
          <p>A list of memorable things done, places explored, and moments worth keeping.</p>
        </PageIntro>
        <section className="empty-state">
          <span className="empty-icon"><MapPinned size={20} /></span>
          <h2>Stories to come.</h2>
          <p>This list hasn’t been filled in yet. Career experience is available on the <a className="inline-link" href="/#experience">homepage</a>.</p>
        </section>
      </main>
    </SiteShell>
  );
}
