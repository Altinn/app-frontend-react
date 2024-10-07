import React, { useState } from 'react';
import type { AriaAttributes } from 'react';

import { Pagination as AltinnPagination } from '@altinn/altinn-design-system';
import { Heading, Table } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { DescriptionText } from '@altinn/altinn-design-system/dist/types/src/components/Pagination/Pagination';

import { Description } from 'src/components/form/Description';
import { RadioButton } from 'src/components/form/RadioButton';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getLabelId } from 'src/components/label/Label';
import { useDataListQuery } from 'src/features/dataLists/useDataListQuery';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/List/ListComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { Filter } from 'src/features/dataLists/useDataListQuery';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindingsForList } from 'src/layout/List/config.generated';

export type IListProps = PropsFromGenericComponent<'List'>;
type Row = Record<string, string | number | boolean>;

export const ListComponent = ({ node }: IListProps) => {
  const isMobile = useIsMobile();
  const item = useNodeItem(node);
  const {
    tableHeaders,
    pagination,
    sortableColumns,
    tableHeadersMobile,
    mapping,
    queryParameters,
    secure,
    dataListId,
    required,
  } = item;

  const { langAsString, language, lang } = useLanguage();
  const [pageSize, setPageSize] = useState<number>(pagination?.default ?? 0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<AriaAttributes['aria-sort']>('none');

  const filter: Filter = {
    pageSize,
    pageNumber,
    sortColumn,
    sortDirection,
  };

  const { data } = useDataListQuery(filter, dataListId, secure, mapping, queryParameters);
  const bindings = item.dataModelBindings ?? ({} as IDataModelBindingsForList);
  const { formData, setValues } = useDataModelBindings(bindings);

  const filteredHeaders = Object.fromEntries(Object.entries(tableHeaders).filter(([key]) => shouldIncludeColumn(key)));
  const filteredRows: Row[] =
    data?.listItems?.map((row) => {
      const result = Object.fromEntries(Object.entries(row).filter(([key]) => shouldIncludeColumn(key)));
      return result;
    }) ?? [];

  const selectedRow = filteredRows.find((row) => Object.keys(formData).every((key) => row[key] === formData[key]));

  function handleRowSelect({ selectedValue }: { selectedValue: Row }) {
    const next: Row = {};
    for (const binding of Object.keys(bindings)) {
      next[binding] = selectedValue[binding];
    }
    setValues(next);
  }

  function shouldIncludeColumn(key: string): boolean {
    return !isMobile || !tableHeadersMobile || tableHeadersMobile.includes(key);
  }

  function isRowSelected(row: Row): boolean {
    return JSON.stringify(selectedRow) === JSON.stringify(row);
  }

  const title = item.textResourceBindings?.title;
  const description = item.textResourceBindings?.description;

  return (
    <ComponentStructureWrapper node={node}>
      <Table width='100%'>
        {title && (
          <caption
            id={getLabelId(node.id)}
            className={classes.caption}
          >
            <Heading
              level={2}
              size='sm'
            >
              {title}
              <RequiredIndicator required={required} />
            </Heading>
            <Description
              description={description}
              componentId={node.id}
            />
          </caption>
        )}
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell className={classes.headerCell} />
            {Object.entries(filteredHeaders).map(([key, value]) => (
              <Table.HeaderCell
                key={key}
                className={classes.headerCell}
                sortable={sortableColumns?.includes(key)}
                sort={sortColumn === key ? sortDirection : undefined}
                onSortClick={() => {
                  if (sortColumn === key) {
                    setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
                  } else {
                    setSortDirection('descending');
                    setSortColumn(key);
                  }
                }}
              >
                {typeof value === 'string' ? langAsString(value) : value}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {filteredRows.map((row) => (
            <Table.Row
              key={JSON.stringify(row)}
              onClick={() => {
                handleRowSelect({ selectedValue: row });
              }}
            >
              <Table.Cell
                className={cn({
                  [classes.selectedRowCell]: isRowSelected(row),
                })}
              >
                <RadioButton
                  aria-label={JSON.stringify(row)}
                  onChange={() => {
                    handleRowSelect({ selectedValue: row });
                  }}
                  value={JSON.stringify(row)}
                  checked={isRowSelected(row)}
                  name={node.id}
                />
              </Table.Cell>
              {Object.entries(row).map(([key, value]) => (
                <Table.Cell
                  key={key}
                  className={cn({
                    [classes.selectedRowCell]: isRowSelected(row),
                  })}
                >
                  {typeof value === 'string' ? lang(value) : value}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {pagination && (
        <div className={cn([classes.pagination, 'fds-table__header__cell'])}>
          <AltinnPagination
            numberOfRows={data?._metaData.totaltItemsCount ?? 0}
            rowsPerPageOptions={pagination?.alternatives ? pagination?.alternatives : []}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              setPageSize(parseInt(event.target.value, 10));
            }}
            currentPage={pageNumber}
            setCurrentPage={(newPage: number) => {
              setPageNumber(newPage);
            }}
            descriptionTexts={(language?.['list_component'] ?? {}) as unknown as DescriptionText}
          />
        </div>
      )}
    </ComponentStructureWrapper>
  );
};
