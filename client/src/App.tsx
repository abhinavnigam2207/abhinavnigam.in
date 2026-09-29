import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import IDEApp from "./pages/IDEApp";
import type { FileId } from "./types/ide";

function RouteContent() {
  const [rawPath] = useLocation();
  const path = rawPath.split("?")[0].replace(/\/$/, "") || "/";

  let initialFile: FileId = "home";
  if (path === "/about") initialFile = "about";
  else if (path === "/experience" || path === "/experiences") initialFile = "experience";
  else if (path === "/projects") initialFile = "projects";
  else if (path === "/skills") initialFile = "skills";
  else if (path === "/google-refer") initialFile = "google-refer";
  else if (path === "/blog") initialFile = "blog";
  else if (path === "/contact") initialFile = "contact";
  else if (path === "/readme") initialFile = "readme";

  return <IDEApp initialFile={initialFile} />;
}

function App({ ssrPath }: { ssrPath?: string } = {}) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter ssrPath={ssrPath}>
            <RouteContent />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
