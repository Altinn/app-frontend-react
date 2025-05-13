import React from 'react';
import type { PropsWithChildren } from 'react';

import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useReportSummaryEmptyRender } from 'src/layout/Summary2/isEmpty/EmptyChildrenContext';
import classes from 'src/layout/Summary2/Summary2.module.css';
import { useSummaryOverrides, useSummaryProp } from 'src/layout/Summary2/summaryStoreContext';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { Hidden, useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ComponentSummaryProps<T extends CompTypes = CompTypes> {
  componentNode: LayoutNode<T>;
}

export function ComponentSummaryById({
  componentId,
  ...rest
}: { componentId: string } & Omit<ComponentSummaryProps, 'componentNode'>) {
  const componentNode = useNode(componentId);
  if (!componentNode) {
    return null;
  }

  return (
    <ComponentSummary
      componentNode={componentNode}
      {...rest}
    />
  );
}

export function ComponentSummary<T extends CompTypes>({ componentNode }: ComponentSummaryProps<T>) {
  const def = componentNode.def;
  const contentIsEmpty = def.useIsEmpty(componentNode as never);
  const renderedComponent = def.renderSummary2 ? def.renderSummary2({ target: componentNode as never }) : null;

  const hidden = useIsHidden(componentNode) || !renderedComponent;
  useReportSummaryEmptyRender(hidden || contentIsEmpty);

  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  if (hidden && (hiddenOverride === false || hiddenOverride === 'hide')) {
    return null;
  }

  return renderedComponent;
}

function useIsHidden<T extends CompTypes>(componentNode: LayoutNode<T>) {
  const override = useSummaryOverrides(componentNode);
  const hideEmptyFields = useSummaryProp('hideEmptyFields');
  const isRequired = useNodeItem(componentNode, (i) => ('required' in i ? i.required : false));
  const forceShowInSummary = useNodeItem(componentNode, (i) => i['forceShowInSummary']);
  const isHidden = Hidden.useIsHidden(componentNode);

  const hideIfEmpty = hideEmptyFields && !isRequired && !forceShowInSummary;
  const hiddenOrNotRendered = isHidden || override?.hidden;
  const contentIsEmpty = componentNode.def.useIsEmpty(componentNode as never);

  return hiddenOrNotRendered || (hideIfEmpty && contentIsEmpty);
}

interface SummaryFlexProps extends PropsWithChildren {
  target: LayoutNode;
  className?: string;
}

export function SummaryFlex({ target, className, children }: SummaryFlexProps) {
  const pageBreak = useNodeItem(target, (i) => i.pageBreak);
  const grid = useNodeItem(target, (i) => i.grid);
  const hidden = useIsHidden(target);
  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  const hiddenClass = hidden && hiddenOverride === 'disabled' ? classes.greyedOut : undefined;

  return (
    <Flex
      item
      className={cn(pageBreakStyles(pageBreak), classes.summaryItem, className, hiddenClass)}
      size={grid}
      data-summary-target={target.id}
      data-summary-target-type={target.type}
    >
      {children}
    </Flex>
  );
}
