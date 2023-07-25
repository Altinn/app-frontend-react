import React from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.generated';
import { ButtonGroupHierarchyGenerator } from 'src/layout/ButtonGroup/hierarchy';
import type { ILayoutCompButtonGroup, ILayoutCompButtonGroupInHierarchy } from 'src/layout/ButtonGroup/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class ButtonGroup extends ButtonGroupDef {
  private _hierarchyGenerator = new ButtonGroupHierarchyGenerator();

  render(props: PropsFromGenericComponent<'ButtonGroup'>): JSX.Element | null {
    return <ButtonGroupComponent {...props} />;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'ButtonGroup'> {
    return this._hierarchyGenerator;
  }

  useDisplayData(_node: LayoutNodeFromType<'ButtonGroup'>): string {
    return '';
  }

  renderSummary(): JSX.Element | null {
    return null;
  }
}

export const Config = {
  def: new ButtonGroup(),
  rendersWithLabel: true as const,
};

export type TypeConfig = {
  layout: ILayoutCompButtonGroup;
  nodeItem: ILayoutCompButtonGroupInHierarchy;
  nodeObj: LayoutNode;
  validTextResourceBindings: undefined;
  validDataModelBindings: undefined;
};
