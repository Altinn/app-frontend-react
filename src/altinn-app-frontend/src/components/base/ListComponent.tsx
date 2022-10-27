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
import type { ChangeProps } from '@altinn/altinn-design-system';

import type { IComponentProps } from '..';

import { useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetTableOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
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
  formData,
  handleDataChange,
}: ILayoutCompProps) => {
  const apiOptions = useGetTableOptions({ optionsId, mapping });
  // const calculatedOptions =
  //   (apiOptions || options)?.map((option) => ({
  //     label: option.label,
  //     value: option.value,
  //   })) || [];

  const optionsHasChanged = useHasChangedIgnoreUndefined(options);

  const { value, setValue } = useDelayedSavedState(
    handleDataChange,
    formData?.simpleBinding,
    200,
  );

  React.useEffect(() => {
    if (optionsHasChanged && formData.simpleBinding) {
      // New options have been loaded, we have to reset form data.
      // We also skip any required validations
      setValue(undefined, true);
    }
  }, [optionsHasChanged, formData, setValue]);

  const handleChange = ({ selectedValue }: ChangeProps) => {
    setValue(selectedValue);
  };

  const renderRow = (option) => {
    console.log(option);
    for (const label in option) {
      console.log(label);
      return <TableCell key={label}>{label}</TableCell>;
    }
  };
  return (
    <Table
      selectRows={true}
      onChange={handleChange}
      selectedValue={value}
    >
      <TableHeader>
        <TableRow>
          {tableHeaders.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiOptions?.map((option) => {
          return (
            <TableRow
              key={option}
              value={option}
            >
              {renderRow(option)}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
