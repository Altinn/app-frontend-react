import React, { forwardRef, useEffect, useState } from 'react';
import type { JSX } from 'react';

import { Button } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon } from '@navikt/ds-icons';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { Label } from 'src/components/label/Label';
import { useLanguage } from 'src/features/language/useLanguage';
import { AllComponentValidations } from 'src/features/validation/ComponentValidations';
import { RepeatingGroupsEditContainer } from 'src/layout/RepeatingGroup/EditContainer/RepeatingGroupsEditContainer';
import { RepeatingGroupPagination } from 'src/layout/RepeatingGroup/Pagination/RepeatingGroupPagination';
import {
  useRepeatingGroup,
  useRepeatingGroupPagination,
  useRepeatingGroupRowState,
  useRepeatingGroupSelector,
} from 'src/layout/RepeatingGroup/Providers/RepeatingGroupContext';
import { useRepeatingGroupsFocusContext } from 'src/layout/RepeatingGroup/Providers/RepeatingGroupFocusContext';
import { RepeatingGroupTable } from 'src/layout/RepeatingGroup/Table/RepeatingGroupTable';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { Hidden } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';

export const RepeatingGroupContainer = forwardRef((_, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null => {
  const { node, isDeleting, deletingIds } = useRepeatingGroup();
  const mode = useNodeItem(node, (i) => i.edit?.mode);

  const editingId = useRepeatingGroupSelector((state) => state.editingId);

  const deletingId = useRepeatingGroupSelector((state) => state.deletingIds);

  const isHidden = Hidden.useIsHidden(node);

  const [ariaMessage, setAriaMessage] = useState('');

  useEffect(() => {}, [deletingIds]);

  console.log('isDeleting', isDeleting);

  if (isHidden || !node.isType('RepeatingGroup')) {
    return null;
  }

  return (
    <>
      <pre>{JSON.stringify(deletingIds, null, 2)}</pre>
      {/*<pre>{JSON.stringify(deletingId, null, 2)}</pre>*/}
      <Grid
        container={true}
        item={true}
        data-componentid={node.id}
        data-componentbaseid={node.baseId}
        ref={ref}
      >
        <pre>{JSON.stringify(isDeleting, null, 2)}</pre>

        {(!mode || mode === 'showTable') && <ModeOnlyTable />}
        {mode === 'onlyTable' && <ModeOnlyTable />}
        {mode === 'hideTable' && editingId === undefined && <ModeOnlyTable />}
        {mode === 'hideTable' && editingId !== undefined && <ModeOnlyEdit editingId={editingId} />}
        {mode === 'showAll' && <ModeShowAll />}
        <Grid
          item={true}
          xs={12}
        >
          <AllComponentValidations node={node} />
        </Grid>
      </Grid>

      {deletingIds.length > 0 && (
        <div
          aria-live='polite'
          className={'sr-only'}
        >
          item deleted
        </div>
      )}
    </>
  );
});
RepeatingGroupContainer.displayName = 'RepeatingGroupContainer';

function ModeOnlyTable() {
  return (
    <>
      <RepeatingGroupTable />
      <AddButton />
    </>
  );
}

function ModeOnlyEdit({ editingId }: { editingId: string }) {
  const { node } = useRepeatingGroup();
  const isNested = node.parent instanceof BaseLayoutNode;

  return (
    <Label
      renderLabelAs='legend'
      node={node}
    >
      <ConditionalWrapper
        condition={!isNested}
        wrapper={(children) => <FullWidthWrapper>{children}</FullWidthWrapper>}
      >
        <RepeatingGroupsEditContainer editId={editingId} />
      </ConditionalWrapper>
      <AddButton />
    </Label>
  );
}

function ModeShowAll() {
  const { node } = useRepeatingGroup();
  const isNested = node.parent instanceof BaseLayoutNode;

  const { rowsToDisplay } = useRepeatingGroupPagination();
  const numRows = rowsToDisplay.length;
  const lastIndex = rowsToDisplay[numRows - 1];

  return (
    <Label
      renderLabelAs='legend'
      node={node}
    >
      <ConditionalWrapper
        condition={!isNested}
        wrapper={(children) => <FullWidthWrapper>{children}</FullWidthWrapper>}
      >
        <>
          {rowsToDisplay.map((row) => (
            <div
              key={`repeating-group-item-${row.uuid}`}
              style={{ width: '100%', marginBottom: !isNested && row == lastIndex ? 15 : 0 }}
            >
              <RepeatingGroupsEditContainer
                editId={row.uuid}
                forceHideSaveButton={true}
              />
            </div>
          ))}
          <RepeatingGroupPagination inTable={false} />
        </>
      </ConditionalWrapper>
      <AddButton />
    </Label>
  );
}

function AddButton() {
  const { lang, langAsString } = useLanguage();
  const { triggerFocus } = useRepeatingGroupsFocusContext();
  const { node, addRow } = useRepeatingGroup();
  const { visibleRows } = useRepeatingGroupRowState();
  const { editingAll, editingNone, isEditingAnyRow, currentlyAddingRow } = useRepeatingGroupSelector((state) => ({
    editingAll: state.editingAll,
    editingNone: state.editingNone,
    isEditingAnyRow: state.editingId !== undefined,
    currentlyAddingRow: state.addingIds.length > 0,
  }));

  const item = useNodeItem(node);
  const { textResourceBindings, id, edit } = item;
  const { add_button, add_button_full } = textResourceBindings || {};

  const numRows = visibleRows.length;
  const tooManyRows = 'maxCount' in item && typeof item.maxCount == 'number' && numRows >= item.maxCount;
  const forceShow = editingAll || editingNone || edit?.alwaysShowAddButton === true;

  if (edit?.addButton === false) {
    return null;
  }

  if (tooManyRows) {
    return null;
  }

  if (isEditingAnyRow && !forceShow) {
    return null;
  }

  return (
    <Button
      id={`add-button-${id}`}
      onClick={async () => {
        const newRow = await addRow();
        newRow.index !== undefined && triggerFocus(newRow.index);
      }}
      onKeyUp={async (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const allowedKeys = ['enter', ' ', 'spacebar'];
        if (allowedKeys.includes(event.key.toLowerCase())) {
          const newRow = await addRow();
          newRow.index !== undefined && triggerFocus(newRow.index);
        }
      }}
      variant='secondary'
      disabled={currentlyAddingRow}
      fullWidth
    >
      <AddIcon
        fontSize='1.5rem'
        aria-hidden='true'
      />
      {add_button_full ? lang(add_button_full) : `${langAsString('general.add_new')} ${langAsString(add_button)}`}
    </Button>
  );
}
