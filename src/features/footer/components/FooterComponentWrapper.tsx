import React from 'react';

import cn from 'classnames';

import css from 'src/features/footer/components/FooterComponentWrapper.module.css';
import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

interface IFooterComponentWrapper {
  id: string;
  props: IFooterComponent<IFooterComponentType>;
  childRenderer: (props: IFooterComponent<IFooterComponentType>) => JSX.Element | null;
}

const getSpan = (span: number | [number, number]): string => {
  if (typeof span === 'number') {
    return `span ${span}`;
  }
  if (Array.isArray(span)) {
    return `${span[0]} / span ${span[1]}`;
  }
  return 'inherit';
};

export const FooterComponentWrapper = ({ id, props, childRenderer }: IFooterComponentWrapper) => {
  const gridColumn = props.gridColumns
    ? {
        '--footer-component-col-xs': props.gridColumns.xs ? getSpan(props.gridColumns.xs) : 'span 1',
        ...(props.gridColumns.sm && { '--footer-component-col-sm': getSpan(props.gridColumns.sm) }),
        ...(props.gridColumns.md && { '--footer-component-col-md': getSpan(props.gridColumns.md) }),
        ...(props.gridColumns.lg && { '--footer-component-col-lg': getSpan(props.gridColumns.lg) }),
        ...(props.gridColumns.xl && { '--footer-component-col-xl': getSpan(props.gridColumns.xl) }),
      }
    : {};
  const gridRow = props.gridRows
    ? {
        '--footer-component-row-xs': props.gridRows.xs ? getSpan(props.gridRows.xs) : 'span 1',
        ...(props.gridRows.sm && { '--footer-component-row-sm': getSpan(props.gridRows.sm) }),
        ...(props.gridRows.md && { '--footer-component-row-md': getSpan(props.gridRows.md) }),
        ...(props.gridRows.lg && { '--footer-component-row-lg': getSpan(props.gridRows.lg) }),
        ...(props.gridRows.xl && { '--footer-component-row-xl': getSpan(props.gridRows.xl) }),
      }
    : {};

  return (
    <div
      key={id}
      className={cn(css.wrapper, {
        [css.col]: !!props.gridColumns,
        [css.col_sm]: !!props.gridColumns?.sm,
        [css.col_md]: !!props.gridColumns?.md,
        [css.col_lg]: !!props.gridColumns?.lg,
        [css.col_xl]: !!props.gridColumns?.xl,
        [css.row]: !!props.gridRows,
        [css.row_sm]: !!props.gridRows?.sm,
        [css.row_md]: !!props.gridRows?.md,
        [css.row_lg]: !!props.gridRows?.lg,
        [css.row_xl]: !!props.gridRows?.xl,
      })}
      style={{ ...gridColumn, ...gridRow }}
    >
      {childRenderer(props)}
    </div>
  );
};
