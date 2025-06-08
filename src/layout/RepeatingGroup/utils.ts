import { useCallback, useMemo } from 'react';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import { ExprValidation } from 'src/features/expressions/validation';
import { useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { FD } from 'src/features/formData/FormDataWrite';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';
import type { ExprValToActual, ExprValToActualOrExpr } from 'src/features/expressions/types';
import type { IDataModelReference } from 'src/layout/common.generated';
import type { GroupExpressions } from 'src/layout/RepeatingGroup/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';
import type { BaseRow } from 'src/utils/layout/types';
import type { ExpressionDataSources } from 'src/utils/layout/useExpressionDataSources';

export interface RepGroupRow extends BaseRow {
  hidden: boolean;
}

export interface RepGroupRowWithButtons extends RepGroupRow {
  editButton: boolean;
  deleteButton: boolean;
}

export type RepGroupRowWithExpressions = RepGroupRow & GroupExpressions;

const noRows: RepGroupRow[] = [];

export function useRepeatingGroupAllBaseRows(node: LayoutNode<'RepeatingGroup'> | undefined) {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  return FD.useFreshRows(groupBinding);
}

interface EvalExprProps<T extends ExprVal> {
  expr: ExprValToActualOrExpr<T> | undefined;
  defaultValue?: ExprValToActual<T>;
  dataSources: ExpressionDataSources;
  groupBinding: IDataModelReference;
  rowIndex: number;
}

function evalString({ expr, defaultValue = '', dataSources, groupBinding, rowIndex }: EvalExprProps<ExprVal.String>) {
  if (!ExprValidation.isValidOrScalar(expr, ExprVal.String)) {
    return defaultValue;
  }

  const currentDataModelPath = {
    dataType: groupBinding.dataType,
    field: `${groupBinding.field}[${rowIndex}]`,
  };
  return evalExpr(expr, { ...dataSources, currentDataModelPath }, { returnType: ExprVal.String, defaultValue });
}

function evalBool({ expr, defaultValue = false, dataSources, groupBinding, rowIndex }: EvalExprProps<ExprVal.Boolean>) {
  if (!ExprValidation.isValidOrScalar(expr, ExprVal.Boolean)) {
    return defaultValue;
  }

  const currentDataModelPath = {
    dataType: groupBinding.dataType,
    field: `${groupBinding.field}[${rowIndex}]`,
  };
  return evalExpr(expr, { ...dataSources, currentDataModelPath }, { returnType: ExprVal.Boolean, defaultValue });
}

export function useRepeatingGroupAllRowsWithHidden(node: LayoutNode<'RepeatingGroup'> | undefined): RepGroupRow[] {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  const hiddenRow = NodesInternal.useNodeData(node, (d) => d.layout.hiddenRow);
  const dataSources = useExpressionDataSources(hiddenRow);
  const rows = useRepeatingGroupAllBaseRows(node);

  return useMemo(
    () =>
      (groupBinding &&
        rows.map((row) => ({
          ...row,
          hidden: evalBool({ expr: hiddenRow, dataSources, groupBinding, rowIndex: row.index }),
        }))) ??
      noRows,
    [rows, hiddenRow, dataSources, groupBinding],
  );
}

export function useRepeatingGroupAllRowsWithButtons(node: LayoutNode<'RepeatingGroup'>): RepGroupRowWithButtons[] {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  const hiddenRow = NodesInternal.useNodeData(node, (d) => d.layout.hiddenRow);
  const editButton = NodesInternal.useNodeData(node, (d) => d.layout.edit?.editButton);
  const deleteButton = NodesInternal.useNodeData(node, (d) => d.layout.edit?.deleteButton);
  const dataSources = useExpressionDataSources({ hiddenRow, editButton, deleteButton });
  const rows = useRepeatingGroupAllBaseRows(node);

  return useMemo(
    () =>
      (groupBinding &&
        rows.map((row) => ({
          ...row,
          hidden: evalBool({ expr: hiddenRow, dataSources, groupBinding, rowIndex: row.index }),
          editButton: evalBool({ expr: editButton, dataSources, groupBinding, rowIndex: row.index }),
          deleteButton: evalBool({ expr: deleteButton, dataSources, groupBinding, rowIndex: row.index }),
        }))) ??
      noRows,
    [dataSources, deleteButton, editButton, groupBinding, hiddenRow, rows],
  );
}

export function useRepeatingGroupGetFreshRowsWithButtons(
  node: LayoutNode<'RepeatingGroup'>,
): () => RepGroupRowWithButtons[] {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  const hiddenRow = NodesInternal.useNodeData(node, (d) => d.layout.hiddenRow);
  const editButton = NodesInternal.useNodeData(node, (d) => d.layout.edit?.editButton);
  const deleteButton = NodesInternal.useNodeData(node, (d) => d.layout.edit?.deleteButton);
  const dataSources = useExpressionDataSources({ hiddenRow, editButton, deleteButton });
  const getFreshRows = FD.useGetFreshRows();

  return useCallback(() => {
    const freshRows = getFreshRows(groupBinding);
    return freshRows.map((row) => ({
      ...row,
      hidden: evalBool({ expr: hiddenRow, dataSources, groupBinding, rowIndex: row.index }),
      editButton: evalBool({ expr: editButton, dataSources, groupBinding, rowIndex: row.index }),
      deleteButton: evalBool({ expr: deleteButton, dataSources, groupBinding, rowIndex: row.index }),
    }));
  }, [dataSources, deleteButton, editButton, getFreshRows, groupBinding, hiddenRow]);
}

export function useRepeatingGroupRowWithExpressions(
  node: LayoutNode<'RepeatingGroup'> | undefined,
  _row: 'first' | { uuid: string } | { index: number },
): RepGroupRowWithExpressions | undefined {
  const groupBinding = NodesInternal.useNodeData(node, (d) => d.layout.dataModelBindings.group);
  const hiddenRow = NodesInternal.useNodeData(node, (d) => d.layout.hiddenRow);
  const edit = NodesInternal.useNodeData(node, (d) => d.layout.edit);
  const trb = NodesInternal.useNodeData(node, (d) => d.layout.textResourceBindings);
  const dataSources = useExpressionDataSources({ hiddenRow, edit, trb });
  const rows = useRepeatingGroupAllBaseRows(node);
  const row = _row === 'first' ? rows[0] : 'uuid' in _row ? rows.find((r) => r.uuid === _row.uuid) : rows[_row.index];

  return useMemo(() => {
    if (!groupBinding || !row) {
      return undefined;
    }
    const baseProps = { dataSources, groupBinding, rowIndex: row.index };
    return {
      ...row,
      hidden: evalBool({ expr: hiddenRow, ...baseProps }),
      textResourceBindings: trb
        ? {
            edit_button_close: evalString({ expr: trb.edit_button_close, ...baseProps }),
            edit_button_open: evalString({ expr: trb.edit_button_open, ...baseProps }),
            save_and_next_button: evalString({ expr: trb.save_and_next_button, ...baseProps }),
            save_button: evalString({ expr: trb.save_button, ...baseProps }),
          }
        : undefined,
      edit: edit
        ? {
            alertOnDelete: evalBool({ expr: edit.alertOnDelete, ...baseProps }),
            editButton: evalBool({ expr: edit.editButton, ...baseProps }),
            deleteButton: evalBool({ expr: edit.deleteButton, ...baseProps }),
            saveAndNextButton: evalBool({ expr: edit.saveAndNextButton, ...baseProps }),
            saveButton: evalBool({ expr: edit.saveButton, ...baseProps }),
          }
        : undefined,
    };
  }, [groupBinding, row, dataSources, hiddenRow, trb, edit]);
}

export function useRepeatingGroupVisibleRows(node: LayoutNode<'RepeatingGroup'>) {
  const withHidden = useRepeatingGroupAllRowsWithHidden(node);
  return withHidden.filter((row) => !row.hidden);
}

export function useRepeatingGroupLastMultiPageIndex(node: LayoutNode<'RepeatingGroup'>) {
  const component = useLayoutLookups().getComponent(node.baseId, 'RepeatingGroup');
  if (!component || !component.edit?.multiPage) {
    return undefined;
  }

  let lastMultiPageIndex = 0;
  for (const id of component.children) {
    const [multiPageIndex] = id.split(':', 2);
    lastMultiPageIndex = Math.max(lastMultiPageIndex, parseInt(multiPageIndex));
  }

  return lastMultiPageIndex;
}
