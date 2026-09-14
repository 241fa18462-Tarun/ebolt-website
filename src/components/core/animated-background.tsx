import React, { Children, cloneElement, useEffect, useState, useId } from 'react';
import { motion, Transition, AnimatePresence } from 'motion/react';

export interface AnimatedBackgroundProps {
  children: React.ReactNode;
  defaultValue?: string | null;
  value?: string | null;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
}

export function AnimatedBackground({
  children,
  defaultValue = null,
  value,
  onValueChange,
  className = '',
  transition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.3,
  },
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(value !== undefined ? value : defaultValue);
  const uniqueId = useId();

  useEffect(() => {
    if (value !== undefined) {
      setActiveId(value);
    } else if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [value, defaultValue]);

  const handleMouseEnter = (id: string | null) => {
    if (enableHover) {
      setActiveId(id);
      onValueChange?.(id);
    }
  };

  const handleMouseLeave = () => {
    if (enableHover) {
      const resetId = value !== undefined ? value : defaultValue;
      setActiveId(resetId ?? null);
      onValueChange?.(resetId ?? null);
    }
  };

  const handleClick = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  return (
    <>
      {Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const id = (child.props as any)['data-id'] ?? (child.key as string) ?? `${index}`;
        const currentActive = value !== undefined ? value : activeId;
        const isSelected = currentActive === id;

        return cloneElement(
          child as React.ReactElement<any>,
          {
            key: child.key || index,
            className: `relative ${child.props.className || ''}`,
            'data-checked': isSelected ? 'true' : 'false',
            'aria-selected': isSelected,
            onMouseEnter: (e: React.MouseEvent) => {
              handleMouseEnter(id);
              (child.props as any).onMouseEnter?.(e);
            },
            onMouseLeave: (e: React.MouseEvent) => {
              handleMouseLeave();
              (child.props as any).onMouseLeave?.(e);
            },
            onClick: (e: React.MouseEvent) => {
              handleClick(id);
              (child.props as any).onClick?.(e);
            },
            children: (
              <>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      layoutId={`animated-bg-${uniqueId}`}
                      className={`absolute inset-0 pointer-events-none ${className}`}
                      transition={transition}
                      initial={{ opacity: defaultValue ? 1 : 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.15 },
                      }}
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10 flex items-center gap-3 w-full">
                  {(child.props as any).children}
                </span>
              </>
            ),
          }
        );
      })}
    </>
  );
}
