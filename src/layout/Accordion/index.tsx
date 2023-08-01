import React from 'react';

import { Accordion as AccordionComponent } from 'src/layout/Accordion/Accordion';
import { AccordionDef } from 'src/layout/Accordion/config.generated';
import { AccordionHierarchyGenerator } from 'src/layout/Accordion/hierarchy';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IAccordion, ILayoutAccordion } from 'src/layout/Accordion/types';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class Accordion extends AccordionDef {
  private _hierarchyGenerator = new AccordionHierarchyGenerator();

  render(props: PropsFromGenericComponent<'Accordion'>): React.JSX.Element | null {
    return <AccordionComponent {...props} />;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'Accordion'> {
    return this._hierarchyGenerator;
  }
}

export const Config = {
  def: new Accordion(),
  rendersWithLabel: false as const,
};

export type TypeConfig = {
  layout: ILayoutAccordion;
  nodeItem: IAccordion;
  nodeObj: LayoutNode;
  validTextResourceBindings: 'title';
  validDataModelBindings: undefined;
};
