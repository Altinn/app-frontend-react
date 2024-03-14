import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { CustomButtonDef } from 'src/layout/CustomButton/config.def.generated';
import { CustomButtonComponent } from 'src/layout/CustomButton/CustomButtonComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompInternal } from 'src/layout/layout';
import type { ExprResolver } from 'src/layout/LayoutComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class CustomButton extends CustomButtonDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'CustomButton'>>(
    function LayoutComponentCustomButtonRender(props, _): JSX.Element | null {
      return <CustomButtonComponent {...props} />;
    },
  );

  evalExpressions({ item, evalTrb, evalCommon }: ExprResolver<'CustomButton'>): CompInternal<'CustomButton'> {
    return {
      ...item,
      ...evalCommon(item),
      ...evalTrb(item),
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
