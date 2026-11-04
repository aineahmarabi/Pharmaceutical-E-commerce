/** A quiet red watermark laid over a product image: thin ring, small caps, slightly tilted, partly see-through. */
export function OutOfStockMark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center bg-paper/35">
      <span
        className={
          size === 'lg'
            ? '-rotate-12 rounded-md border-2 border-signal/70 px-4 py-1.5 text-base font-semibold uppercase tracking-[0.18em] text-signal/80'
            : '-rotate-12 rounded border border-signal/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-signal/80 sm:text-xs'
        }
      >
        Out of stock
      </span>
    </span>
  );
}
