import React from 'react';

import { Grid, makeStyles } from '@material-ui/core';
import cn from 'classnames';

import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { GenericComponent } from 'src/layout/GenericComponent';
import { SummaryBoilerplate } from 'src/layout/Summary/SummaryBoilerplate';
import { pageBreakStyles } from 'src/utils/formComponentUtils';
import { useResolvedNode } from 'src/utils/layout/ExprContext';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { IGrid } from 'src/layout/layout';
import type { SummaryDisplayProperties } from 'src/layout/Summary/types';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface ISummaryComponent {
  summaryNode: LayoutNodeFromType<'Summary'>;
  overrides?: {
    targetNode?: LayoutNode;
    grid?: IGrid;
    largeGroup?: boolean;
    display?: SummaryDisplayProperties;
  };
}

const useStyles = makeStyles({
  border: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: '1px dashed #008FD6',
  },
  link: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #008FD6',
    cursor: 'pointer',
    paddingLeft: 0,
  },
});

export function SummaryComponent({ summaryNode, overrides }: ISummaryComponent) {
  const { id, grid, componentRef } = summaryNode.item;
  const { pageRef } = summaryNode.item;
  const display = overrides?.display || summaryNode.item.display;
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const summaryPageName = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const changeText = useAppSelector(
    (state) =>
      state.language.language &&
      getTextFromAppOrDefault(
        'form_filler.summary_item_change',
        state.textResources.resources,
        state.language.language,
        [],
        true,
      ),
  );

  const summaryItem = summaryNode.item;
  const targetNode = useResolvedNode(overrides?.targetNode || componentRef);
  const targetItem = targetNode?.item;

  const goToCorrectPageLinkText = useAppSelector(
    (state) =>
      state.language.language &&
      getTextFromAppOrDefault(
        'form_filler.summary_go_to_correct_page',
        state.textResources.resources,
        state.language.language,
        [],
        true,
      ),
  );

  const label = useAppSelector((state) => {
    const titleKey = targetItem?.textResourceBindings?.title;
    if (titleKey) {
      return (
        state.language.language &&
        getTextFromAppOrDefault(titleKey, state.textResources.resources, state.language.language, [], false)
      );
    }
    return undefined;
  });

  const onChangeClick = () => {
    if (!pageRef) {
      return;
    }

    dispatch(
      FormLayoutActions.updateCurrentView({
        newView: pageRef,
        returnToView: summaryPageName,
        focusComponentId: componentRef,
      }),
    );
  };

  if (!targetNode || !targetItem || targetNode.isHidden() || targetItem.type === 'Summary') {
    // TODO: Show info to developers if target node is not found?
    return null;
  }

  const displayGrid =
    display && display.useComponentGrid ? overrides?.grid || targetItem?.grid : overrides?.grid || grid;

  const component = targetNode.def;
  const RenderSummary = 'renderSummary' in component ? component.renderSummary.bind(component) : null;

  return (
    <Grid
      item={true}
      xs={displayGrid?.xs || 12}
      sm={displayGrid?.sm || false}
      md={displayGrid?.md || false}
      lg={displayGrid?.lg || false}
      xl={displayGrid?.xl || false}
      data-testid={`summary-${overrides?.targetNode?.item.id || id}`}
      data-componentid={summaryItem.baseComponentId ?? summaryItem.id}
      className={cn(pageBreakStyles(summaryItem.pageBreak ?? targetItem?.pageBreak))}
    >
      <Grid
        container={true}
        className={cn({
          [classes.border]: !display?.hideBottomBorder,
        })}
      >
        {RenderSummary && 'renderSummaryBoilerplate' in component ? (
          <>
            {component.renderSummaryBoilerplate() ? (
              <SummaryBoilerplate
                onChangeClick={onChangeClick}
                changeText={changeText}
                label={label}
                summaryNode={summaryNode}
                targetNode={targetNode}
                overrides={overrides}
              />
            ) : null}
            <RenderSummary
              onChangeClick={onChangeClick}
              changeText={changeText}
              summaryNode={summaryNode}
              targetNode={targetNode as any}
              overrides={overrides}
            />
          </>
        ) : (
          <GenericComponent node={targetNode} />
        )}
        {targetNode?.hasValidationMessages('errors') &&
          targetItem.type !== 'Group' &&
          !display?.hideValidationMessages && (
            <Grid
              container={true}
              style={{ paddingTop: '12px' }}
              spacing={2}
            >
              {targetNode?.getUnifiedValidations().errors?.map((error: string) => (
                <ErrorPaper
                  key={`key-${error}`}
                  message={error}
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
                    {goToCorrectPageLinkText}
                  </button>
                )}
              </Grid>
            </Grid>
          )}
      </Grid>
    </Grid>
  );
}
