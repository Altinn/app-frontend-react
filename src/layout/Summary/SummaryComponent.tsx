import React from 'react';

import { Grid } from '@material-ui/core';
import cn from 'classnames';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { useNavigateToNode } from 'src/features/form/layout/NavigateToNode';
import { useSetReturnToView, useSetSummaryNodeOfOrigin } from 'src/features/form/layout/PageNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNavigationParam } from 'src/features/routing/AppRoutingContext';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import { GenericComponent } from 'src/layout/GenericComponent';
import classes from 'src/layout/Summary/SummaryComponent.module.css';
import { SummaryContent } from 'src/layout/Summary/SummaryContent';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { Hidden, useNode } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ExprResolved } from 'src/features/expressions/types';
import type { IGrid, IPageBreak } from 'src/layout/common.generated';
import type { SummaryDisplayProperties } from 'src/layout/Summary/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SummaryOverrides {
  targetNode: LayoutNode;
  grid?: IGrid;
  largeGroup?: boolean;
  display?: SummaryDisplayProperties;
  pageBreak?: ExprResolved<IPageBreak>;
}

export interface ISummaryComponent {
  summaryNode: LayoutNode<'Summary'> | undefined;
  overrides?: Partial<SummaryOverrides>;
}

function _SummaryComponent({ summaryNode, overrides }: ISummaryComponent, ref: React.Ref<HTMLDivElement>) {
  const summaryItem = useNodeItem(summaryNode);
  const _targetNode = useNode(summaryItem.componentRef);
  const display = overrides?.display ?? summaryItem.display;
  const targetNode = overrides?.targetNode ?? _targetNode;
  const grid = overrides?.grid ?? summaryItem.grid;

  return (
    <SummaryComponentRaw
      ref={ref}
      overrides={{
        ...overrides,
        display,
        targetNode,
        grid,
      }}
      summaryNode={summaryNode}
    />
  );
}

export const SummaryComponent = React.forwardRef(_SummaryComponent);

function _SummaryComponentRaw({ summaryNode, overrides }: ISummaryComponent, ref: React.Ref<HTMLDivElement>) {
  const { display, grid, targetNode, pageBreak } = overrides ?? {};
  const { langAsString } = useLanguage();
  const currentPageId = useNavigationParam('pageKey');

  const targetItem = useNodeItem(targetNode);
  const targetView = targetNode?.pageKey;
  const targetIsHidden = Hidden.useIsHidden(targetNode);

  const validations = useUnifiedValidationsForNode(targetNode);
  const errors = validationsOfSeverity(validations, 'error');

  const navigateTo = useNavigateToNode();
  const setReturnToView = useSetReturnToView();
  const setNodeOfOrigin = useSetSummaryNodeOfOrigin();

  const onChangeClick = async () => {
    if (!targetView || !targetNode) {
      return;
    }

    navigateTo(targetNode, true);
    setReturnToView?.(currentPageId);
    setNodeOfOrigin?.(summaryNode?.id ?? targetNode?.id);
  };

  if (!targetNode || !targetItem || targetIsHidden || targetItem.type === 'Summary') {
    // TODO: Show info to developers if target node is not found?
    return null;
  }

  const displayGrid = display && display.useComponentGrid ? grid ?? targetItem?.grid : grid;
  const component = targetNode.def;
  const RenderSummary = 'renderSummary' in component ? component.renderSummary.bind(component) : null;
  const shouldShowBorder =
    RenderSummary && 'renderSummaryBoilerplate' in component && component?.renderSummaryBoilerplate();

  return (
    <Grid
      ref={ref}
      item={true}
      xs={displayGrid?.xs || 12}
      sm={displayGrid?.sm || false}
      md={displayGrid?.md || false}
      lg={displayGrid?.lg || false}
      xl={displayGrid?.xl || false}
      data-testid={`summary-${targetNode?.id ?? summaryNode?.id ?? 'unknown'}`}
      data-componentid={summaryNode?.id ?? `summary-${targetNode?.id}`}
      data-componentbaseid={summaryNode?.baseId ?? `summary-${targetNode.id}`}
      className={cn(pageBreakStyles(pageBreak ?? targetItem?.pageBreak))}
    >
      <Grid
        container={true}
        className={cn({
          [classes.border]: !display?.hideBottomBorder && shouldShowBorder,
        })}
      >
        {RenderSummary && 'renderSummaryBoilerplate' in component ? (
          <SummaryContent
            onChangeClick={onChangeClick}
            changeText={langAsString('form_filler.summary_item_change')}
            summaryNode={summaryNode}
            targetNode={targetNode}
            overrides={overrides}
            RenderSummary={RenderSummary}
          />
        ) : (
          <GenericComponent node={targetNode} />
        )}
        {errors.length && targetItem.type !== 'Group' && !display?.hideValidationMessages ? (
          <Grid
            container={true}
            style={{ paddingTop: '12px' }}
            spacing={2}
          >
            {errors.map(({ message }) => (
              <ErrorPaper
                key={`key-${message.key}`}
                message={
                  <Lang
                    id={message.key}
                    params={message.params}
                    node={targetNode}
                  />
                }
              />
            ))}
            <Grid
              item={true}
              xs={12}
            >
              {!display?.hideChangeButton && (
                <button
                  className={classes.link}
                  onClick={onChangeClick}
                  type='button'
                >
                  <Lang id={'form_filler.summary_go_to_correct_page'} />
                </button>
              )}
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
}

export const SummaryComponentRaw = React.forwardRef(_SummaryComponentRaw);
