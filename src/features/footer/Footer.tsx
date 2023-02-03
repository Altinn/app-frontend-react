import React from 'react';

import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks';
import { createFooterComponent } from 'src/features/footer';
import css from 'src/features/footer/Footer.module.css';
import type { IFooterLayout } from 'src/features/footer/types';

const Footer = () => {
  const footerLayout: IFooterLayout | null = useAppSelector((state) => state.formLayout.footerLayout);

  const components = React.useMemo(
    () => footerLayout?.footer.map((props) => createFooterComponent(props)),
    [footerLayout],
  );

  if (!components) {
    return null;
  }

  const gridBreakpoints = footerLayout?.columns
    ? {
        '--footer-grid-xs': footerLayout?.columns.xs ? `repeat(${footerLayout.columns.xs}, auto)` : 'auto',
        ...(footerLayout?.columns.sm && { '--footer-grid-sm': `repeat(${footerLayout.columns.sm}, auto)` }),
        ...(footerLayout?.columns.md && { '--footer-grid-md': `repeat(${footerLayout.columns.md}, auto)` }),
        ...(footerLayout?.columns.lg && { '--footer-grid-lg': `repeat(${footerLayout.columns.lg}, auto)` }),
        ...(footerLayout?.columns.xl && { '--footer-grid-xl': `repeat(${footerLayout.columns.xl}, auto)` }),
      }
    : {};

  return (
    <footer
      style={gridBreakpoints}
      className={cn(css.footer, {
        [css.grid]: !!footerLayout?.columns,
        [css.grid_sm]: !!footerLayout?.columns?.sm,
        [css.grid_md]: !!footerLayout?.columns?.md,
        [css.grid_lg]: !!footerLayout?.columns?.lg,
        [css.grid_xl]: !!footerLayout?.columns?.xl,
      })}
    >
      {components.map((component) => component.render())}
    </footer>
  );
};

export default Footer;
