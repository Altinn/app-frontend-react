import React, { forwardRef } from 'react';
import type { CSSProperties, PropsWithChildren } from 'react';

import cn from 'classnames';

import classes from 'src/components/Flex.module.css';
import type { IGridStyling } from 'src/layout/common.generated';

type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 18 | 22 | 26 | 30;

type Props = PropsWithChildren<{
  className?: string;
  size?: IGridStyling;
  spacing?: Spacing;
  direction?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  container?: boolean;
  item?: boolean;
  flexWrap?: CSSProperties['flexWrap'];
}> &
  React.HTMLAttributes<HTMLDivElement>;

export const Flex = forwardRef<HTMLDivElement, Props>(
  ({
    id,
    children,
    className,
    spacing,
    direction = 'row',
    justifyContent = 'start',
    alignItems = 'start',
    flexWrap = 'wrap',
    style,
    size,
    item,
    container,
    ...rest
  }: Props) => {
    const xsClass = classes[`col-xs-${size?.xs ?? 12}`];
    const smClass = size?.sm ? classes[`col-sm-${size.sm}`] : '';
    const mdClass = size?.md ? classes[`col-md-${size.md}`] : '';
    const lgClass = size?.lg ? classes[`col-lg-${size.lg}`] : '';

    return (
      <div
        id={id}
        {...rest}
        style={{
          display: container ? 'flex' : 'block',
          boxSizing: 'border-box',
          flexDirection: direction,
          gap: spacing ? `${spacing * 0.25}rem` : undefined,
          flexWrap,
          justifyContent,
          alignItems,
          ...style,
        }}
        className={cn(xsClass, smClass, mdClass, lgClass, className, { [classes.item]: item })}
      >
        {children}
      </div>
    );
  },
);

Flex.displayName = 'Flex';
