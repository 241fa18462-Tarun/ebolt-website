import React from 'react';
import { motion, Variants } from 'motion/react';

export interface AnimatedGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide';
  as?: React.ElementType;
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const defaultItemVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      type: 'spring',
      bounce: 0.3,
    },
  },
};

export function AnimatedGroup({
  children,
  className = '',
  variants,
  preset,
  as: Component = 'div',
  ...props
}: AnimatedGroupProps) {
  const containerVariants = variants?.container || defaultContainerVariants;
  const itemVariants = variants?.item || defaultItemVariants;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      {...(props as any)}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div
            key={child.key || index}
            variants={itemVariants}
            className="h-full w-full"
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function AnimatedGroupCustomVariants({
  children,
  className = 'grid grid-cols-2 gap-4 p-8 md:grid-cols-3 lg:grid-cols-4',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatedGroup
      className={className}
      variants={{
        container: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        },
        item: {
          hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
          visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
              duration: 1.2,
              type: 'spring',
              bounce: 0.3,
            },
          },
        },
      }}
    >
      {children}
    </AnimatedGroup>
  );
}
