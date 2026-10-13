import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/site/Photo";
import { PageMeta, SiteShell } from "@/components/site/SiteShell";
import { stories, storyMeta, travelsAreSample, type City, type Story } from "@/content/travels";
import NotFound from "./NotFound";

// Moving between the travel pages morphs the photo that was clicked into the next page's cover. The
// browser does it (cross-document view transitions) when both pages carry this rule; elsewhere on the site
// navigation is unchanged. Browsers without support simply load the page.
export function TravelTransitions() {
  return <style>{`
    @media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }
    ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 380ms; }
    ::view-transition-group(*) { animation-duration: 620ms; animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }
  `}</style>;
}

const sampleNote = travelsAreSample && <p className="sample-note wrap" role="note"><strong>Preview with placeholder photos and text.</strong> This page shows the layout; the story and pictures are still to come.</p>;

function Facts({ facts }: { facts: { label: string; value: string }[] }) {
  return <dl className="story-facts">{facts.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}

export function TravelCountry({ slug }: { slug: string }) {
  const story = stories.find(item => item.slug === slug);
  if (!story) return <NotFound />;
  return (
    <SiteShell>
      <PageMeta {...storyMeta(story)} />
      <TravelTransitions />
      <main className="story-main">
        <header className="story-hero">
          <Photo photo={story.cover} className="story-cover" shared={`story-${story.slug}`} />
          <div className="story-hero-copy wrap">
            <a className="story-back" href="/bucket-list"><ArrowLeft size={16} aria-hidden="true" /> Travel log</a>
            <p className="story-code">{story.code}</p>
            <h1>{story.name}</h1>
            <p className="story-tagline">{story.tagline}</p>
          </div>
        </header>
        {sampleNote}
        <section className="story-intro wrap">
          <p>{story.intro}</p>
          <Facts facts={story.facts} />
        </section>
        <section className="content-section wrap" aria-labelledby="cities-title">
          <h2 className="statement" id="cities-title">Where I went.</h2>
          <div className="city-cards">
            {story.cities.map((city, index) => (
              <a className="city-card" href={`/bucket-list/${story.slug}/${city.slug}`} key={city.slug}>
                <Photo photo={city.cover} shared={`city-${city.slug}`} />
                <span className="city-card-copy">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{city.name}</strong>
                  <span>{city.tagline}</span>
                </span>
                <ArrowUpRight className="city-card-arrow" size={20} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
        <section className="content-section wrap story-end">
          <a className="story-next" href="/bucket-list"><span>Back to</span><strong>The whole map <ArrowRight size={28} aria-hidden="true" /></strong></a>
        </section>
      </main>
    </SiteShell>
  );
}

export function TravelCity({ country, slug }: { country: string; slug: string }) {
  const story: Story | undefined = stories.find(item => item.slug === country);
  const index = story ? story.cities.findIndex(item => item.slug === slug) : -1;
  if (!story || index < 0) return <NotFound />;
  const city: City = story.cities[index];
  const next = story.cities[(index + 1) % story.cities.length];
  return (
    <SiteShell>
      <PageMeta {...storyMeta(story, city)} />
      <TravelTransitions />
      <main className="story-main">
        <header className="story-hero">
          <Photo photo={city.cover} className="story-cover" shared={`city-${city.slug}`} />
          <div className="story-hero-copy wrap">
            <a className="story-back" href={`/bucket-list/${story.slug}`}><ArrowLeft size={16} aria-hidden="true" /> {story.name}</a>
            <p className="story-code">{story.code} · {String(index + 1).padStart(2, "0")}</p>
            <h1>{city.name}</h1>
            <p className="story-tagline">{city.tagline}</p>
          </div>
        </header>
        {sampleNote}
        <section className="story-intro wrap">
          <p>{city.intro}</p>
          <Facts facts={city.facts} />
        </section>
        <section className="content-section wrap" aria-label="Photos">
          <div className="story-photos">
            {city.photos.map((photo, i) => (
              <figure key={i} className={photo.tall ? "is-tall" : undefined}>
                <Photo photo={photo} />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="content-section wrap" aria-labelledby="highlights-title">
          <h2 className="statement" id="highlights-title">What stayed with me.</h2>
          <dl className="story-highlights">
            {city.highlights.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}
          </dl>
        </section>
        <section className="content-section wrap story-end">
          <a className="story-next" href={`/bucket-list/${story.slug}/${next.slug}`}><span>Next stop</span><strong>{next.name} <ArrowRight size={28} aria-hidden="true" /></strong></a>
        </section>
      </main>
    </SiteShell>
  );
}
