import React from 'react';

import { Grid } from '@material-ui/core';
import cn from 'classnames';

import { GroupSummary } from 'src/layout/Group/GroupSummary';
import classes from 'src/layout/Summary2/SummaryComponent2/SummaryComponent2.module.css';
import { gridBreakpoints, pageBreakStyles } from 'src/utils/formComponentUtils';
import { useNode } from 'src/utils/layout/NodesContext';
import type { CompSummary2External, CompSummary2Internal } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ComponentSummaryProps {
  componentNode: LayoutNode;
  summaryOverrides: CompSummary2Internal['overWriteProperties'];
  hierarchyLevel?: number;
}

interface ResolveComponentProps {
  summaryProps: CompSummary2External;
  summaryOverrides: any;
}

export function ComponentSummary({ componentNode, summaryOverrides, hierarchyLevel = 0 }: ComponentSummaryProps) {
  if (componentNode.isHidden()) {
    return null;
  }

  const overrides = summaryOverrides?.find((override) => override.componentId === componentNode.item.id);

  const childComponents =
    componentNode.item.type === 'Group' &&
    componentNode.item.childComponents.map((child) => (
      <ComponentSummary
        componentNode={child}
        hierarchyLevel={hierarchyLevel + 1}
        key={child.item.id}
        summaryOverrides={summaryOverrides}
      />
    ));

  const renderedComponent = componentNode.def.renderSummary2
    ? componentNode.def.renderSummary2(componentNode as LayoutNode<any>, overrides)
    : null;

  if (!renderedComponent) {
    return null;
  }

  const isGroup = componentNode.item.type === 'Group';

  return (
    <Grid
      item={true}
      className={cn(pageBreakStyles(componentNode.item?.pageBreak), classes.summaryItem)}
      {...gridBreakpoints(componentNode.item.grid)}
    >
      {renderedComponent}
      {isGroup && (
        <GroupSummary
          componentNode={componentNode as LayoutNode<'Group'>}
          hierarchyLevel={hierarchyLevel}
          childComponents={childComponents || null}
        />
      )}
    </Grid>
  );
}

export function ResolveComponent({ summaryProps, summaryOverrides }: ResolveComponentProps) {
  const resolvedComponent = useNode(summaryProps.whatToRender.id);

  if (!resolvedComponent) {
    return null;
  }

  return (
    <ComponentSummary
      componentNode={resolvedComponent}
      summaryOverrides={summaryOverrides}
    />
  );
}
