import React, { forwardRef } from 'react';

import type { PropsFromGenericComponent } from '..';

import { TabDef } from 'src/layout/Tab/config.def.generated';
import { TabHierarchyGenerator } from 'src/layout/Tab/hierarchy';
import { SummaryTabComponent } from 'src/layout/Tab/SummaryTabComponent';
import { Tab as TabComponent } from 'src/layout/Tab/Tab';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { ComponentHierarchyGenerator } from 'src/utils/layout/HierarchyGenerator';

export class Tab extends TabDef {
  private _hierarchyGenerator = new TabHierarchyGenerator();

  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Tab'>>(
    function LayoutComponentTabRender(props, _): JSX.Element | null {
      return <TabComponent {...props} />;
    },
  );

  hierarchyGenerator(): ComponentHierarchyGenerator<'Tab'> {
    return this._hierarchyGenerator;
  }

  renderSummary(props: SummaryRendererProps<'Tab'>): JSX.Element | null {
    return <SummaryTabComponent {...props} />;
  }

  renderSummaryBoilerplate(): boolean {
    return false;
  }
}
