import React from 'react';
import { shallowEqual } from 'react-redux';

import { Grid, makeStyles } from '@material-ui/core';
import cn from 'classnames';

import { useAppDispatch } from 'src/common/hooks/useAppDispatch';
import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { SummaryComponentSwitch } from 'src/components/summary/SummaryComponentSwitch';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { ComponentType } from 'src/layout';
import { GenericComponent } from 'src/layout/GenericComponent';
import { getDisplayFormDataForComponent, pageBreakStyles } from 'src/utils/formComponentUtils';
import { useResolvedNode } from 'src/utils/layout/ExprContext';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ComponentExceptGroupAndSummary } from 'src/layout/layout';
import type { IRuntimeState } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { HComponent } from 'src/utils/layout/hierarchy.types';

export interface ISummaryComponent {
  formData?: any; // PRIORITY: Find out if we can omit this, and let every summary component figure itself out
  summaryNode: LayoutNode<HComponent<'Summary'>>;
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

export function SummaryComponent({ formData, summaryNode }: ISummaryComponent) {
  const { id, grid, componentRef, display } = summaryNode.item;
  const { pageRef } = summaryNode.item;
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
  const attachments = useAppSelector((state: IRuntimeState) => state.attachments.attachments);

  const summaryItem = summaryNode.item;
  const targetNode = useResolvedNode(componentRef);
  const targetItem = targetNode?.item;
  const targetComponent = targetNode?.getComponent();

  const goToCorrectPageLinkText = useAppSelector((state) => {
    return (
      state.language.language &&
      getTextFromAppOrDefault(
        'form_filler.summary_go_to_correct_page',
        state.textResources.resources,
        state.language.language,
        [],
        true,
      )
    );
  });
  const calculatedFormData = useAppSelector((state) => {
    if (!targetItem) {
      return undefined;
    }
    if (targetItem.type === 'Group') {
      return undefined;
    }
    if (
      (targetItem.type === 'FileUpload' || targetItem.type === 'FileUploadWithTag') &&
      Object.keys(targetItem.dataModelBindings || {}).length === 0
    ) {
      return undefined;
    }
    return (
      formData ||
      getDisplayFormDataForComponent(
        state.formData.formData,
        attachments,
        targetItem,
        state.textResources.resources,
        state.optionState.options,
        state.formLayout.uiConfig.repeatingGroups,
        true,
      )
    );
  }, shallowEqual);

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
    return null;
  }

  const change = {
    onChangeClick,
    changeText,
  };

  // PRIORITY: Check to make sure we can treat non-repeating groups the same as repeating groups
  // if (targetItem?.type === 'Group' && (!targetItem.maxCount || targetItem.maxCount <= 1)) {
  //   // Non-repeating group: display children as summary components
  //   return (
  //     <DisplayGroupContainer
  //       key={id}
  //       groupNode={targetNode}
  //       renderLayoutNode={(child) => (
  //         <SummaryComponent
  //           key={`__summary__${child.item.id}`}
  //           // summaryNode={}
  //           id={`__summary__${child.item.id}`}
  //           componentRef={child.item.id}
  //           pageRef={groupProps.pageRef}
  //           largeGroup={groupProps.largeGroup}
  //         />
  //       )}
  //     />
  //   );
  // } else
  if (targetComponent?.getComponentType() === ComponentType.Presentation) {
    // Render non-input components as normal
    return <GenericComponent node={targetNode as LayoutNode<HComponent<ComponentExceptGroupAndSummary>>} />;
  }

  const displayGrid = summaryItem.display && summaryItem.display.useComponentGrid ? targetItem?.grid : grid;
  return (
    <Grid
      item={true}
      xs={displayGrid?.xs || 12}
      sm={displayGrid?.sm || false}
      md={displayGrid?.md || false}
      lg={displayGrid?.lg || false}
      xl={displayGrid?.xl || false}
      data-testid={`summary-${id}`}
      className={cn(pageBreakStyles(summaryItem.pageBreak ?? targetItem?.pageBreak))}
    >
      <Grid
        container={true}
        className={cn({
          [classes.border]: !display?.hideBottomBorder,
        })}
      >
        <SummaryComponentSwitch
          summaryNode={summaryNode}
          targetNode={targetNode}
          change={change}
          label={label}
          formData={calculatedFormData}
        />
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
