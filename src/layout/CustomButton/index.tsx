import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { CustomButtonDef } from 'src/layout/CustomButton/config.def.generated';
import { CustomButtonComponent } from 'src/layout/CustomButton/CustomButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ExprResolver, StoreFactoryProps } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class CustomButton extends CustomButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'CustomButton'>>(
    function LayoutComponentCustomButtonRender(props, _): JSX.Element | null {
      return <CustomButtonComponent {...props} />;
    },
  );

  storeFactory(props: StoreFactoryProps<'CustomButton'>) {
    return this.defaultStoreFactory(props);
  }

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'CustomButton'>) {
    return {
      ...item,
      ...evalCommon(),
      ...evalTrb(),
    };
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }

  getDisplayData(_node: LayoutNode<'Grid'>): string {
    return '';
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
