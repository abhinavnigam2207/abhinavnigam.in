import { lazy, Suspense, useLayoutEffect } from "react";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Ask from "./pages/Ask";
import Blog from "./pages/Blog";
import Experiences from "./pages/Experiences";
import GoogleRefer from "./pages/GoogleRefer";
import Home from "./pages/Home";
import Ideologies from "./pages/Ideologies";
import KnowMe from "./pages/KnowMe";
import NotFound from "./pages/NotFound";
import { TravelCity, TravelCountry } from "./pages/TravelStory";

const IDEApp = lazy(() => import("./pages/IDEApp"));

// ask. and knowme. serve their own page at "/" (see netlify/edge-functions/host-root.ts).
function SubdomainRoot() {
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("site") !== "main") {
    const host = window.location.hostname.toLowerCase();
    if (host === "ask.abhinavnigam.in") return <Ask />;
    if (host === "knowme.abhinavnigam.in") return <KnowMe />;
  }
  return <Home />;
}

// The travel pages can be read in 1826; the rest of the site is always its own plain self. The era lives on
// <html> (see /travel/era.js), which outlasts a move to another page inside the app (the site name, for
// one, is an in-app link). So it is taken off on the way out, and put back from the visitor's saved choice
// on the way in, before the browser paints the new page.
const isTravelPath = (path: string) => /^\/(bucket-list|experiences)(\/|$)/.test(path);
function useTravelEra(path: string) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!isTravelPath(path)) {
      for (const name of ["data-era", "data-door", "data-dived", "data-era-flip"]) root.removeAttribute(name);
      return;
    }
    if (root.dataset.era) return;
    let saved: string | null = null;
    try { saved = window.localStorage.getItem("expedition-era"); } catch { /* storage refused: the default stands */ }
    root.dataset.era = saved === "1826" ? "1826" : "2026";
  }, [path]);
}

function Routes() {
  const [path] = useLocation();
  useTravelEra(path);
  // The prerender passes this path for the static 404 page.
  if (path === "/__not_found__") return <NotFound />;

  return (
    <Switch>
      <Route path="/" component={SubdomainRoot} />
      <Route path="/blog" component={Blog} />
      <Route path="/ideologies" component={Ideologies} />
      <Route path="/experiences" component={Experiences} />
      <Route path="/bucket-list" component={Experiences} />
      <Route path="/bucket-list/:country">{params => <TravelCountry slug={params.country} />}</Route>
      <Route path="/bucket-list/:country/:city">{params => <TravelCity country={params.country} slug={params.city} />}</Route>
      <Route path="/google-refer" component={GoogleRefer} />
      <Route path="/ask" component={Ask} />
      <Route path="/knowme" component={KnowMe} />
      <Route path="/ide">
        <Suspense fallback={null}>
          <IDEApp />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ ssrPath }: { ssrPath?: string } = {}) {
  return (
    <ErrorBoundary>
      <WouterRouter ssrPath={ssrPath}>
        <Routes />
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;
