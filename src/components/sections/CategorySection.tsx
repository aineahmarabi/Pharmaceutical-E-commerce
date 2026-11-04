'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';

const SPEED_PX_PER_SEC = 22; // gentle drift
const RESUME_AFTER_MS = 2500; // idle time before the drift picks up again

function CategoryLink({ slug, name, hidden }: { slug: string; name: string; hidden?: boolean }) {
  return (
    <Link
      href={`/category/${slug}`}
      tabIndex={hidden ? -1 : undefined}
      className="block whitespace-nowrap rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-[colors,transform] duration-100 hover:border-petrol hover:text-petrol active:scale-[0.97]"
    >
      {name}
    </Link>
  );
}

/**
 * Category row that drifts slowly on its own but is a real horizontally scrollable
 * container, so people can swipe, wheel, use the keyboard or drag it with a mouse.
 * The drift pauses on any interaction and resumes after a short idle. The list is
 * rendered three times so it loops seamlessly in both directions.
 */
export function CategorySection() {
  const live = useQuery(api.taxonomy.listCategories, {});
  const categories = live && live.length > 0 ? live : fixtureCategories;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // plain scrollable row, no drift, no clones

    const copyWidth = () => {
      const a = track.children[0] as HTMLElement | undefined;
      const b = track.children[1] as HTMLElement | undefined;
      return a && b ? b.offsetLeft - a.offsetLeft : 0;
    };

    // Start in the middle copy so the user can scroll either way.
    let w = copyWidth();
    if (w) scroller.scrollLeft = w;

    let pos = scroller.scrollLeft;
    let pausedUntil = 0;
    let lastSet = scroller.scrollLeft; // where the drift last put the row
    let hovering = false;
    let focused = false;
    let raf = 0;
    let last = performance.now();

    const holdOff = () => {
      pausedUntil = performance.now() + RESUME_AFTER_MS;
    };

    // Keep the position inside the middle copy so the loop never runs out.
    const normalise = () => {
      w = copyWidth();
      if (!w) return;
      let sl = scroller.scrollLeft;
      if (sl >= w * 2) sl -= w;
      else if (sl < w) sl += w;
      else return;
      scroller.scrollLeft = sl;
      lastSet = scroller.scrollLeft;
      pos = sl;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (!hovering && !focused && now >= pausedUntil && !document.hidden) {
        pos += (SPEED_PX_PER_SEC * dt) / 1000;
        scroller.scrollLeft = pos;
        lastSet = scroller.scrollLeft;
        normalise();
      } else {
        pos = scroller.scrollLeft; // follow wherever the user took it
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ── user interaction pauses the drift ──
    const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hovering = true; };
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') { hovering = false; holdOff(); } };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = () => { focused = false; holdOff(); };
    const onTouch = () => holdOff();
    const onWheel = () => holdOff();
    const onKey = () => holdOff();
    // Any scroll the drift did not cause (scrollbar, keyboard, assistive tech, script)
    // counts as the user taking over: pick up from there and pause the drift.
    const onScroll = () => {
      if (Math.abs(scroller.scrollLeft - lastSet) > 1.5) {
        pos = scroller.scrollLeft;
        lastSet = scroller.scrollLeft;
        holdOff();
      }
      if (performance.now() < pausedUntil) normalise();
    };

    // ── mouse drag-to-scroll, tracked 1:1 with the pointer ──
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = scroller.scrollLeft;
      holdOff();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        scroller.setPointerCapture(e.pointerId);
        scroller.style.cursor = 'grabbing';
      }
      if (moved) {
        scroller.scrollLeft = startLeft - dx;
        holdOff();
      }
    };
    const onUp = () => {
      dragging = false;
      scroller.style.cursor = '';
      holdOff();
    };
    // A drag must not also count as a click on a category.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    scroller.addEventListener('pointerenter', onEnter);
    scroller.addEventListener('pointerleave', onLeave);
    scroller.addEventListener('focusin', onFocusIn);
    scroller.addEventListener('focusout', onFocusOut);
    scroller.addEventListener('touchstart', onTouch, { passive: true });
    scroller.addEventListener('touchend', onTouch, { passive: true });
    scroller.addEventListener('wheel', onWheel, { passive: true });
    scroller.addEventListener('keydown', onKey);
    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('pointerdown', onDown);
    scroller.addEventListener('pointermove', onMove);
    scroller.addEventListener('pointerup', onUp);
    scroller.addEventListener('pointercancel', onUp);
    scroller.addEventListener('click', onClickCapture, true);

    const onResize = () => { w = copyWidth(); if (w) { scroller.scrollLeft = Math.max(scroller.scrollLeft, w); pos = scroller.scrollLeft; } };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      scroller.removeEventListener('pointerenter', onEnter);
      scroller.removeEventListener('pointerleave', onLeave);
      scroller.removeEventListener('focusin', onFocusIn);
      scroller.removeEventListener('focusout', onFocusOut);
      scroller.removeEventListener('touchstart', onTouch);
      scroller.removeEventListener('touchend', onTouch);
      scroller.removeEventListener('wheel', onWheel);
      scroller.removeEventListener('keydown', onKey);
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('pointerdown', onDown);
      scroller.removeEventListener('pointermove', onMove);
      scroller.removeEventListener('pointerup', onUp);
      scroller.removeEventListener('pointercancel', onUp);
      scroller.removeEventListener('click', onClickCapture, true);
    };
  }, [categories.length]);

  return (
    <nav aria-label="Categories">
      <div
        ref={scrollerRef}
        className="-mx-4 cursor-grab overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        <div ref={trackRef} className="flex w-max gap-2">
          {[0, 1, 2].map((copy) => (
            <ul
              key={copy}
              className={`flex shrink-0 gap-2 ${copy !== 1 ? '' : ''} ${copy > 0 ? 'motion-reduce:hidden' : ''}`}
              aria-hidden={copy === 1 ? undefined : true}
            >
              {categories.map((cat) => (
                <li key={`${copy}-${cat.slug}`}>
                  <CategoryLink slug={cat.slug} name={cat.name} hidden={copy !== 1} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </nav>
  );
}
