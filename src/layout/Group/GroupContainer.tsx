import React, { useCallback, useEffect } from 'react';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon } from '@navikt/ds-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { useAttachmentDeletionInRepGroups } from 'src/features/attachments/useAttachmentDeletionInRepGroups';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import {
  useOnDeleteGroupRow,
  useOnGroupCloseValidation,
  useUnifiedValidationsForNode,
} from 'src/features/validation/validationProvider';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { RepeatingGroupsEditContainer } from 'src/layout/Group/RepeatingGroupsEditContainer';
import { useRepeatingGroupsFocusContext } from 'src/layout/Group/RepeatingGroupsFocusContext';
import { RepeatingGroupTable } from 'src/layout/Group/RepeatingGroupTable';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';

export interface IGroupProps {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;
}

export function GroupContainer({ node }: IGroupProps): JSX.Element | null {
  const dispatch = useAppDispatch();
  const { triggerFocus } = useRepeatingGroupsFocusContext();
  const resolvedTextBindings = node.item.textResourceBindings;
  const id = node.item.id;
  const edit = node.item.edit;
  const groupState = useAppSelector(
    (state) => state.formLayout.uiConfig.repeatingGroups && state.formLayout.uiConfig.repeatingGroups[id],
  );
  const isLoading = groupState?.isLoading;
  const editIndex = groupState?.editIndex ?? -1;
  const deletingIndexes = groupState?.deletingIndex ?? [];
  const multiPageIndex = groupState?.multiPageIndex ?? -1;
  const repeatingGroupIndex = groupState?.index ?? -1;
  const { lang, langAsString } = useLanguage();
  const validations = useUnifiedValidationsForNode(node);
  const { onBeforeRowDeletion } = useAttachmentDeletionInRepGroups(node);
  const onDeleteGroupRow = useOnDeleteGroupRow();
  const onGroupCloseValidation = useOnGroupCloseValidation();

  const setMultiPageIndex = useCallback(
    (index: number) => {
      dispatch(
        FormLayoutActions.repGroupSetMultiPage({
          groupId: id,
          page: index,
        }),
      );
    },
    [dispatch, id],
  );

  const AddButton = (): JSX.Element => (
    <Button
      id={`add-button-${id}`}
      onClick={handleOnAddButtonClick}
      onKeyUp={handleOnAddKeypress}
      variant='secondary'
      icon={<AddIcon aria-hidden='true' />}
      iconPlacement='left'
      fullWidth
      disabled={isLoading || false}
    >
      {isLoading && (
        <AltinnLoader
          style={{ position: 'absolute' }}
          srContent={
            resolvedTextBindings?.add_button_full
              ? langAsString(resolvedTextBindings.add_button_full)
              : `${langAsString('general.add_new')} ${langAsString(resolvedTextBindings?.add_button)}`
          }
        />
      )}
      {resolvedTextBindings?.add_button_full
        ? lang(resolvedTextBindings.add_button_full)
        : `${langAsString('general.add_new')} ${langAsString(resolvedTextBindings?.add_button)}`}
    </Button>
  );

  const addNewRowToGroup = useCallback((): void => {
    if (!edit?.alwaysShowAddButton || edit?.mode === 'showAll') {
      dispatch(FormLayoutActions.repGroupAddRow({ groupId: id }));
    }

    if (edit?.mode !== 'showAll' && edit?.mode !== 'onlyTable') {
      const shouldChangeIndex = repeatingGroupIndex === -1 || !onGroupCloseValidation(node, editIndex);
      if (shouldChangeIndex) {
        dispatch(
          FormLayoutActions.updateRepeatingGroupsEditIndex({
            group: id,
            index: repeatingGroupIndex + 1,
            shouldAddRow: true,
          }),
        );
        setMultiPageIndex(0);
      }
    }
  }, [
    dispatch,
    edit?.alwaysShowAddButton,
    edit?.mode,
    editIndex,
    id,
    node,
    onGroupCloseValidation,
    repeatingGroupIndex,
    setMultiPageIndex,
  ]);

  const handleOnAddButtonClick = (): void => {
    addNewRowToGroup();
    triggerFocus(repeatingGroupIndex + 1);
  };

  // Add new row if openByDefault is true and no rows exist
  useEffect((): void => {
    if (edit?.openByDefault && repeatingGroupIndex === -1) {
      addNewRowToGroup();
    }
  }, [addNewRowToGroup, edit?.openByDefault, repeatingGroupIndex]);

  useEffect((): void => {
    if (edit?.multiPage && multiPageIndex < 0) {
      setMultiPageIndex(0);
    }
  }, [edit?.multiPage, multiPageIndex, setMultiPageIndex]);

  const handleOnAddKeypress = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const allowedKeys = ['enter', ' ', 'spacebar'];
    if (allowedKeys.includes(event.key.toLowerCase())) {
      addNewRowToGroup();
      triggerFocus(repeatingGroupIndex + 1);
    }
  };

  const handleOnRemoveClick = async (index: number) => {
    const attachmentDeletionSuccessful = await onBeforeRowDeletion(index);
    if (attachmentDeletionSuccessful) {
      onDeleteGroupRow(node, index);
      dispatch(FormLayoutActions.repGroupDeleteRow({ groupId: id, index }));
    } else {
      dispatch(FormLayoutActions.repGroupDeleteRowCancelled({ groupId: id, index }));
    }
  };

  const setEditIndex = (index: number): void => {
    const shouldChangeIndex = editIndex === -1 || !onGroupCloseValidation(node, editIndex);
    if (shouldChangeIndex) {
      dispatch(
        FormLayoutActions.updateRepeatingGroupsEditIndex({
          group: id,
          index,
        }),
      );
      if (edit?.multiPage && index > -1) {
        setMultiPageIndex(0);
      }
    }
  };

  if (!groupState || node.isHidden() || node.item.type !== 'Group') {
    return null;
  }

  const isNested = node.parent instanceof BaseLayoutNode;

  const displayBtn =
    edit?.addButton !== false &&
    'maxCount' in node.item &&
    repeatingGroupIndex + 1 < (node.item.maxCount === undefined ? -99 : node.item.maxCount) &&
    (edit?.mode === 'showAll' || editIndex < 0 || edit?.alwaysShowAddButton === true);

  return (
    <Grid
      container={true}
      item={true}
      data-componentid={node.item.id}
    >
      {(!edit?.mode ||
        edit?.mode === 'showTable' ||
        edit?.mode === 'onlyTable' ||
        (edit?.mode === 'hideTable' && editIndex < 0)) && (
        <RepeatingGroupTable
          node={node}
          editIndex={editIndex}
          repeatingGroupIndex={repeatingGroupIndex}
          deleting={deletingIndexes.includes(repeatingGroupIndex)}
          setEditIndex={setEditIndex}
          onClickRemove={handleOnRemoveClick}
          setMultiPageIndex={setMultiPageIndex}
          multiPageIndex={multiPageIndex}
          rowsBefore={node.item.rowsBefore}
          rowsAfter={node.item.rowsAfter}
        />
      )}
      {edit?.mode !== 'showAll' && displayBtn && <AddButton />}
      <ConditionalWrapper
        condition={!isNested}
        wrapper={(children) => <FullWidthWrapper>{children}</FullWidthWrapper>}
      >
        <>
          {editIndex >= 0 && edit?.mode === 'hideTable' && (
            <RepeatingGroupsEditContainer
              node={node}
              editIndex={editIndex}
              setEditIndex={setEditIndex}
              multiPageIndex={multiPageIndex}
              setMultiPageIndex={setMultiPageIndex}
            />
          )}
          {edit?.mode === 'showAll' &&
            // Generate array of length repeatingGroupIndex and iterate over indexes
            Array(repeatingGroupIndex + 1)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  style={{ width: '100%', marginBottom: !isNested && index == repeatingGroupIndex ? 15 : 0 }}
                >
                  <RepeatingGroupsEditContainer
                    node={node}
                    editIndex={index}
                    deleting={deletingIndexes.includes(index)}
                    setEditIndex={setEditIndex}
                    onClickRemove={handleOnRemoveClick}
                    forceHideSaveButton={true}
                  />
                </div>
              ))}
        </>
      </ConditionalWrapper>
      {edit?.mode === 'showAll' && displayBtn && <AddButton />}
      <Grid
        item={true}
        xs={12}
      >
        <ComponentValidations validations={validations} />
      </Grid>
    </Grid>
  );
}
