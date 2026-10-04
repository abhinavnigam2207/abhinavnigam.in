import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { pageMeta } from "@/content/pageMeta";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <SiteShell>
      <PageMeta {...pageMeta.notFound} />
      <main className="wrap not-found-page">
        <p className="eyebrow">404 · Not found</p>
        <h1>This page isn’t here.</h1>
        <p>The link may be outdated, or the page may have moved.</p>
        <Link href="/" className="text-link">Back to the portfolio ↗</Link>
      </main>
    </SiteShell>
  );
}
