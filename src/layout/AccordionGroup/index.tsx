import React from 'react';

import { AccordionGroup as AccordionGroupComponent } from 'src/layout/AccordionGroup/AccordionGroup';
import { AccordionGroupHierarchyGenerator } from 'src/layout/AccordionGroup/hierarchy';
import { PresentationComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IAccordionGroup, ILayoutAccordionGroup } from 'src/layout/AccordionGroup/types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class AccordionGroup extends PresentationComponent<'AccordionGroup'> {
  private _hierarchyGenerator = new AccordionGroupHierarchyGenerator();

  render(props: PropsFromGenericComponent<'AccordionGroup'>): JSX.Element | null {
    return <AccordionGroupComponent {...props} />;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'AccordionGroup'> {
    return this._hierarchyGenerator;
  }

  renderWithLabel(): boolean {
    return false;
  }
}

export const Config = {
  def: new AccordionGroup(),
};

export type TypeConfig = {
  layout: ILayoutAccordionGroup;
  nodeItem: IAccordionGroup;
  nodeObj: LayoutNode;
};
