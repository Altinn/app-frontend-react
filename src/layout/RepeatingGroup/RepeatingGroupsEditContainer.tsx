import React from 'react';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { Back, Delete as DeleteIcon, Next } from '@navikt/ds-icons';
import cn from 'classnames';

import { Lang } from 'src/features/language/Lang';
import { GenericComponent } from 'src/layout/GenericComponent';
import classes from 'src/layout/Group/RepeatingGroup.module.css';
import { useRepeatingGroupsFocusContext } from 'src/layout/RepeatingGroup/RepeatingGroupFocusContext';
import type {
  CompGroupRepeatingInternal,
  IGroupEditPropertiesInternal,
} from 'src/layout/RepeatingGroup/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface IRepeatingGroupsEditContainer {
  node: LayoutNode<'RepeatingGroup'>;
  className?: string;
  deleting?: boolean;
  editIndex: number;
  setEditIndex: (index: number, forceValidation?: boolean) => void;
  onClickRemove?: (groupIndex: number) => void;
  forceHideSaveButton?: boolean;
  multiPageIndex?: number;
  setMultiPageIndex?: (index: number) => void;
}

export function RepeatingGroupsEditContainer({
  node,
  editIndex,
  ...props
}: IRepeatingGroupsEditContainer): JSX.Element | null {
  const group = node.item;

  const row = group.rows[editIndex];

  if (!row) {
    return null;
  }

  const shouldHideRow = node.item.rows[editIndex]?.groupExpressions?.hiddenRow;
  if (shouldHideRow) {
    return null;
  }

  return (
    <RepeatingGroupsEditContainerInternal
      node={node}
      editIndex={editIndex}
      group={group}
      row={row}
      {...props}
    />
  );
}

function RepeatingGroupsEditContainerInternal({
  node,
  className,
  deleting,
  editIndex,
  setEditIndex,
  onClickRemove,
  forceHideSaveButton,
  multiPageIndex,
  setMultiPageIndex,
  group,
  row,
}: IRepeatingGroupsEditContainer & {
  group: CompGroupRepeatingInternal;
  row: CompGroupRepeatingInternal['rows'][number];
}): JSX.Element | null {
  const id = node.item.id;
  const textsForRow = row.groupExpressions?.textResourceBindings;
  const editForRow = row.groupExpressions?.edit;
  const editForGroup = group.edit;
  const edit = {
    ...editForGroup,
    ...editForRow,
  } as IGroupEditPropertiesInternal;
  const rowItems = row.items;
  const { refSetter } = useRepeatingGroupsFocusContext();
  const texts = {
    ...group.textResourceBindings,
    ...textsForRow,
  };

  const nextDisplayedGroup = () => {
    const nextDisplayedIndex = group.rows.findIndex(
      (group, idx) => idx > editIndex && group && !group.groupExpressions?.hiddenRow,
    );
    return nextDisplayedIndex > -1 ? nextDisplayedIndex : null;
  };

  const nextIndex: number | null = nextDisplayedGroup();

  const saveClicked = () => {
    setEditIndex(-1);
  };

  const nextClicked = () => {
    if (nextIndex !== null) {
      setEditIndex && setEditIndex(nextIndex, true);
      if (edit.multiPage) {
        setMultiPageIndex && setMultiPageIndex(0);
      }
    }
  };

  const removeClicked = () => {
    onClickRemove && onClickRemove(editIndex);
    if (edit.multiPage) {
      setMultiPageIndex && setMultiPageIndex(0);
    }
  };

  const getGenericComponentsToRender = (): (JSX.Element | null)[] =>
    rowItems.map((n): JSX.Element | null => {
      const isOnOtherMultiPage =
        edit?.multiPage &&
        typeof multiPageIndex === 'number' &&
        multiPageIndex > -1 &&
        n.item.multiPageIndex !== multiPageIndex;

      if (isOnOtherMultiPage) {
        return null;
      }

      if (
        group.tableColumns &&
        n.item.baseComponentId &&
        group.tableColumns[n.item.baseComponentId] &&
        group.tableColumns[n.item.baseComponentId].showInExpandedEdit === false
      ) {
        return null;
      }

      return (
        <GenericComponent
          node={n}
          key={n.item.id}
        />
      );
    });

  const isNested = typeof group.baseComponentId === 'string';
  const saveButtonVisible =
    !forceHideSaveButton && (edit?.saveButton !== false || (edit.saveAndNextButton === true && nextIndex === null));
  const saveAndNextButtonVisible = !forceHideSaveButton && edit.saveAndNextButton === true && nextIndex !== null;

  const hideTable = edit.mode === 'hideTable' || edit.mode === 'showAll';

  return (
    <div
      id={`group-edit-container-${id}-${editIndex}`}
      className={cn(
        isNested ? classes.nestedEditContainer : classes.editContainer,
        { [classes.hideTable]: hideTable, [classes.nestedHideTable]: hideTable && isNested },
        className,
      )}
      style={{ marginBottom: isNested && edit?.mode === 'showAll' ? 15 : undefined }}
      data-testid='group-edit-container'
    >
      {edit?.deleteButton !== false && edit?.mode === 'showAll' && (
        <Grid
          item={true}
          container={true}
          direction='column'
          alignItems='flex-end'
          spacing={3}
        >
          <Grid item={true}>
            <Button
              variant='tertiary'
              color='danger'
              size='small'
              icon={<DeleteIcon />}
              iconPlacement='right'
              disabled={deleting}
              onClick={removeClicked}
              data-testid='delete-button'
            >
              <Lang id={'general.delete'} />
            </Button>
          </Grid>
        </Grid>
      )}
      <Grid
        container={true}
        item={true}
        direction='row'
        spacing={3}
      >
        <Grid
          container={true}
          alignItems='flex-start'
          item={true}
          spacing={3}
          ref={(n) => refSetter && refSetter(editIndex, 'editContainer', n)}
        >
          {getGenericComponentsToRender()}
        </Grid>
        <Grid item={true}>
          {edit?.multiPage && (
            <Grid
              container={true}
              direction='row'
              spacing={1}
              style={{ marginBottom: 12 }}
            >
              {typeof multiPageIndex === 'number' &&
                multiPageIndex > 0 &&
                rowItems.filter((n) => n.item.multiPageIndex === multiPageIndex - 1).length > 0 && (
                  <Grid item={true}>
                    <Button
                      icon={<Back aria-hidden='true' />}
                      size='small'
                      variant='tertiary'
                      color='second'
                      onClick={() => setMultiPageIndex && setMultiPageIndex(multiPageIndex - 1)}
                    >
                      <Lang id={'general.back'} />
                    </Button>
                  </Grid>
                )}
              {typeof multiPageIndex === 'number' &&
                multiPageIndex > -1 &&
                rowItems.filter((n) => n.item.multiPageIndex === multiPageIndex + 1).length > 0 && (
                  <Grid item={true}>
                    <Button
                      icon={<Next aria-hidden='true' />}
                      iconPlacement='right'
                      size='small'
                      variant='tertiary'
                      color='second'
                      onClick={() => setMultiPageIndex && setMultiPageIndex(multiPageIndex + 1)}
                    >
                      <Lang id={'general.next'} />
                    </Button>
                  </Grid>
                )}
            </Grid>
          )}
          <Grid
            container={true}
            direction='row'
            spacing={1}
          >
            {saveAndNextButtonVisible && (
              <Grid item={true}>
                <Button
                  id={`next-button-grp-${id}`}
                  onClick={nextClicked}
                  variant='primary'
                  color='first'
                  size='small'
                >
                  <Lang id={texts?.save_and_next_button ? texts?.save_and_next_button : 'general.save_and_next'} />
                </Button>
              </Grid>
            )}
            {saveButtonVisible && (
              <Grid item={true}>
                <Button
                  id={`add-button-grp-${id}`}
                  onClick={saveClicked}
                  variant={saveAndNextButtonVisible ? 'secondary' : 'primary'}
                  color='first'
                  size='small'
                >
                  <Lang id={texts?.save_button ? texts?.save_button : 'general.save_and_close'} />
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
