import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import { FooterComponentWrapper } from 'src/features/footer/components/FooterComponentWrapper';
import type { IFooterComponent } from 'src/features/footer/components/types';
import type { IFooterComponentType } from 'src/features/footer/types';

export abstract class FooterComponent<T extends IFooterComponent<IFooterComponentType>> {
  private static wrapper = FooterComponentWrapper;
  private id: string;
  private props: T;

  protected abstract renderComponent: (props: T) => JSX.Element | null;

  public constructor(props: T) {
    this.id = uuidv4();
    this.props = props;
  }

  public render() {
    return React.createElement(FooterComponent.wrapper, {
      key: this.id,
      props: this.props,
      childRenderer: this.renderComponent,
    });
  }
}
