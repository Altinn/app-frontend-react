import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { CardGroup as CardGroupComponent } from 'src/layout/CardGroup/CardGroupComponent';
import { CardGroupDef } from 'src/layout/CardGroup/config.def.generated';
import { CardGroupHierarchyGenerator } from 'src/layout/CardGroup/hierarchy';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class CardGroup extends CardGroupDef {
  private _hierarchyGenerator = new CardGroupHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'CardGroup'>>(
    function LayoutComponentCardGroupRender(props, _): JSX.Element | null {
      return <CardGroupComponent {...props} />;
    },
  );

  shouldRenderInAutomaticPDF() {
    return false;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'CardGroup'> {
    return this._hierarchyGenerator;
  }

  getDisplayData(_node: LayoutNode<'CardGroup'>): string {
    return '';
  }

  renderSummary(): JSX.Element | null {
    return null;
  }

  validateDataModelBindings(): string[] {
    return [];
  }
}
