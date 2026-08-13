import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Drawer Slide Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className={`w-full ${sizeClasses[size]} h-full bg-slate-900 text-slate-100 border-none shadow-2xl relative z-10 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-slate-950/70 border-none shadow-sm">
              {title ? (
                <h3 className="text-base md:text-lg font-extrabold text-white tracking-tight font-heading">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl p-2 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-100 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
