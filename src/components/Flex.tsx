import React, { forwardRef } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';

type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 18 | 22 | 26 | 30;

type Props = PropsWithChildren<
  Partial<{
    className?: string;
    direction?: CSSProperties['flexDirection'];
    spacing?: Spacing;
    justifyContent?: CSSProperties['justifyContent'];
    alignItems?: CSSProperties['alignItems'];
  }>
> &
  React.HTMLAttributes<HTMLDivElement>;

export const Flex = forwardRef(
  ({ children, className, spacing, direction, justifyContent, alignItems, style, ...rest }: Props) => (
    <div
      {...rest}
      style={{
        display: 'flex',
        gap: spacing ? `${spacing * 0.25}rem` : undefined,
        flexDirection: direction,
        justifyContent,
        alignItems,
        width: '100%',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  ),
);

Flex.displayName = 'Flex';
