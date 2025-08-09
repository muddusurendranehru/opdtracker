import React, { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialog');
  }
  return context;
};

const AlertDialog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ 
  asChild, 
  children 
}) => {
  const { setOpen } = useAlertDialog();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    });
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
};

const AlertDialogContent: React.FC<{ 
  className?: string; 
  children: React.ReactNode 
}> = ({ className, children }) => {
  const { open, setOpen } = useAlertDialog();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      <div className={cn(
        'relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6',
        className
      )}>
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const AlertDialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900 mb-2">
    {children}
  </h2>
);

const AlertDialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600">
    {children}
  </p>
);

const AlertDialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex justify-end space-x-2 mt-6">
    {children}
  </div>
);

const AlertDialogAction: React.FC<{ 
  onClick?: () => void; 
  className?: string;
  children: React.ReactNode 
}> = ({ onClick, className, children }) => {
  const { setOpen } = useAlertDialog();

  return (
    <button
      className={cn(
        'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors',
        className
      )}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
};

const AlertDialogCancel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setOpen } = useAlertDialog();

  return (
    <button
      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      onClick={() => setOpen(false)}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};