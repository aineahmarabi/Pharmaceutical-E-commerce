'use client';

import { Delete } from 'lucide-react';
import type { usePinEntry } from '@/hooks/usePinEntry';

const keyClass =
  'h-12 rounded-lg bg-p-bg-surface border border-p-border-input text-lg font-semibold text-p-text tabular-nums ' +
  'hover:bg-p-bg-surface-hover active:scale-[0.97] active:bg-p-bg-surface-active transition-[background-color,transform] duration-100 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p-focus';

export function PinKeypad({
  pin,
  onEnter,
}: {
  pin: ReturnType<typeof usePinEntry>;
  onEnter: () => void;
}) {
  const { digits, inputRefs, handleChange, handleKeyDown, handlePaste, appendDigit, backspaceDigit } = pin;

  return (
    <>
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Passcode digit ${index + 1}`}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e, onEnter)}
            className="w-11 h-12 text-center text-xl font-semibold text-p-text bg-p-bg-surface border border-p-border-input rounded-lg focus:border-p-focus focus:outline-none focus:ring-2 focus:ring-p-focus/30 transition-colors"
            maxLength={2}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => appendDigit(d)} className={keyClass}>
            {d}
          </button>
        ))}
        <div />
        <button type="button" onClick={() => appendDigit('0')} className={keyClass}>
          0
        </button>
        <button
          type="button"
          onClick={backspaceDigit}
          aria-label="Delete digit"
          className={`${keyClass} flex items-center justify-center text-p-text-subdued`}
        >
          <Delete size={18} />
        </button>
      </div>
    </>
  );
}
