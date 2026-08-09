'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal } from './Modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolverRef.current?.(result);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        onClose={() => close(false)}
        title={options?.title ?? ''}
        primaryAction={{
          label: options?.confirmLabel ?? 'Confirm',
          destructive: options?.destructive,
          onClick: () => close(true),
        }}
        secondaryAction={{ label: 'Cancel', onClick: () => close(false) }}
      >
        <p className="text-sm text-p-text">{options?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}
