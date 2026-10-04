import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * A section with an inverted back layer that shows through a circle at the cursor.
 * The circle opens while the pointer is over a descendant marked with `data-lens`.
 * `back` must mirror the front layout so the alternate copy lines up.
 */
export function Lens({ id, className, back, children }: { id?: string; className: string; back: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--lens-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--lens-y", `${event.clientY - rect.top}px`);
    el.classList.toggle("is-lit", (event.target as Element).closest("[data-lens]") !== null);
  };

  return (
    <section id={id} ref={ref} className={`lens ${className}`} onPointerMove={onPointerMove} onPointerLeave={() => ref.current?.classList.remove("is-lit")}>
      {children}
      <div className="lens-back" aria-hidden="true">{back}</div>
    </section>
  );
}
