import type { ILayoutCompBase } from 'src/layout/layout';

export interface IPagination {
  alternatives: number[];
  default: number;
}

export interface ILayoutCompList extends ILayoutCompBase<'List'> {
  tableHeaders: { [Col in keyof T]: string };
  sortableColumns?: string[];
  pagination?: IPagination;
  dataListId: string;
  secure?: boolean;
  bindingToShowInSummary?: string;
  tableHeadersMobile?: string[];
}

export interface IDataModelBindingsForList {
  [columnKey: string]: string;
}
