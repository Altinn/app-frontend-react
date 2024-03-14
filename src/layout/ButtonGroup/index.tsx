import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.def.generated';
import { ButtonGroupHierarchyGenerator } from 'src/layout/ButtonGroup/hierarchy';
import type { CompExternal } from 'src/layout/layout';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class ButtonGroup extends ButtonGroupDef {
  private _hierarchyGenerator = new ButtonGroupHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ButtonGroup'>>(
    function LayoutComponentButtonGroupRender(props, _): JSX.Element | null {
      return <ButtonGroupComponent {...props} />;
    },
  );

  claimChildren(_item: CompExternal<'ButtonGroup'>, _claimChild: (id: string) => void) {
    // for (const childId of item.children) {
    //   if (childId) {
    //     if (!this.canRenderInButtonGroup(generator, childId)) {
    //       continue;
    //     }
    //
    //     claimChild(childId);
    //   }
    // }
  }

  shouldRenderInAutomaticPDF() {
    return false;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'ButtonGroup'> {
    return this._hierarchyGenerator;
  }

  getDisplayData(_node: LayoutNode<'ButtonGroup'>): string {
    return '';
  }

  renderSummary(): JSX.Element | null {
    return null;
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
