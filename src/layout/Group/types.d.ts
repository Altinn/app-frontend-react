import type { BaseValue } from 'src/features/expressions/types';
import type { ILayoutCompBase } from 'src/layout/layout';
import type { IGroupPanel } from 'src/layout/Panel/types';

export interface IGroupFilter {
  key: string;
  value: string;
}

export interface IGroupEditProperties {
  mode?: 'hideTable' | 'showTable' | 'showAll' | 'likert';
  filter?: IGroupFilter[];
  addButton?: BaseValue.Boolean;
  saveButton?: BaseValue.Boolean;
  deleteButton?: BaseValue.Boolean;
  multiPage?: boolean;
  openByDefault?: boolean | 'first' | 'last';
  alertOnDelete?: BaseValue.Boolean;
  saveAndNextButton?: BaseValue.Boolean;
}

export interface ILayoutGroup extends ILayoutCompBase<'Group'> {
  children: string[];
  maxCount?: number;
  tableHeaders?: string[];
  edit?: IGroupEditProperties;
  panel?: IGroupPanel;
}

export interface IDataModelBindingsForGroup {
  group: string;
}
