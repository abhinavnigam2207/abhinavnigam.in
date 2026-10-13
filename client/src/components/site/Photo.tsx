import type { CSSProperties } from "react";
import type { Photo as PhotoData } from "@/content/travels";

// A travel photo. Until a real file is supplied (`src`), it draws a tinted block that says it is a
// placeholder, so layouts can be judged without borrowing anyone's pictures.
// `shared` names the element for the page-to-page morph (view-transition-name): give the same name to the
// small photo on one page and the large one on the next and the browser grows one into the other.
export function Photo({ photo, className, shared, showCaption }: { photo: PhotoData; className?: string; shared?: string; showCaption?: boolean }) {
  const style: CSSProperties = {
    ...(shared ? { viewTransitionName: shared } : {}),
    ...(photo.src || photo.video ? {} : { background: `linear-gradient(135deg, hsl(${photo.tone} 62% 82%), hsl(${(photo.tone + 38) % 360} 52% 64%))` }),
  };
  return (
    <div className={`photo${photo.src || photo.video ? "" : " is-placeholder"}${className ? ` ${className}` : ""}`} style={style}>
      {photo.video
        ? <video src={photo.video} poster={photo.src} controls playsInline preload="none" aria-label={photo.caption} />
        : photo.src
        ? <img src={photo.src} alt={photo.caption} loading="lazy" />
        : <span className="photo-mark" aria-hidden="true">Placeholder photo</span>}
      {showCaption && <span className="photo-caption">{photo.caption}</span>}
    </div>
  );
}
