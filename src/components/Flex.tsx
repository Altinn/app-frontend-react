import React, { forwardRef } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';

type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 18 | 22 | 26 | 30;

type Props = PropsWithChildren<
  Pick<CSSProperties, 'justifyContent' | 'alignItems'> &
    Partial<{
      className?: string;
      direction?: CSSProperties['flexDirection'];
      spacing?: Spacing;
    }>
> &
  React.HTMLAttributes<HTMLDivElement>;

export const Flex = forwardRef(
  ({ children, className, spacing, direction, justifyContent, alignItems, ...rest }: Props) => (
    <div
      {...rest}
      style={{
        display: 'flex',
        gap: spacing ? `${spacing * 0.25}rem` : undefined,
        flexDirection: direction,
        justifyContent,
        alignItems,
      }}
      className={className}
    >
      {children}
    </div>
  ),
);

Flex.displayName = 'Flex';
