import React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  //TableFooter,
  TableHeader,
  TableRow,
} from '@altinn/altinn-design-system';
import type { ChangeProps } from '@altinn/altinn-design-system';

import type { PropsFromGenericComponent } from '..';

import { useAppSelector, useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetAppListOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { getAppListLookupKey } from 'src/utils/applist';

import { AltinnSpinner } from 'altinn-shared/components';

export type ILayoutCompProps = PropsFromGenericComponent<'List'>;

const defaultOptions: any[] = [];
export const ListComponent = ({
  tableHeaders,
  fieldToStoreInDataModel,
  appList,
  appListId,
  mapping,
  formData,
  handleDataChange,
}: ILayoutCompProps) => {
  const apiOptions = useGetAppListOptions({ appListId, mapping });
  const calculatedOptions = apiOptions || defaultOptions;

  const optionsHasChanged = useHasChangedIgnoreUndefined(appList);

  const { value, setValue } = useDelayedSavedState(
    handleDataChange,
    formData?.simpleBinding,
    200,
  );

  const fetchingOptions = useAppSelector(
    (state) =>
      state.appListState.appLists[
        getAppListLookupKey({ id: appListId, mapping })
      ]?.loading,
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
    const cells = [];
    for (let i = 0; i < Object.keys(option).length; i++) {
      cells.push(
        <TableCell key={i}>{option[Object.keys(option)[i]]}</TableCell>,
      );
    }
    return cells;
  };

  return (
    <>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
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
            {calculatedOptions.map((option) => {
              return (
                <TableRow
                  key={option[fieldToStoreInDataModel]}
                  value={option[fieldToStoreInDataModel]}
                >
                  {renderRow(option)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
};
