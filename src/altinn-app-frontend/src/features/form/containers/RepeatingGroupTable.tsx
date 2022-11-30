import React, { useState } from 'react';

import { createTheme, Grid, makeStyles, TableCell, TableRow, useMediaQuery } from '@material-ui/core';

import { ExprDefaultsForGroup } from 'src/features/expressions';
import { useExpressions } from 'src/features/expressions/useExpressions';
import AltinnMobileTableItem from 'src/features/form/containers/AltinnMobileTableItem';
import { RepeatingGroupsEditContainer } from 'src/features/form/containers/RepeatingGroupsEditContainer';
import { RepeatingGroupTableRow } from 'src/features/form/containers/RepeatingGroupTableRow';
import { getFormDataForComponentInRepeatingGroup, getTextResource } from 'src/utils/formComponentUtils';
import { createRepeatingGroupComponents } from 'src/utils/formLayout';
import { setupGroupComponents } from 'src/utils/layout';
import { componentHasValidations, repeatingGroupHasValidations } from 'src/utils/validation';
import type { IMobileTableItem } from 'src/features/form/containers/AltinnMobileTableItem';
import type { IFormData } from 'src/features/form/data';
import type { ILayout, ILayoutCompInput, ILayoutComponent, ILayoutGroup } from 'src/features/form/layout';
import type { IAttachments } from 'src/shared/resources/attachments';
import type { IOptions, IRepeatingGroups, ITextResource, ITextResourceBindings, IValidations } from 'src/types';

import { AltinnMobileTable, AltinnTable, AltinnTableBody, AltinnTableHeader } from 'altinn-shared/components';
import altinnAppTheme from 'altinn-shared/theme/altinnAppTheme';
import { getLanguageFromKey, getTextResourceByKey } from 'altinn-shared/utils';
import type { ILanguage } from 'altinn-shared/types';

export interface IRepeatingGroupTableProps {
  id: string;
  container: ILayoutGroup;
  components: (ILayoutComponent | ILayoutGroup)[];
  repeatingGroupIndex: number;
  repeatingGroups: IRepeatingGroups | null;
  repeatingGroupDeepCopyComponents: (ILayoutComponent | ILayoutGroup)[][];
  hiddenFields: string[];
  formData: IFormData;
  attachments: IAttachments;
  options: IOptions;
  textResources: ITextResource[];
  language: ILanguage;
  currentView: string;
  layout: ILayout | null;
  validations: IValidations;
  editIndex: number;
  setEditIndex: (index: number, forceValidation?: boolean) => void;
  onClickRemove: (groupIndex: number) => void;
  setMultiPageIndex?: (index: number) => void;
  multiPageIndex?: number;
  deleting: boolean;
  filteredIndexes?: number[] | null;
}

const theme = createTheme(altinnAppTheme);

const useStyles = makeStyles({
  editContainerInTable: {
    borderTop: `1px solid ${theme.altinnPalette.primary.blueLight}`,
    marginBottom: 0,
  },
  editContainerRow: {
    '&:hover': {
      background: 'unset !important',
    },
    '& td': {
      whiteSpace: 'normal',
    },
  },
  visuallyHidden: {
    border: 0,
    padding: 0,
    margin: 0,
    position: 'absolute',
    height: '1px',
    width: '1px',
    overflow: 'hidden',
    clip: 'rect(1px 1px 1px 1px)',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
});

function getEditButtonText(
  language: ILanguage,
  isEditing: boolean,
  textResources: ITextResource[],
  textResourceBindings?: ITextResourceBindings,
): string {
  if (isEditing && textResourceBindings?.edit_button_close) {
    return getTextResourceByKey(textResourceBindings?.edit_button_close, textResources);
  } else if (!isEditing && textResourceBindings?.edit_button_open) {
    return getTextResourceByKey(textResourceBindings?.edit_button_open, textResources);
  }

  return isEditing
    ? getLanguageFromKey('general.save_and_close', language)
    : getLanguageFromKey('general.edit_alt', language);
}

function getTableTitle(textResourceBindings: ITextResourceBindings) {
  if (textResourceBindings.tableTitle) {
    return textResourceBindings.tableTitle;
  }
  if (textResourceBindings.title) {
    return textResourceBindings.title;
  }
  return '';
}

function getTextAlignment(component: ILayoutComponent): 'left' | 'center' | 'right' {
  const formatting = (component as ILayoutCompInput).formatting;
  if (formatting && formatting.align) {
    return formatting.align;
  }
  if (formatting && formatting.number) {
    return 'right';
  }
  return 'left';
}

export function RepeatingGroupTable({
  id,
  container,
  components,
  repeatingGroupIndex,
  repeatingGroupDeepCopyComponents,
  editIndex,
  formData,
  attachments,
  options,
  textResources,
  currentView,
  hiddenFields,
  language,
  layout,
  repeatingGroups,
  validations,
  setEditIndex,
  onClickRemove,
  setMultiPageIndex,
  multiPageIndex,
  deleting,
  filteredIndexes,
}: IRepeatingGroupTableProps): JSX.Element {
  const classes = useStyles();
  const mobileView = useMediaQuery('(max-width:992px)'); // breakpoint on altinn-modal

  const edit = useExpressions(container.edit, {
    forComponentId: id,
    defaults: ExprDefaultsForGroup.edit,
  });

  const tableHeaderComponentIds = container.tableHeaders || components.map((c) => c.baseComponentId || c.id) || [];

  const componentsDeepCopy: ILayoutComponent[] = JSON.parse(JSON.stringify(components));
  const tableComponents = componentsDeepCopy.filter((component: ILayoutComponent) => {
    const childId = component.baseComponentId || component.id;
    return tableHeaderComponentIds.includes(childId);
  });

  const componentTextResourceBindings: ITextResourceBindings[] = [];
  tableComponents.forEach((component) => {
    componentTextResourceBindings.push(component.textResourceBindings as ITextResourceBindings);
  });

  const componentTextResourceBindingsResolved = useExpressions(componentTextResourceBindings);

  const showTableHeader = repeatingGroupIndex > -1 && !(repeatingGroupIndex == 0 && editIndex == 0);
  const [displayDeleteColumn, setDisplayDeleteColumn] = useState(edit?.deleteButton);
  const [popoverPanelIndex, setPopoverPanelIndex] = useState(-1);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getFormDataForComponent = (component: ILayoutComponent | ILayoutGroup, index: number): string => {
    return getFormDataForComponentInRepeatingGroup(
      formData,
      attachments,
      component,
      index,
      container.dataModelBindings?.group,
      textResources,
      options,
      repeatingGroups,
    );
  };

  const onOpenChange = (index: number) => {
    if (index == popoverPanelIndex && popoverOpen) {
      setPopoverPanelIndex(-1);
    } else {
      setPopoverPanelIndex(index);
    }
  };

  const handlePopoverDeleteClick = (index: number) => {
    return () => {
      onClickRemove(index);
      onOpenChange(index);
      setPopoverOpen(false);
    };
  };

  const handleDeleteClick = (index: number) => {
    if (edit?.alertOnDelete) {
      onOpenChange(index);
    } else {
      onClickRemove(index);
    }
  };

  const handleEditClick = (groupIndex: number) => {
    if (groupIndex === editIndex) {
      setEditIndex(-1);
    } else {
      setEditIndex(groupIndex);
    }
  };

  const childElementHasErrors = (element: ILayoutGroup | ILayoutComponent, index: number) => {
    if (element.type === 'Group') {
      return childGroupHasErrors(element as ILayoutGroup, index);
    }
    return componentHasValidations(validations, currentView, `${element.id}`);
  };

  const childGroupHasErrors = (childGroup: ILayoutGroup, index: number) => {
    if (!repeatingGroups || !layout) {
      return;
    }

    const childGroupIndex = repeatingGroups[childGroup.id]?.index;
    const childGroupComponents = layout.filter((childElement) => childGroup.children?.indexOf(childElement.id) > -1);
    const childRenderComponents = setupGroupComponents(
      childGroupComponents,
      childGroup.dataModelBindings?.group,
      index,
    );
    const deepCopyComponents = createRepeatingGroupComponents(
      childGroup,
      childRenderComponents,
      childGroupIndex,
      textResources,
      hiddenFields,
    );
    return repeatingGroupHasValidations(
      childGroup,
      deepCopyComponents,
      validations,
      currentView,
      repeatingGroups,
      layout,
      hiddenFields,
    );
  };

  const renderRepeatingGroupsEditContainer = () => {
    return (
      editIndex >= 0 && (
        <RepeatingGroupsEditContainer
          className={classes.editContainerInTable}
          container={container}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
          repeatingGroupIndex={repeatingGroupIndex}
          id={id}
          language={language}
          textResources={textResources}
          layout={layout}
          repeatingGroupDeepCopyComponents={repeatingGroupDeepCopyComponents}
          hideSaveButton={edit?.saveButton === false}
          multiPageIndex={multiPageIndex}
          setMultiPageIndex={setMultiPageIndex}
          showSaveAndNextButton={edit?.saveAndNextButton === true}
          filteredIndexes={filteredIndexes}
        />
      )
    );
  };

  return (
    <Grid
      container={true}
      item={true}
      data-testid={`group-${id}`}
      id={`group-${id}`}
    >
      {!mobileView && (
        <AltinnTable id={`group-${id}-table`}>
          {showTableHeader && (
            <AltinnTableHeader
              showBorder={editIndex !== 0}
              id={`group-${id}-table-header`}
            >
              <TableRow>
                {tableComponents.map((component: ILayoutComponent, tableComponentIndex: number) => (
                  <TableCell
                    align={getTextAlignment(component)}
                    key={component.id}
                  >
                    {getTextResource(
                      getTableTitle(componentTextResourceBindingsResolved[tableComponentIndex]),
                      textResources,
                    )}
                  </TableCell>
                ))}
                <TableCell style={{ width: '185px', padding: 0, paddingRight: '10px' }}>
                  <span className={classes.visuallyHidden}>{getLanguageFromKey('general.edit', language)}</span>
                </TableCell>
                {displayDeleteColumn && (
                  <TableCell style={{ width: '120px', padding: 0 }}>
                    <span className={classes.visuallyHidden}>{getLanguageFromKey('general.delete', language)}</span>
                  </TableCell>
                )}
              </TableRow>
            </AltinnTableHeader>
          )}
          <AltinnTableBody id={`group-${id}-table-body`}>
            {repeatingGroupIndex >= 0 &&
              [...Array(repeatingGroupIndex + 1)].map((_x: any, index: number) => {
                const rowHasErrors = repeatingGroupDeepCopyComponents[index].some(
                  (component: ILayoutComponent | ILayoutGroup) => {
                    return childElementHasErrors(component, index);
                  },
                );

                // Check if filter is applied and includes specified index.
                if (filteredIndexes && !filteredIndexes.includes(index)) {
                  return null;
                }

                return (
                  <React.Fragment key={index}>
                    <RepeatingGroupTableRow
                      id={id}
                      container={container}
                      components={components}
                      repeatingGroups={repeatingGroups}
                      formData={formData}
                      attachments={attachments}
                      options={options}
                      textResources={textResources}
                      language={language}
                      editIndex={editIndex}
                      setEditIndex={setEditIndex}
                      onClickRemove={onClickRemove}
                      deleting={deleting}
                      index={index}
                      rowHasErrors={rowHasErrors}
                      tableComponents={tableComponents}
                      setDisplayDeleteColumn={setDisplayDeleteColumn}
                    />
                    {editIndex === index && (
                      <TableRow
                        key={`edit-container-${index}`}
                        className={classes.editContainerRow}
                      >
                        <TableCell
                          style={{ padding: 0, borderBottom: 0 }}
                          colSpan={displayDeleteColumn ? tableComponents.length + 2 : tableComponents.length + 1}
                        >
                          {renderRepeatingGroupsEditContainer()}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
          </AltinnTableBody>
        </AltinnTable>
      )}
      {mobileView && (
        <AltinnMobileTable
          id={`group-${id}-table`}
          showBorder={showTableHeader && editIndex !== 0}
        >
          {repeatingGroupIndex >= 0 &&
            [...Array(repeatingGroupIndex + 1)].map((_x: any, index: number) => {
              const rowHasErrors = repeatingGroupDeepCopyComponents[index].some(
                (component: ILayoutComponent | ILayoutGroup) => {
                  return childElementHasErrors(component, index);
                },
              );
              const items: IMobileTableItem[] = tableComponents.map(
                (component: ILayoutComponent, tableComponentIndex: number) => ({
                  key: component.id,
                  label: getTextResource(
                    getTableTitle(componentTextResourceBindingsResolved[tableComponentIndex]),
                    textResources,
                  ),
                  value: getFormDataForComponent(component, index),
                }),
              );
              return (
                <React.Fragment key={index}>
                  <AltinnMobileTableItem
                    key={`mobile-table-item-${index}`}
                    tableItemIndex={index}
                    container={container}
                    textResources={textResources}
                    language={language}
                    items={items}
                    valid={!rowHasErrors}
                    editIndex={editIndex}
                    onEditClick={() => handleEditClick(index)}
                    getEditButtonText={getEditButtonText}
                    deleteFunctionality={{
                      onDeleteClick: () => handleDeleteClick(index),
                      deleteButtonText: getLanguageFromKey('general.delete', language),
                      popoverPanelIndex,
                      popoverOpen,
                      setPopoverOpen,
                      onPopoverDeleteClick: handlePopoverDeleteClick,
                      onOpenChange,
                    }}
                  />
                  {editIndex === index && renderRepeatingGroupsEditContainer()}
                </React.Fragment>
              );
            })}
        </AltinnMobileTable>
      )}
    </Grid>
  );
}
