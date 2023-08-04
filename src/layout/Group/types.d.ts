import type { DeepPartial } from 'utility-types';

import type { ExprVal } from 'src/features/expressions/types';
import type { GridRowsExternal } from 'src/layout/common.generated';
import type { CompGroupExternal, IGroupColumnFormatting, IGroupPanel } from 'src/layout/Group/config.generated';
import type { ILayoutCompBase, ITableColumnFormatting } from 'src/layout/layout';

export interface IGroupFilter {
  key: string;
  value: string;
}

export interface IGroupEditProperties {
  mode?: 'hideTable' | 'showTable' | 'showAll' | 'onlyTable' | 'likert';
  filter?: IGroupFilter[];
  addButton?: ExprVal.Boolean;
  saveButton?: ExprVal.Boolean;
  deleteButton?: ExprVal.Boolean;
  editButton?: ExprVal.Boolean;
  multiPage?: boolean;
  openByDefault?: boolean | 'first' | 'last';
  alertOnDelete?: ExprVal.Boolean;
  saveAndNextButton?: ExprVal.Boolean;
  alwaysShowAddButton?: boolean;
}

export interface ILayoutGroup extends ILayoutCompBase<'Group'> {
  children: string[];
  maxCount?: number;
  minCount?: number;
  tableHeaders?: string[];
  tableColumns?: ITableColumnFormatting<IGroupColumnFormatting>;
  edit?: IGroupEditProperties;
  panel?: IGroupPanel;
  showGroupingIndicator?: boolean;
  hiddenRow?: ExprVal.Boolean;
  rowsBefore?: GridRowsExternal;
  rowsAfter?: GridRowsExternal;
}

export type HGroupExpressions = DeepPartial<CompGroupExternal>;
