import React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = '',
  type = 'auto',
  ...props
}) => {
  return (
    <div
      className={`overflow-y-auto overflow-x-hidden ${
        type === 'hover' ? 'hover:overflow-y-auto' : ''
      } ${className}`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
