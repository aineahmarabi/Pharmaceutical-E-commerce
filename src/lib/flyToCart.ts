/**
 * "Add to cart" feedback: a small copy of the product picture lifts off the button,
 * arcs across the screen and drops into the shopping bag, which then gives a little bump.
 *
 * Any element marked `data-cart-target` can receive it (the header bag on desktop, the
 * Cart tab on phones); the one that is actually visible is used. With reduced motion the
 * flight is skipped and only the quick bump remains.
 */
const FLIGHT_MS = 1000; // slow enough to follow with the eye
const SIZE = 64;

function visibleCartTarget(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'));
  return (
    all.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    }) ?? null
  );
}

function bump(target: HTMLElement) {
  target.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)', offset: 0.35 },
      { transform: 'scale(0.94)', offset: 0.65 },
      { transform: 'scale(1)' },
    ],
    { duration: 520, easing: 'ease-out' },
  );
}

export function flyToCart(source: Element | null, opts: { imageUrl?: string; initials?: string } = {}) {
  if (typeof window === 'undefined' || !source) return;
  const target = visibleCartTarget();
  if (!target) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bump(target);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const el = document.createElement('div');
  el.setAttribute('data-fly-to-cart', '');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: '9999px',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
    border: '2px solid rgba(255,255,255,0.9)',
    zIndex: '2147483000',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  } as Partial<CSSStyleDeclaration>);

  if (opts.imageUrl) {
    const img = document.createElement('img');
    img.src = opts.imageUrl;
    img.alt = '';
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'contain', background: '#fff' });
    el.appendChild(img);
  } else {
    Object.assign(el.style, { background: '#17624A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '20px' });
    el.textContent = opts.initials ?? '+';
  }
  document.body.appendChild(el);

  const startX = from.left + from.width / 2 - SIZE / 2;
  const startY = from.top + from.height / 2 - SIZE / 2;
  const endX = to.left + to.width / 2 - SIZE / 2;
  const endY = to.top + to.height / 2 - SIZE / 2;
  // Rise first, then swoop into the bag.
  const midX = startX + (endX - startX) * 0.45;
  const midY = Math.min(startY, endY) - 90;

  const flight = el.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
      { transform: `translate(${midX}px, ${midY}px) scale(0.85)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${endX}px, ${endY}px) scale(0.28)`, opacity: 0.55 },
    ],
    { duration: FLIGHT_MS, easing: 'cubic-bezier(0.45, 0.05, 0.3, 1)', fill: 'forwards' },
  );
  const done = () => {
    el.remove();
    bump(target);
  };
  flight.onfinish = done;
  flight.oncancel = () => el.remove();
}

/** Finds the product picture in the same card (or page) as the pressed button. */
export function productImageNear(button: Element | null): { el: Element | null; url?: string } {
  const scope = button?.closest('article') ?? button?.closest('main') ?? document;
  const img = scope.querySelector<HTMLImageElement>('img[alt]:not([alt=""])') ?? scope.querySelector<HTMLImageElement>('img');
  return { el: img ?? button, url: img?.currentSrc || img?.src || undefined };
}
