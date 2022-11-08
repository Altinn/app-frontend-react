import React from 'react';

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

import { useAppDispatch, useAppSelector, useHasChangedIgnoreUndefined } from 'src/common/hooks';
import { useGetAppListOptions } from 'src/components/hooks';
import { useDelayedSavedState } from 'src/components/hooks/useDelayedSavedState';
import { appListSortColumnSelector } from 'src/selectors/appListSortColumnSelector';
import { appListSortDirectionSelector } from 'src/selectors/appListSortDirectionSelector';
import { appListsActions } from 'src/shared/resources/options/appListsSlice';

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
  const dispatch = useAppDispatch();
  const sortColumn = useAppSelector(appListSortColumnSelector);
  const sortDirection = useAppSelector(appListSortDirectionSelector);
  const handleSortChange = ({ idCell, previousSortDirection }: SortProps) => {
    if (previousSortDirection === SortDirection.Ascending) {
      dispatch(
        appListsActions.setSort({
          sortColumn: idCell,
          sortDirection: SortDirection.Descending,
        }),
      );
    } else {
      dispatch(
        appListsActions.setSort({
          sortColumn: idCell,
          sortDirection: SortDirection.Ascending,
        }),
      );
    }
  };

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
    const cells: JSX.Element[] = [];
    for (let i = 0; i < Object.keys(option).length; i++) {
      cells.push(<TableCell key={i}>{option[Object.keys(option)[i]]}</TableCell>);
    }
    return cells;
  };

  const checkSortableColumns = (headers) => {
    const cell: JSX.Element[] = [];
    for (const header of headers) {
      if ((sortableColumns || []).includes(header)) {
        cell.push(
          <TableCell
            onChange={handleSortChange}
            id={header}
            sortDirecton={sortColumn === header ? sortDirection : SortDirection.NotActive}
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
    </>
  );
};
