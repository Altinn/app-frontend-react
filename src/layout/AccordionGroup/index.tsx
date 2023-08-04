import React from 'react';

import { AccordionGroup as AccordionGroupComponent } from 'src/layout/AccordionGroup/AccordionGroup';
import { AccordionGroupDef } from 'src/layout/AccordionGroup/config.def.generated';
import { AccordionGroupHierarchyGenerator } from 'src/layout/AccordionGroup/hierarchy';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class AccordionGroup extends AccordionGroupDef {
  private _hierarchyGenerator = new AccordionGroupHierarchyGenerator();

  render(props: PropsFromGenericComponent<'AccordionGroup'>): React.JSX.Element | null {
    return <AccordionGroupComponent {...props} />;
  }

  hierarchyGenerator(): ComponentHierarchyGenerator<'AccordionGroup'> {
    return this._hierarchyGenerator;
  }
}
