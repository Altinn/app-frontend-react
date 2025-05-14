import React from 'react';
import type { JSX, PropsWithChildren } from 'react';

import cn from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useHasOnlyEmptyChildren, useReportSummaryEmptyRender } from 'src/layout/Summary2/isEmpty/EmptyChildrenContext';
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

function SummaryFlexInternal({ target, children, className }: Omit<SummaryFlexProps, 'isEmpty'>) {
  const pageBreak = useNodeItem(target, (i) => i.pageBreak);
  const grid = useNodeItem(target, (i) => i.grid);

  return (
    <Flex
      item
      className={cn(pageBreakStyles(pageBreak), classes.summaryItem, className)}
      size={grid}
      data-summary-target={target.id}
      data-summary-target-type={target.type}
    >
      {children}
    </Flex>
  );
}

export function SummaryFlex({ target, className, isEmpty, children }: SummaryFlexProps) {
  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  const isHidden = useIsHidden(target);
  const isHiddenBecauseEmpty = useIsHiddenBecauseEmpty(target, isEmpty);
  const hiddenClass =
    isHidden || isHiddenBecauseEmpty ? (hiddenOverride === 'disabled' ? classes.greyedOut : classes.hidden) : undefined;

  useReportSummaryEmptyRender(isHidden || isEmpty);

  if ((isHidden || isHiddenBecauseEmpty) && (hiddenOverride === false || hiddenOverride === 'hide')) {
    return null;
  }

  return (
    <SummaryFlexInternal
      target={target}
      className={cn(className, hiddenClass)}
    >
      {children}
    </SummaryFlexInternal>
  );
}

interface HideWhenAllChildrenEmptyProps {
  when: boolean | undefined;
}

export function SummaryFlexHideWhenAllChildrenEmpty({
  when,
  target,
  children,
}: HideWhenAllChildrenEmptyProps & Pick<SummaryFlexProps, 'target' | 'children'>) {
  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  const hasOnlyEmptyChildren = useHasOnlyEmptyChildren();

  if (hasOnlyEmptyChildren && when === true && (hiddenOverride === false || hiddenOverride !== 'show')) {
    // We still have to render out the actual children, otherwise the unmount effect would just decrement the number
    // of empty components and we'd bounce back to the initial state. Without this, and the unmount effect, the children
    // could never report changes and go from being empty to not being empty anymore.
    return (
      <SummaryFlexInternal
        target={target}
        className={hiddenOverride === 'disabled' ? classes.greyedOut : classes.hidden}
      >
        {children}
      </SummaryFlexInternal>
    );
  }

  return (
    <SummaryFlexInternal
      target={target}
      className={classes.visible}
    >
      {children}
    </SummaryFlexInternal>
  );
}

interface ExtraRenderProp {
  render: (className: string, isEmpty: boolean) => JSX.Element;
}

export function HideWhenAllChildrenEmpty({ when, render }: HideWhenAllChildrenEmptyProps & ExtraRenderProp) {
  const hiddenOverride = useDevToolsStore((state) => state.isOpen && state.hiddenComponents);
  const hasOnlyEmptyChildren = useHasOnlyEmptyChildren();

  if (hasOnlyEmptyChildren && when === true && (hiddenOverride === false || hiddenOverride !== 'show')) {
    // We still have to render out the actual children, otherwise the unmount effect would just decrement the number
    // of empty components and we'd bounce back to the initial state. Without this, and the unmount effect, the children
    // could never report changes and go from being empty to not being empty anymore.
    return hiddenOverride === 'disabled'
      ? render(classes.greyedOut, hasOnlyEmptyChildren)
      : render(classes.hidden, hasOnlyEmptyChildren);
  }

  return render(classes.visible, hasOnlyEmptyChildren);
}
