import React, { useCallback, useEffect } from 'react';

import { Button, ButtonSize, ButtonVariant } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon } from '@navikt/ds-icons';

import { AltinnLoader } from 'src/components/AltinnLoader';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { getLanguageFromKey, getTextResourceByKey } from 'src/language/sharedLanguage';
import { RepeatingGroupsEditContainer } from 'src/layout/Group/RepeatingGroupsEditContainer';
import { useRepeatingGroupsFocusContext } from 'src/layout/Group/RepeatingGroupsFocusContext';
import { RepeatingGroupTable } from 'src/layout/Group/RepeatingGroupTable';
import { RepeatingGroupsLikertContainer } from 'src/layout/Likert/RepeatingGroupsLikertContainer';
import { Triggers } from 'src/types';
import { getRepeatingGroupFilteredIndices } from 'src/utils/formLayout';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { HRepGroup } from 'src/utils/layout/hierarchy.types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
export interface IGroupProps {
  node: LayoutNode<HRepGroup, 'Group'>;
}

const getValidationMethod = (node: LayoutNode) => {
  // Validation for whole group takes precedent over single-row validation if both are present.
  const triggers = node.item.triggers;
  if (triggers && triggers.includes(Triggers.Validation)) {
    return Triggers.Validation;
  }
  if (triggers && triggers.includes(Triggers.ValidateRow)) {
    return Triggers.ValidateRow;
  }
};

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

  const language = useAppSelector((state) => state.language.language);
  const formData = useAppSelector((state) => state.formData.formData);
  const textResources = useAppSelector((state) => state.textResources.resources);

  const filteredIndexList = React.useMemo(
    () => getRepeatingGroupFilteredIndices(formData, edit?.filter),
    [formData, edit],
  );

  const setMultiPageIndex = useCallback(
    (index: number) => {
      dispatch(
        FormLayoutActions.updateRepeatingGroupsMultiPageIndex({
          group: id,
          index,
        }),
      );
    },
    [dispatch, id],
  );

  const AddButton = (): JSX.Element => (
    <Button
      id={`add-button-${id}`}
      onClick={onClickAdd}
      onKeyUp={onKeypressAdd}
      variant={ButtonVariant.Outline}
      size={ButtonSize.Medium}
      icon={<AddIcon aria-hidden='true' />}
      iconPlacement='left'
      fullWidth
      disabled={isLoading || false}
    >
      {isLoading && (
        <AltinnLoader
          style={{ position: 'absolute' }}
          srContent={`${getLanguageFromKey('general.add_new', language ?? {})} ${
            resolvedTextBindings?.add_button ? getTextResourceByKey(resolvedTextBindings.add_button, textResources) : ''
          }`}
        />
      )}
      {`${getLanguageFromKey('general.add_new', language ?? {})} ${
        resolvedTextBindings?.add_button ? getTextResourceByKey(resolvedTextBindings.add_button, textResources) : ''
      }`}
    </Button>
  );

  const onClickAdd = useCallback(() => {
    if (!edit?.alwaysShowAddButton || edit?.mode === 'showAll') {
      dispatch(FormLayoutActions.updateRepeatingGroups({ layoutElementId: id }));
    }
    if (edit?.mode !== 'showAll' && edit?.mode !== 'onlyTable') {
      dispatch(
        FormLayoutActions.updateRepeatingGroupsEditIndex({
          group: id,
          index: repeatingGroupIndex + 1,
          validate: edit?.alwaysShowAddButton && repeatingGroupIndex > -1 ? getValidationMethod(node) : undefined,
          shouldAddRow: !!edit?.alwaysShowAddButton,
        }),
      );
      setMultiPageIndex(0);
    }

    triggerFocus(repeatingGroupIndex + 1);
  }, [dispatch, id, edit?.mode, edit?.alwaysShowAddButton, node, repeatingGroupIndex, setMultiPageIndex, triggerFocus]);

  useEffect(() => {
    if (edit?.openByDefault && repeatingGroupIndex === -1) {
      onClickAdd();
    }
  }, [edit?.openByDefault, onClickAdd, repeatingGroupIndex]);

  useEffect(() => {
    if (edit?.multiPage && multiPageIndex < 0) {
      setMultiPageIndex(0);
    }
  }, [edit?.multiPage, multiPageIndex, setMultiPageIndex]);

  const onKeypressAdd = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const allowedKeys = ['enter', ' ', 'spacebar'];
    if (allowedKeys.includes(event.key.toLowerCase())) {
      onClickAdd();
    }
  };

  const onClickRemove = (groupIndex: number): void => {
    dispatch(
      FormLayoutActions.updateRepeatingGroups({
        layoutElementId: id,
        remove: true,
        index: groupIndex,
      }),
    );
  };

  const setEditIndex = (index: number, forceValidation?: boolean): void => {
    dispatch(
      FormLayoutActions.updateRepeatingGroupsEditIndex({
        group: id,
        index,
        validate: index === -1 || forceValidation ? getValidationMethod(node) : undefined,
      }),
    );
    if (edit?.multiPage && index > -1) {
      setMultiPageIndex(0);
    }
  };

  if (!groupState || node.isHidden() || node.item.type !== 'Group') {
    return null;
  }

  const isNested = typeof node.item.baseComponentId === 'string';

  if (edit?.mode === 'likert') {
    return <RepeatingGroupsLikertContainer id={id} />;
  }

  const displayBtn =
    edit?.addButton !== false &&
    'maxCount' in node.item &&
    repeatingGroupIndex + 1 < (node.item.maxCount === undefined ? -99 : node.item.maxCount) &&
    (edit?.mode === 'showAll' || editIndex < 0 || edit?.alwaysShowAddButton === true);

  return (
    <Grid
      container={true}
      item={true}
      data-componentid={node.item.baseComponentId ?? node.item.id}
    >
      {(!edit?.mode ||
        edit?.mode === 'showTable' ||
        edit?.mode === 'onlyTable' ||
        (edit?.mode === 'hideTable' && editIndex < 0)) && (
        <RepeatingGroupTable
          editIndex={editIndex}
          id={id}
          repeatingGroupIndex={repeatingGroupIndex}
          deleting={deletingIndexes.includes(repeatingGroupIndex)}
          setEditIndex={setEditIndex}
          onClickRemove={onClickRemove}
          setMultiPageIndex={setMultiPageIndex}
          multiPageIndex={multiPageIndex}
          filteredIndexes={filteredIndexList}
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
              editIndex={editIndex}
              setEditIndex={setEditIndex}
              id={id}
              multiPageIndex={multiPageIndex}
              setMultiPageIndex={setMultiPageIndex}
              filteredIndexes={filteredIndexList}
            />
          )}
          {edit?.mode === 'showAll' &&
            // Generate array of length repeatingGroupIndex and iterate over indexes
            Array(repeatingGroupIndex + 1)
              .fill(0)
              .map((_, index) => {
                if (filteredIndexList && filteredIndexList.length > 0 && !filteredIndexList.includes(index)) {
                  return null;
                }

                return (
                  <div
                    key={index}
                    style={{ width: '100%', marginBottom: !isNested && index == repeatingGroupIndex ? 15 : 0 }}
                  >
                    <RepeatingGroupsEditContainer
                      editIndex={index}
                      id={id}
                      deleting={deletingIndexes.includes(index)}
                      setEditIndex={setEditIndex}
                      onClickRemove={onClickRemove}
                      forceHideSaveButton={true}
                    />
                  </div>
                );
              })}
        </>
      </ConditionalWrapper>
      {edit?.mode === 'showAll' && displayBtn && <AddButton />}
      <Grid
        item={true}
        xs={12}
      >
        {node.getValidations('group') && renderValidationMessagesForComponent(node.getValidations('group'), id)}
      </Grid>
    </Grid>
  );
}
