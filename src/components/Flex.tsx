import React, { forwardRef } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';

import cn from 'classnames';

type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 18 | 22 | 26 | 30;
type Size = 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type Props = PropsWithChildren<
  Partial<{
    container?: boolean;
    className?: string;
    size?: { xs?: Size; sm?: Size; md?: Size; lg?: Size; xl?: Size };
    spacing?: Spacing;
    justifyContent?: CSSProperties['justifyContent'];
    alignItems?: CSSProperties['alignItems'];
  }>
> &
  React.HTMLAttributes<HTMLDivElement>;

export const Flex = forwardRef<HTMLDivElement, Props>(
  ({
    children,
    className,
    spacing,
    justifyContent = 'space-evenly',
    alignItems,
    style,
    size,
    container,
    ...rest
  }: Props) => {
    const classNames = size
      ? `
    col-${size.xs || 12}
    ${size.sm ? `col-sm-${size.sm}` : ''}
    ${size.md ? `col-md-${size.md}` : ''}
    ${size.lg ? `col-lg-${size.lg}` : ''}
  `
      : '';
    return (
      <div
        {...rest}
        style={{
          display: container ? 'flex' : 'block',
          gap: spacing ? `${spacing * 0.25}rem` : undefined,
          flexDirection: container ? 'column' : undefined,
          justifyContent,
          alignItems,
          width: '100%',
          ...style,
        }}
        className={cn(className, classNames)}
      >
        {children}
      </div>
    );
  },
);

Flex.displayName = 'Flex';
