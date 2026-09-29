import { ArrowUpRight, Clock3 } from "lucide-react";
import { blogPosts, profile } from "@/content/site";
import { PageIntro, PageMeta, SiteShell } from "@/components/site/SiteShell";

export default function Blog() {
  return (
    <SiteShell>
      <PageMeta title="Writing — Abhinav Nigam" description="Articles by Abhinav Nigam on JavaScript, developer tools, and frontend architecture." />
      <main className="wrap page-main">
        <PageIntro eyebrow="Writing · 03 posts" title="Notes from building for the web.">
          <p>Older writing, gathered from <a className="inline-link" href={profile.devto} target="_blank" rel="noreferrer">DEV.to <ArrowUpRight size={14} /></a>. New posts can be added here as they’re published.</p>
        </PageIntro>
        <section className="post-list" aria-label="Published articles">
          {blogPosts.map((post, index) => (
            <article className="post-row" key={post.url}>
              <span className="post-number">0{index + 1}</span>
              <div className="post-body">
                <div className="post-meta"><span>{post.date}</span>{post.updated && <span>{post.updated}</span>}<span><Clock3 size={13} /> {post.readTime}</span></div>
                <h2><a href={post.url} target="_blank" rel="noreferrer">{post.title}</a></h2>
                <p>{post.description}</p>
                <div className="tag-list compact-tags">{post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
              </div>
              <a className="post-arrow" href={post.url} target="_blank" rel="noreferrer" aria-label={`Read ${post.title}`}><ArrowUpRight size={19} /></a>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}
