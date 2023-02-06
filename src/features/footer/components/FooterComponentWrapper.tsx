import React from 'react';

import css from 'src/features/footer/components/FooterComponentWrapper.module.css';
import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

interface IFooterComponentWrapper {
  id: string;
  props: IFooterComponent<IFooterComponentType>;
  childRenderer: (props: IFooterComponent<IFooterComponentType>) => JSX.Element | null;
}

export const FooterComponentWrapper = ({ id, props, childRenderer }: IFooterComponentWrapper) => {
  return (
    <div
      key={id}
      className={css.wrapper}
    >
      {childRenderer(props)}
    </div>
  );
};
