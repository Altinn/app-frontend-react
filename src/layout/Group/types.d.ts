import type { ExprVal } from 'src/features/expressions/types';
import type { ILayoutCompBase, ITableColumnFormatting } from 'src/layout/layout';
import type { IGroupPanel, ILayoutCompPanelBase } from 'src/layout/Panel/types';

export interface IGroupFilter {
  key: string;
  value: string;
}

export interface IGroupEditProperties {
  mode?: 'hideTable' | 'showTable' | 'showAll' | 'likert';
  filter?: IGroupFilter[];
  addButton?: ExprVal.Boolean;
  saveButton?: ExprVal.Boolean;
  deleteButton?: ExprVal.Boolean;
  multiPage?: boolean;
  openByDefault?: boolean | 'first' | 'last';
  alertOnDelete?: ExprVal.Boolean;
  saveAndNextButton?: ExprVal.Boolean;
  alwaysShowAddButton?: boolean;
}

export interface ILayoutGroup extends ILayoutCompBase<'Group'> {
  children: string[];
  maxCount?: number;
  tableHeaders?: string[];
  tableColumns?: ITableColumnFormatting;
  edit?: IGroupEditProperties;
  panel?: IGroupPanel;
  hiddenRow?: ExprVal.Boolean;
}

export interface IDataModelBindingsForGroup {
  group: string;
}

export interface IGroupPanel extends ILayoutCompPanelBase {
  iconUrl?: string;
  iconAlt?: string;
  groupReference?: {
    group: string;
  };
}
