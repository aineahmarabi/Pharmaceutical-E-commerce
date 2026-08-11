'use client';

import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';

export function usePinEntry(length: number) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (index: number) => inputRefs.current[index]?.focus({ preventScroll: true });

  const reset = () => {
    setDigits(Array(length).fill(''));
    focus(0);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit !== '' && index < length - 1) focus(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>, onEnter: () => void) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        focus(index - 1);
      } else {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focus(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focus(index + 1);
    } else if (e.key === 'Enter') {
      onEnter();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    focus(Math.min(pasted.length, length - 1));
  };

  const appendDigit = (d: string) => {
    const emptyIndex = digits.findIndex((v) => v === '');
    const index = emptyIndex === -1 ? length - 1 : emptyIndex;
    const next = [...digits];
    next[index] = d;
    setDigits(next);
    focus(index < length - 1 ? index + 1 : index);
  };

  const backspaceDigit = () => {
    let lastIndex = -1;
    for (let i = digits.length - 1; i >= 0; i--) {
      if (digits[i] !== '') { lastIndex = i; break; }
    }
    if (lastIndex === -1) return;
    const next = [...digits];
    next[lastIndex] = '';
    setDigits(next);
    focus(lastIndex);
  };

  return {
    digits,
    inputRefs,
    code: digits.join(''),
    isComplete: digits.every((d) => d !== ''),
    handleChange,
    handleKeyDown,
    handlePaste,
    appendDigit,
    backspaceDigit,
    reset,
  };
}
