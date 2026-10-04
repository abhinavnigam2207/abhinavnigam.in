import { Lightbulb } from "lucide-react";
import { PageIntro, PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";

export default function Ideologies() {
  return (
    <SiteShell>
      <PageMeta {...pageMeta.ideologies} />
      <main className="wrap page-main">
        <PageIntro eyebrow="Principles & ideas" title="What I believe about building.">
          <p>A space for Abhinav’s own notes on software, teams, and the way we work.</p>
        </PageIntro>
        <section className="empty-state">
          <span className="empty-icon"><Lightbulb size={20} /></span>
          <h2>The list is taking shape.</h2>
          <p>No entries have been added yet. This page is ready for Abhinav’s own principles and ideas.</p>
          <a className="inline-link" href="mailto:abhinavnigam2207@gmail.com?subject=Ideologies%20for%20the%20portfolio">Suggest an update <span aria-hidden="true">↗</span></a>
        </section>
      </main>
    </SiteShell>
  );
}
