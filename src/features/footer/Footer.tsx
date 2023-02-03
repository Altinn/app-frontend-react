import React from 'react';

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

  return <footer className={css['footer']}>{components.map((component) => component.render())}</footer>;
};

export default Footer;
