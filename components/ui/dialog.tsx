import React, { ReactNode, useState, createContext, useContext } from 'react';

interface DialogProps {
  children: ReactNode;
  className?: string;
}

const DialogContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | undefined>(undefined);

export function Dialog({ children }: DialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      <div>{children}</div>
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog');
  }
  const { setOpen } = context;
  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: () => setOpen(true),
  });
}

export function DialogContent({ children, className = '' }: DialogProps) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('DialogContent must be used within a Dialog');
  }
  const { open, setOpen } = context;
  if (!open) return null;
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded p-4">
        {children}
        <button onClick={() => setOpen(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = '' }: DialogProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = '' }: DialogProps) {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
}
