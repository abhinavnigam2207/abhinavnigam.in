export function subdomainRootPath(hostname: string, pathname: string, search = ""): string | undefined {
  if (pathname !== "/") return undefined;
  if (new URLSearchParams(search).get("site") === "main") return undefined;

  const host = hostname.toLowerCase();
  if (host === "ask.abhinavnigam.in") return "/ask/";
  if (host === "knowme.abhinavnigam.in") return "/knowme/";
  return undefined;
}

export default function hostRoot(request: Request): URL | undefined {
  const url = new URL(request.url);
  const targetPath = subdomainRootPath(url.hostname, url.pathname, url.search);
  if (!targetPath) return undefined;

  const target = new URL(targetPath, request.url);
  target.search = url.search;
  return target;
}

export const config = { path: "/" };
