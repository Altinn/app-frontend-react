import React from 'react';

import css from 'src/features/footer/components/FooterComponentWrapper.module.css';
import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

interface IFooterComponentWrapper {
  props: IFooterComponent<IFooterComponentType>;
  childRenderer: (props: IFooterComponent<IFooterComponentType>) => JSX.Element | null;
}

export const FooterComponentWrapper = ({ props, childRenderer }: IFooterComponentWrapper) => {
  return <div className={css.wrapper}>{React.createElement(childRenderer, props)}</div>;
};
