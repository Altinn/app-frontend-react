import React, { useEffect, useState } from 'react';

import { Button, ButtonColor, ButtonVariant } from '@altinn/altinn-design-system';
import { createTheme, makeStyles, TableCell } from '@material-ui/core';
import cn from 'classnames';

import { ExprDefaultsForGroup } from 'src/features/expressions';
import { useExpressions } from 'src/features/expressions/useExpressions';
import { getFormDataForComponentInRepeatingGroup } from 'src/utils/formComponentUtils';
import type { IFormData } from 'src/features/form/data';
import type { ComponentExceptGroup, ILayoutCompInput, ILayoutComponent, ILayoutGroup } from 'src/features/form/layout';
import type { IAttachments } from 'src/shared/resources/attachments';
import type { IOptions, IRepeatingGroups, ITextResource, ITextResourceBindings } from 'src/types';

import { AltinnTableRow } from 'altinn-shared/components';
import { DeleteWarningPopover } from 'altinn-shared/components/molecules/DeleteWarningPopover';
import altinnAppTheme from 'altinn-shared/theme/altinnAppTheme';
import { getLanguageFromKey, getTextResourceByKey } from 'altinn-shared/utils';
import type { ILanguage } from 'altinn-shared/types';

export interface IRepeatingGroupTableRowProps {
  id: string;
  container: ILayoutGroup;
  components: (ILayoutComponent | ILayoutGroup)[];
  repeatingGroups: IRepeatingGroups | null;
  formData: IFormData;
  attachments: IAttachments;
  options: IOptions;
  textResources: ITextResource[];
  language: ILanguage;
  editIndex: number;
  setEditIndex: (index: number, forceValidation?: boolean) => void;
  onClickRemove: (groupIndex: number) => void;
  deleting: boolean;
  index: number;
  rowHasErrors: boolean;
  tableComponents: ILayoutComponent<ComponentExceptGroup>[];
  setDisplayDeleteColumn: (displayDeleteColumn: boolean) => void;
}

const theme = createTheme(altinnAppTheme);

const useStyles = makeStyles({
  editingRow: {
    backgroundColor: 'rgba(227, 247, 255, 0.5)',
    '& td': {
      borderBottom: 0,
      '&:nth-child(1)': {
        padding: 0,
        '&::before': {
          display: 'block',
          content: "' '",
          marginTop: '-12px',
          width: '100%',
          position: 'absolute',
          borderTop: `2px dotted ${theme.altinnPalette.primary.blueMedium}`,
        },
        '& span': {
          padding: '36px',
        },
      },
    },
  },
  aboveEditingRow: {
    '& td': {
      borderColor: 'transparent',
    },
  },
  popoverCurrentCell: {
    zIndex: 1,
    position: 'relative',
  },
  buttonInCellWrapper: {
    display: 'inline-flex',
    justifyContent: 'right',
    width: '100%',
  },
});

function getEditButtonText(
  language: ILanguage,
  isEditing: boolean,
  textResources: ITextResource[],
  textResourceBindings?: ITextResourceBindings,
) {
  if (isEditing && textResourceBindings?.edit_button_close) {
    return getTextResourceByKey(textResourceBindings?.edit_button_close, textResources);
  } else if (!isEditing && textResourceBindings?.edit_button_open) {
    return getTextResourceByKey(textResourceBindings?.edit_button_open, textResources);
  }

  return isEditing
    ? getLanguageFromKey('general.save_and_close', language)
    : getLanguageFromKey('general.edit_alt', language);
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

export function RepeatingGroupTableRow({
  id,
  container,
  components,
  editIndex,
  formData,
  attachments,
  options,
  textResources,
  language,
  repeatingGroups,
  setEditIndex,
  onClickRemove,
  deleting,
  index,
  rowHasErrors,
  tableComponents,
  setDisplayDeleteColumn,
}: IRepeatingGroupTableRowProps): JSX.Element {
  const classes = useStyles();

  const edit = useExpressions(container.edit, {
    forComponentId: id,
    rowIndex: index,
    defaults: ExprDefaultsForGroup.edit,
  });

  useEffect(() => {
    if (edit?.deleteButton) {
      setDisplayDeleteColumn(true);
    }
  }, [edit?.deleteButton, setDisplayDeleteColumn]);

  const textResourceBindingsForRow = useExpressions(container.textResourceBindings, {
    forComponentId: id,
    rowIndex: index,
    defaults: ExprDefaultsForGroup.textResourceBindings,
  });

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

  const editButtonText = rowHasErrors
    ? getLanguageFromKey('general.edit_alt_error', language)
    : getEditButtonText(language, editIndex === index, textResources, textResourceBindingsForRow);

  const deleteButtonText = getLanguageFromKey('general.delete', language);

  const firstCellData = getFormDataForComponent(components[0], index);

  return (
    <AltinnTableRow
      valid={!rowHasErrors}
      key={`repeating-group-row-${index}`}
      className={cn(
        {
          [classes.editingRow]: index === editIndex,
        },
        {
          [classes.aboveEditingRow]: index === editIndex - 1,
        },
      )}
    >
      {tableComponents.map((component: ILayoutComponent) => (
        <TableCell
          key={`${component.id}-${index}`}
          align={getTextAlignment(component)}
        >
          <span>{index !== editIndex ? getFormDataForComponent(component, index) : null}</span>
        </TableCell>
      ))}
      <TableCell
        style={{ width: '185px', padding: '4px' }}
        key={`edit-${index}`}
        colSpan={edit?.deleteButton ? 1 : 2}
      >
        <div className={classes.buttonInCellWrapper}>
          <Button
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Secondary}
            iconName={rowHasErrors ? 'Warning' : 'Edit'}
            iconPlacement='right'
            onClick={() => handleEditClick(index)}
            aria-label={`${editButtonText}-${firstCellData}`}
            data-testid='edit-button'
          >
            {editButtonText}
          </Button>
        </div>
      </TableCell>
      {edit?.deleteButton && (
        <TableCell
          style={{ width: '120px', padding: '4px' }}
          key={`delete-${index}`}
          className={cn({
            [classes.popoverCurrentCell]: index == popoverPanelIndex,
          })}
        >
          <div className={classes.buttonInCellWrapper}>
            <DeleteWarningPopover
              trigger={
                <Button
                  variant={ButtonVariant.Quiet}
                  color={ButtonColor.Danger}
                  iconName='Delete'
                  iconPlacement='right'
                  disabled={deleting}
                  onClick={() => handleDeleteClick(index)}
                  aria-label={`${deleteButtonText}-${firstCellData}`}
                  data-testid='delete-button'
                >
                  {deleteButtonText}
                </Button>
              }
              side='left'
              language={language}
              deleteButtonText={getLanguageFromKey('group.row_popover_delete_button_confirm', language)}
              messageText={getLanguageFromKey('group.row_popover_delete_message', language)}
              open={popoverPanelIndex == index && popoverOpen}
              setPopoverOpen={setPopoverOpen}
              onCancelClick={() => onOpenChange(index)}
              onPopoverDeleteClick={handlePopoverDeleteClick(index)}
            />
          </div>
        </TableCell>
      )}
    </AltinnTableRow>
  );
}
