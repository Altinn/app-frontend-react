import type { ILayoutCompBase, TextBindingsForLabel } from 'src/layout/layout';
import type { IMapping } from 'src/types';

export interface IPagination {
  alternatives: number[];
  default: number;
}

type ValidTexts = TextBindingsForLabel;
export interface ILayoutCompList extends ILayoutCompBase<'List', IDataModelBindingsForList, ValidTexts> {
  tableHeaders: Record<string, string>;
  sortableColumns?: string[];
  pagination?: IPagination;
  dataListId: string;
  secure?: boolean;
  mapping?: IMapping;
  bindingToShowInSummary?: string;
  tableHeadersMobile?: string[];
}

export interface IDataModelBindingsForList {
  [columnKey: string]: string;
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
  NotActive = 'notActive',
}
