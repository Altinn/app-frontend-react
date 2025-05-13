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
  target: LayoutNode<T>;
}

export function ComponentSummaryById({ componentId }: { componentId: string }) {
  const target = useNode(componentId);
  if (!target) {
    return null;
  }

  return <ComponentSummary target={target} />;
}

export function ComponentSummary<T extends CompTypes>({ target }: ComponentSummaryProps<T>) {
  const def = target.def;
  return def.renderSummary2 ? def.renderSummary2({ target: target as never }) : null;
}

function useIsHidden<T extends CompTypes>(node: LayoutNode<T>) {
  const hiddenInOverride = useSummaryOverrides(node)?.hidden;

  // We say that we're not respecting DevTools here, but that's just because Summary2 implements that support
  // on its own, by also supporting 'greying out' hidden components from Summary2.
  const hidden = Hidden.useIsHidden(node, { respectDevTools: false });

  return !!(hidden || hiddenInOverride);
}

function useIsHiddenBecauseEmpty<T extends CompTypes>(node: LayoutNode<T>, isEmpty: boolean) {
  const hideEmptyFields = useSummaryProp('hideEmptyFields');
  const isRequired = useNodeItem(node, (i) => ('required' in i ? i.required : false));
  const forceShowInSummary = useNodeItem(node, (i) => i['forceShowInSummary']);

  return hideEmptyFields && !isRequired && !forceShowInSummary && isEmpty;
}

interface SummaryFlexProps extends PropsWithChildren {
  target: LayoutNode;
  isEmpty: boolean;
  className?: string;
}

export function SummaryFlex({ target, className, isEmpty, children }: SummaryFlexProps) {
  const pageBreak = useNodeItem(target, (i) => i.pageBreak);
  const grid = useNodeItem(target, (i) => i.grid);

  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  const isHiddenNode = useIsHidden(target);
  const isHiddenBecauseEmpty = useIsHiddenBecauseEmpty(target, isEmpty);
  const isHidden = isHiddenNode || isHiddenBecauseEmpty;
  const hiddenClass = isHidden && hiddenOverride === 'disabled' ? classes.greyedOut : undefined;

  useReportSummaryEmptyRender(isHiddenNode || isEmpty);

  if (isHidden && (hiddenOverride === false || hiddenOverride === 'hide')) {
    return null;
  }

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
