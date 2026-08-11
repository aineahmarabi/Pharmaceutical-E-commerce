'use client';

import { Delete } from 'lucide-react';
import type { usePinEntry } from '@/hooks/usePinEntry';

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
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e, onEnter)}
            className="w-11 h-12 text-center text-xl font-bold font-mono text-petrol bg-porcelain border-2 border-line rounded-xl focus:border-petrol focus:bg-white focus:outline-none focus:ring-4 focus:ring-petrol/10 transition-all shadow-inner"
            maxLength={2}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[250px] mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => appendDigit(d)}
            className="h-11 rounded-xl bg-porcelain border border-line text-lg font-semibold font-mono text-ink hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
          >
            {d}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => appendDigit('0')}
          className="h-11 rounded-xl bg-porcelain border border-line text-lg font-semibold font-mono text-ink hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspaceDigit}
          aria-label="Delete digit"
          className="h-11 rounded-xl bg-porcelain border border-line flex items-center justify-center text-petrol-300 hover:bg-petrol-50 hover:border-petrol/40 active:scale-[0.96] transition-all"
        >
          <Delete size={16} />
        </button>
      </div>
    </>
  );
}
