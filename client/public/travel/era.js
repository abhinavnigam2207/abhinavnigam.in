// Runs in <head> of the travel pages, before anything is painted (scripts/prerender.ts adds the tag).
// The pages are pre-built in the 2026 look. This puts the visitor's chosen era on <html> straight away, so a
// page chosen as 1826 never flashes up in 2026 first; travel.css keys every era rule off this attribute.
// With no choice made yet, the map page is marked so its door is in place from the first frame.
// Kept as a file, not inline, because the site's content security policy allows scripts from itself only.
(function () {
  var root = document.documentElement;
  var era = null;
  try {
    var asked = new URLSearchParams(location.search).get("era");
    var saved = localStorage.getItem("expedition-era");
    era = asked === "1826" || asked === "2026" ? asked : saved === "1826" || saved === "2026" ? saved : null;
  } catch (error) { /* storage refused: fall through to the default */ }
  root.setAttribute("data-era", era || "2026");
  var map = /^\/(bucket-list|experiences)\/?$/.test(location.pathname);
  if (!era && map) root.setAttribute("data-door", "");
  // Opened straight into a country: the title block is not part of that view.
  if (map && location.hash.length > 1) root.setAttribute("data-dived", "");
  // Going to open in 1826, or to show the door (whose 1826 half is set in it): fetch its typeface now,
  // alongside the stylesheet, not after it.
  if (era === "1826" || root.hasAttribute("data-door")) ["im-fell-english", "im-fell-english-italic", "im-fell-english-sc"].forEach(function (name) {
    var link = document.createElement("link");
    link.rel = "preload"; link.as = "font"; link.type = "font/woff2"; link.crossOrigin = "anonymous";
    link.href = "/travel/fonts/" + name + ".woff2";
    document.head.appendChild(link);
  });
})();
