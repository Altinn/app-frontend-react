import React, { useState } from 'react';

import {
  SortDirection,
  Table,
  TableBody,
  TableCell,
  //TableFooter,
  TableHeader,
  TableRow,
} from '@altinn/altinn-design-system';
import type { ChangeProps, SortProps } from '@altinn/altinn-design-system';

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
  sortableColumns,
}: ILayoutCompProps) => {
  const apiOptions = useGetAppListOptions({ appListId, mapping });
  const calculatedOptions = apiOptions || defaultOptions;

  const optionsHasChanged = useHasChangedIgnoreUndefined(appList);

  const { value, setValue } = useDelayedSavedState(handleDataChange, formData?.simpleBinding, 200);

  const [selectedSort, setSelectedSort] = useState({
    idCell: 0,
    sortDirection: SortDirection.NotActive,
  });

  const handleSortChange = ({ idCell, previousSortDirection }: SortProps) => {
    if (previousSortDirection === SortDirection.Ascending) {
      setSelectedSort({
        idCell: idCell,
        sortDirection: SortDirection.Descending,
      });
    } else {
      setSelectedSort({
        idCell: idCell,
        sortDirection: SortDirection.Ascending,
      });
    }
  };

  const fetchingOptions = useAppSelector(
    (state) => state.appListState.appLists[getAppListLookupKey({ id: appListId, mapping })]?.loading,
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
      cells.push(<TableCell key={i}>{option[Object.keys(option)[i]]}</TableCell>);
    }
    return cells;
  };

  const checkSortableColumns = (headers) => {
    const cell = [];
    for (const header of headers) {
      if (sortableColumns.includes(header)) {
        cell.push(
          <TableCell
            onChange={handleSortChange}
            id={1}
            sortDirecton={selectedSort.idCell === 1 ? selectedSort.sortDirection : SortDirection.NotActive}
          >
            {header}
          </TableCell>,
        );
      } else {
        cell.push(<TableCell>{header}</TableCell>);
      }
    }
    return cell;
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
            <TableRow>{checkSortableColumns(tableHeaders)}</TableRow>
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
