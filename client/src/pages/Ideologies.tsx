import { PageIntro, PageMeta, SectionHeading, SiteShell } from "@/components/site/SiteShell";
import { ideologies } from "@/content/ideologies";
import { pageMeta } from "@/content/pageMeta";

export default function Ideologies() {
  return (
    <SiteShell>
      <PageMeta {...pageMeta.ideologies} />
      <main className="wrap page-main">
        <PageIntro eyebrow="Principles & ideas" title="What I believe about building.">
          <p>What changes when you move from writing code to leading the people who write it. Twenty things I've learned, ten for each seat.</p>
        </PageIntro>
        {ideologies.map(group => (
          <section className="content-section principles" key={group.id} id={group.id}>
            <SectionHeading eyebrow="Ten truths" title={group.title}>{group.audience}</SectionHeading>
            <ol className="row-list">
              {group.points.map(([lead, body], index) => (
                <li className="row" key={lead}>
                  <div className="row-meta">{String(index + 1).padStart(2, "0")}</div>
                  <div className="row-body"><h3>{lead}</h3><p>{body}</p></div>
                </li>
              ))}
            </ol>
            <p className="statement">{group.closing}</p>
          </section>
        ))}
      </main>
    </SiteShell>
  );
}
