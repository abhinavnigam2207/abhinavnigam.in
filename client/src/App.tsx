import { lazy, Suspense } from "react";
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

function Routes() {
  const [path] = useLocation();
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
