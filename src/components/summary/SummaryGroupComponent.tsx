import * as React from 'react';
import { shallowEqual } from 'react-redux';

import { Grid, makeStyles, Typography } from '@material-ui/core';
import cn from 'classnames';

import { useAppSelector } from 'src/common/hooks';
import ErrorPaper from 'src/components/message/ErrorPaper';
import { EditButton } from 'src/components/summary/EditButton';
import { GroupInputSummary } from 'src/components/summary/GroupInputSummary';
import { useResolvedNode } from 'src/features/expressions/useResolvedNode';
import { DisplayGroupContainer } from 'src/features/form/containers/DisplayGroupContainer';
import { renderLayoutComponent } from 'src/features/form/containers/Form';
import appTheme from 'src/theme/altinnAppTheme';
import { getDisplayFormDataForComponent, getFormDataForComponentInRepeatingGroup } from 'src/utils/formComponentUtils';
import { getRepeatingGroupStartStopIndex } from 'src/utils/formLayout';
import { getLanguageFromKey } from 'src/utils/sharedUtils';
import { getTextFromAppOrDefault } from 'src/utils/textResource';
import type { ComponentFromSummary } from 'src/features/form/containers/DisplayGroupContainer';
import type { ILayoutGroup } from 'src/layout/Group/types';
import type { ILayout, ILayoutComponent } from 'src/layout/layout';
import type { SummaryDisplayProperties } from 'src/layout/Summary/types';
import type { IRuntimeState } from 'src/types';
import type { AnyNode } from 'src/utils/layout/hierarchy.types';

export interface ISummaryGroupComponent {
  pageRef?: string;
  componentRef?: string;
  index?: number;
  changeText: string | null;
  onChangeClick: () => void;
  largeGroup?: boolean;
  parentGroup?: string;
  display?: SummaryDisplayProperties;
  excludedChildren?: string[];
}

export function getComponentForSummaryGroup(layout: ILayout | undefined, groupId: string): ILayoutGroup | undefined {
  return layout?.find((component) => component.id === groupId) as ILayoutGroup;
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
    fontSize: '1.8rem',
    '& p': {
      fontWeight: 500,
      fontSize: '1.8rem',
    },
  },
  labelWithError: {
    color: appTheme.altinnPalette.primary.red,
    '& p': {
      color: appTheme.altinnPalette.primary.red,
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
    fontSize: '1.6rem',
    marginTop: 4,
  },
});

function SummaryGroupComponent({
  pageRef,
  componentRef,
  index,
  parentGroup,
  largeGroup,
  onChangeClick,
  changeText,
  display,
  excludedChildren,
}: ISummaryGroupComponent) {
  const classes = useStyles();

  const [title, setTitle] = React.useState<string>('');

  const legacyGroupComponent = useAppSelector(
    (state) =>
      (state.formLayout.layouts &&
        pageRef &&
        componentRef &&
        getComponentForSummaryGroup(state.formLayout.layouts[pageRef], componentRef)) ||
      undefined,
    shallowEqual,
  );

  const node = useResolvedNode(legacyGroupComponent);
  const textResourceBindings = node?.item.textResourceBindings;

  const removeExcludedChildren = (n: AnyNode<'resolved'>) =>
    !excludedChildren ||
    !excludedChildren.includes(n.item.id) ||
    !excludedChildren.includes(`${n.item.baseComponentId}`);

  const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
  const formData = useAppSelector((state) => state.formData.formData);
  const textResources = useAppSelector((state) => state.textResources.resources);
  const language = useAppSelector((state) => state.language.language);
  const options = useAppSelector((state) => state.optionState.options);
  const attachments = useAppSelector((state: IRuntimeState) => state.attachments.attachments);
  const validations = useAppSelector((state) => state.formValidations.validations);
  const hiddenFields = useAppSelector((state) => new Set(state.formLayout.uiConfig.hiddenFields));

  React.useEffect(() => {
    if (textResources && textResourceBindings) {
      const titleKey = textResourceBindings.title;
      setTitle(
        (titleKey &&
          getTextFromAppOrDefault(
            titleKey,
            textResources,
            {}, // TODO: Figure out if this should pass `language` instead
            [],
            true,
          )) ||
          '',
      );
    }
  }, [textResources, textResourceBindings]);

  const getRepeatingGroup = (containerId: string | undefined) => {
    const id = index !== undefined && index >= 0 && parentGroup ? `${containerId}-${index}` : containerId;
    if (id !== undefined && repeatingGroups && repeatingGroups[id]) {
      return repeatingGroups[id];
    }

    return undefined;
  };

  const { startIndex, stopIndex } = getRepeatingGroupStartStopIndex(
    getRepeatingGroup(componentRef)?.index ?? -1,
    legacyGroupComponent?.edit,
  );

  const groupHasErrors = React.useMemo(() => {
    if (!largeGroup && node && pageRef) {
      return node.flat(true).some((child) =>
        Object.keys(validations[pageRef]?.[child.item.id] || {}).some((bindingKey: string) => {
          const length = validations[pageRef][child.item.id][bindingKey]?.errors?.length;
          return length && length > 0;
        }),
      );
    }

    return false;
  }, [node, largeGroup, pageRef, validations]);

  const createRepeatingGroupSummaryComponents = () => {
    if (!node) {
      return [];
    }

    const componentArray: JSX.Element[] = [];
    for (let i = startIndex; i <= stopIndex; ++i) {
      const childSummaryComponents = node
        .children(undefined, i)
        .filter(removeExcludedChildren)
        .map((n) => {
          if (n.isHidden(hiddenFields)) {
            return;
          }

          const formDataForComponent = getDisplayFormDataForComponent(
            formData,
            attachments,
            n.item as ILayoutComponent,
            textResources,
            options,
            repeatingGroups,
          );

          return (
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
          key={i}
          className={classes.border}
        >
          {childSummaryComponents}
        </div>,
      );
    }

    return componentArray;
  };

  const createRepeatingGroupSummaryForLargeGroups = () => {
    if (!node) {
      return;
    }

    const componentArray: JSX.Element[] = [];
    for (let i = startIndex; i <= stopIndex; i++) {
      const groupContainer = {
        ...node.item,
        children: [],
      } as ILayoutGroup;

      const childSummaryComponents: ComponentFromSummary[] = [];
      node
        .children(undefined, i)
        .filter(removeExcludedChildren)
        .forEach((n) => {
          if (n.isHidden(hiddenFields)) {
            return;
          }

          const summaryId = `${n.item.id}-summary${n.item.type === 'Group' ? '-group' : ''}`;
          let formDataForComponent: any;
          if (n.item.type !== 'Group') {
            formDataForComponent = getFormDataForComponentInRepeatingGroup(
              formData,
              attachments,
              n.item as ILayoutComponent,
              i,
              legacyGroupComponent?.dataModelBindings?.group,
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
            index: i,
            parentGroup: n.item.type === 'Group' ? legacyGroupComponent?.id : undefined,
            display,
            excludedChildren,
          };

          childSummaryComponents.push(summaryComponent);
        });

      componentArray.push(
        <DisplayGroupContainer
          key={`${groupContainer.id}-summary`}
          id={`${groupContainer.id}-${i}-summary`}
          components={childSummaryComponents}
          container={groupContainer}
          renderLayoutComponent={renderLayoutComponent}
        />,
      );
    }
    return componentArray;
  };

  const isEmpty = stopIndex - startIndex < 0;

  const renderComponents: any = largeGroup
    ? createRepeatingGroupSummaryForLargeGroups()
    : createRepeatingGroupSummaryComponents();

  if (!language) {
    return null;
  }

  if (!isEmpty && largeGroup) {
    return renderComponents;
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

export default SummaryGroupComponent;
