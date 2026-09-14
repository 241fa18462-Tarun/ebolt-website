import React, { createContext, useContext, useState, useId, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Transition } from 'motion/react';
import { X } from 'lucide-react';

interface MorphingDialogContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

const MorphingDialogContext = createContext<MorphingDialogContextType | null>(null);

export function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) {
    throw new Error('MorphingDialog components must be used within a MorphingDialog provider');
  }
  return context;
}

export interface MorphingDialogProps {
  children: React.ReactNode;
  transition?: Transition;
  key?: React.Key;
}

export function MorphingDialog({ children }: MorphingDialogProps) {
  const uniqueId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <MorphingDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        uniqueId,
        triggerRef,
      }}
    >
      {children}
    </MorphingDialogContext.Provider>
  );
}

export interface MorphingDialogTriggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogTrigger({
  children,
  className = '',
  style,
}: MorphingDialogTriggerProps) {
  const { uniqueId, setIsOpen, triggerRef } = useMorphingDialog();

  return (
    <motion.div
      ref={triggerRef}
      layoutId={`morph-dialog-${uniqueId}`}
      className={`cursor-pointer ${className}`}
      style={style}
      onClick={() => setIsOpen(true)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  const { isOpen, setIsOpen, uniqueId } = useMorphingDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, setIsOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto">
          {/* Backdrop overlay */}
          <motion.div
            key={`backdrop-${uniqueId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Morphing dialog content wrapper */}
          <div className="relative z-10 w-full max-w-2xl flex justify-center items-center pointer-events-none">
            <div className="pointer-events-auto w-full flex justify-center">
              {children}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export interface MorphingDialogContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogContent({
  children,
  className = '',
  style,
}: MorphingDialogContentProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`morph-dialog-${uniqueId}`}
      className={`relative overflow-hidden shadow-2xl ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogTitle({
  children,
  className = '',
  style,
}: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.h2
      layoutId={`morph-dialog-title-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.h2>
  );
}

export interface MorphingDialogSubtitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogSubtitle({
  children,
  className = '',
  style,
}: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.p
      layoutId={`morph-dialog-subtitle-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.p>
  );
}

export interface MorphingDialogImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogImage({
  src,
  alt = '',
  className = '',
  style,
}: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.img
      src={src}
      alt={alt}
      layoutId={`morph-dialog-img-${uniqueId}`}
      className={className}
      style={style}
    />
  );
}

export interface MorphingDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogDescription({
  children,
  className = '',
  style,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`morph-dialog-desc-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export interface MorphingDialogCloseProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphingDialogClose({
  children,
  className = '',
  style,
}: MorphingDialogCloseProps) {
  const { setIsOpen } = useMorphingDialog();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
      aria-label="Close dialog"
      className={`absolute top-4 right-4 z-20 flex items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer ${className}`}
      style={style}
    >
      {children || <X size={18} />}
    </button>
  );
}
