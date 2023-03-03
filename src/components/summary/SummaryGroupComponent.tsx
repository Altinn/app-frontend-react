import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';
import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { EditButton } from 'src/components/summary/EditButton';
import { GroupInputSummary } from 'src/components/summary/GroupInputSummary';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import { ComponentType } from 'src/layout';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { getDisplayFormDataForComponent } from 'src/utils/formComponentUtils';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ExprUnresolved } from 'src/features/expressions/types';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { IRuntimeState } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { HComponent, HGroups } from 'src/utils/layout/hierarchy.types';

export interface ISummaryGroupComponent {
  changeText: string | null;
  onChangeClick: () => void;
  excludedChildren?: string[];
  summaryNode: LayoutNode<HComponent<'Summary'>>;
  targetNode: LayoutNode<HGroups>;
}

const gridStyle = {
  paddingTop: '12px',
};

const useStyles = makeStyles({
  border: {
    border: '2px solid #EFEFEF',
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    '@media print': {
      pageBreakInside: 'avoid',
    },
  },
  label: {
    fontWeight: 500,
    fontSize: '1.125rem',
    '& p': {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
  },
  labelWithError: {
    color: AltinnAppTheme.altinnPalette.primary.red,
    '& p': {
      color: AltinnAppTheme.altinnPalette.primary.red,
    },
  },
  link: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #008FD6',
    cursor: 'pointer',
    paddingLeft: 0,
  },
  emptyField: {
    fontStyle: 'italic',
    fontSize: '1rem',
    marginTop: 4,
  },
});

export function SummaryGroupComponent({ onChangeClick, changeText, summaryNode, targetNode }: ISummaryGroupComponent) {
  const classes = useStyles();
  const textResourceBindings = targetNode.item.textResourceBindings;
  const excludedChildren = summaryNode.item.excludedChildren;
  const display = summaryNode.item.display;

  const removeExcludedChildren = (n: LayoutNode) =>
    !excludedChildren ||
    (!excludedChildren.includes(n.item.id) && !excludedChildren.includes(`${n.item.baseComponentId}`));

  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const formData = useAppSelector((state) => state.formData.formData);
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
  const options = useAppSelector((state) => state.optionState.options);
  const attachments = useAppSelector((state: IRuntimeState) => state.attachments.attachments);
  const groupHasErrors = targetNode.hasDeepValidationMessages();

  const title = React.useMemo(() => {
    if (textResources && textResourceBindings) {
      const titleKey = textResourceBindings.title;
      if (!titleKey) {
        return '';
      }

      return getTextFromAppOrDefault(titleKey, textResources, language || {}, [], true);
    }

    return '';
  }, [textResources, textResourceBindings, language]);

  const createRepeatingGroupSummaryComponents = () => {
    if (!targetNode || !('rows' in targetNode.item)) {
      return [];
    }

    const componentArray: JSX.Element[] = [];
    for (const row of targetNode.item.rows) {
      if (!row) {
        continue;
      }
      const childSummaryComponents = targetNode
        .children(undefined, row.index)
        .filter(removeExcludedChildren)
        .filter((node) => node.getComponent()?.getComponentType() === ComponentType.Form)
        .map((n) => {
          if (n.isHidden()) {
            return;
          }

          const formDataForComponent = getDisplayFormDataForComponent(
            formData,
            attachments,
            n.item,
            textResources,
            options,
            repeatingGroups,
          );

          return (
            // PRIORITY: Find out if this can be replaced by just calling SummaryComponent
            // again, or using a simpler component
            <GroupInputSummary
              key={n.item.id}
              componentId={n.item.id}
              formData={formDataForComponent}
              textResources={textResources}
            />
          );
        });
      componentArray.push(
        <div
          key={row.index}
          className={classes.border}
        >
          {childSummaryComponents}
        </div>,
      );
    }

    return componentArray;
  };

  const createRepeatingGroupSummaryForLargeGroups = () => {
    if (!targetNode || !('rows' in targetNode.item)) {
      return;
    }

    const componentArray: JSX.Element[] = [];
    for (const row of targetNode.item.rows) {
      if (!row) {
        continue;
      }

      // PRIORITY: Remove this
      const groupContainer = {
        ...targetNode.item,
        children: [],
      } as ExprUnresolved<ILayoutGroup>;

      /*
      const childSummaryComponents: ComponentFromSummary[] = [];
      node
        .children(undefined, row.index)
        .filter(removeExcludedChildren)
        .forEach((n) => {
          if (n.isHidden()) {
            return;
          }

          const summaryId = `${n.item.id}-summary${n.item.type === 'Group' ? '-group' : ''}`;
          const groupDataModelBinding = node?.item.dataModelBindings?.group?.replace(/\[\d+]/g, '');
          let formDataForComponent: any;
          if (n.item.type !== 'Group') {
            formDataForComponent = getFormDataForComponentInRepeatingGroup(
              formData,
              attachments,
              n.item,
              row.index,
              groupDataModelBinding,
              textResources,
              options,
              repeatingGroups,
            );
          }
          groupContainer.children.push(summaryId);

          const summaryComponent: ComponentFromSummary = {
            id: summaryId,
            type: 'Summary',
            componentRef: n.item.id,
            pageRef: pageRef,
            dataModelBindings: {},
            textResourceBindings: {},
            readOnly: false,
            required: false,
            formData: formDataForComponent,
            display,
            excludedChildren,
          };

          childSummaryComponents.push(summaryComponent);
        });
       */

      componentArray.push(
        // PRIORITY: Find a way to avoid faking this
        <DisplayGroupContainer
          key={`${groupContainer.id}-summary`}
          groupNode={targetNode}
          // id={`${groupContainer.id}-${row.index}-summary`}
          // components={childSummaryComponents}
          // container={groupContainer}
          renderLayoutNode={(n) => {
            if (n.isHidden()) {
              return null;
            }

            return (
              <Grid
                item
                xs={12}
              >
                TODO: Here comes {n.item.id}
              </Grid>
            );
            // return <SummaryComponent summaryNode={summaryNode} />;
          }}
        />,
      );
    }
    return componentArray;
  };

  const renderComponents = summaryNode.item.largeGroup
    ? createRepeatingGroupSummaryForLargeGroups()
    : createRepeatingGroupSummaryComponents();

  if (!language || !renderComponents) {
    return null;
  }

  const isEmpty = renderComponents?.length <= 0;

  if (!isEmpty && summaryNode.item.largeGroup) {
    // Tricking our return type to be JSX.Element. Apparently, returning an array causes problems elsewhere.
    return renderComponents as unknown as JSX.Element;
  }

  return (
    <>
      <Grid
        container={true}
        data-testid={'summary-group-component'}
      >
        <Grid
          item={true}
          xs={10}
        >
          <Typography
            variant='body1'
            className={cn(classes.label, groupHasErrors && !display?.hideValidationMessages && classes.labelWithError)}
            component='span'
          >
            {title}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
        >
          {!display?.hideChangeButton && (
            <EditButton
              onClick={onChangeClick}
              editText={changeText}
            />
          )}
        </Grid>
        <Grid
          item
          xs={12}
        >
          {isEmpty ? (
            <Typography
              variant='body1'
              className={classes.emptyField}
              component='p'
            >
              {getLanguageFromKey('general.empty_summary', language)}
            </Typography>
          ) : (
            renderComponents
          )}
        </Grid>
      </Grid>
      {groupHasErrors && !display?.hideValidationMessages && (
        <Grid
          container={true}
          style={gridStyle}
        >
          <ErrorPaper message={getLanguageFromKey('group.row_error', language)} />
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
                {getTextFromAppOrDefault('form_filler.summary_go_to_correct_page', textResources, language, [], true)}
              </button>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
}
