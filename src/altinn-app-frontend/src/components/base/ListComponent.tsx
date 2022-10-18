import React from 'react';

import {
  Table,
  TableBody,
  //TableBody,
  TableCell,
  //TableFooter,
  TableHeader,
  TableRow,
} from '@altinn/altinn-design-system';

import type { IComponentProps } from '..';

import { useGetOptions } from 'src/components/hooks';
import type { ILayoutCompList } from 'src/features/form/layout';
import type { IListOption, IMapping, IOptionSource } from 'src/types';

export interface ILayoutCompProps
  extends IComponentProps,
    Omit<ILayoutCompList, 'type'> {
  tableHeaders?: string[];
  options?: IListOption[];
  optionsId?: string;
  mapping?: IMapping;
  secure?: boolean;
  source?: IOptionSource;
  preselectedOptionIndex?: number;
}

export const ListComponent = ({
  tableHeaders,
  options,
  optionsId,
  mapping,
  source,
}: ILayoutCompProps) => {
  const apiOptions = useGetOptions({ optionsId, mapping, source });
  const calculatedOptions =
    (apiOptions || options)?.map((option) => ({
      label: option.label,
      value: option.value,
    })) || [];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {calculatedOptions?.map((option: IListOption) => {
          return (
            <TableRow key={option.value}>
              {option.label.map((label) => {
                return <TableCell key={label}>{label}</TableCell>;
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
