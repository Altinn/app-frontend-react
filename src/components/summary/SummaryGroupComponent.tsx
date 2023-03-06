import React from 'react';

import { Grid, makeStyles, Typography } from '@material-ui/core';
import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks/useAppSelector';
import { ErrorPaper } from 'src/components/message/ErrorPaper';
import { EditButton } from 'src/components/summary/EditButton';
import { GroupInputSummary } from 'src/components/summary/GroupInputSummary';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import { ComponentType } from 'src/layout';
import { AltinnAppTheme } from 'src/theme/altinnAppTheme';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ISummaryComponent } from 'src/components/summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/hierarchy';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export interface ISummaryGroupComponent {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNodeFromType<'Summary'>;
  targetNode: LayoutNodeFromType<'Group'>;
  overrides?: ISummaryComponent['overrides'];
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

export function SummaryGroupComponent({
  onChangeClick,
  changeText,
  summaryNode,
  targetNode,
  overrides,
}: ISummaryGroupComponent) {
  const classes = useStyles();
  const textResourceBindings = targetNode.item.textResourceBindings;
  const excludedChildren = summaryNode.item.excludedChildren;
  const display = summaryNode.item.display;

  const removeExcludedChildren = (n: LayoutNode) =>
    !excludedChildren ||
    (!excludedChildren.includes(n.item.id) && !excludedChildren.includes(`${n.item.baseComponentId}`));

  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
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
          return (
            // PRIORITY: Find out if this can be replaced by just calling SummaryComponent
            // again, or using a simpler component
            <GroupInputSummary
              key={n.item.id}
              targetNode={n}
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

    return [
      <DisplayGroupContainer
        key={`${targetNode.item.id}-summary`}
        groupNode={targetNode}
        renderLayoutNode={(n) => (
          <SummaryComponent
            summaryNode={summaryNode}
            overrides={{
              targetNode: n,
              grid: {},
              largeGroup: false,
            }}
          />
        )}
      />,
    ];
  };

  const renderComponents =
    summaryNode.item.largeGroup && overrides?.largeGroup !== false
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
