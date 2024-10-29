import React, { useCallback, useMemo } from 'react';

import { Pagination, Table, usePagination } from '@digdir/designsystemet-react';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { useResetScrollPosition } from 'src/core/ui/useResetScrollPosition';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMini, useIsMobile, useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import classes from 'src/layout/RepeatingGroup/Pagination/RepeatingGroupPagination.module.css';
import {
  useRepeatingGroup,
  useRepeatingGroupPagination,
  useRepeatingGroupRowState,
} from 'src/layout/RepeatingGroup/Providers/RepeatingGroupContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { useNodeTraversalSelector } from 'src/utils/layout/useNodeTraversal';
import type { RepGroupRow } from 'src/layout/RepeatingGroup/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface RepeatingGroupPaginationProps {
  inTable?: boolean;
}

/**
 * Simple wrapper to prevent running any hooks unless pagination is actually going to be used
 * Specifically, usePagesWithErrors and useRowStructure would be doing unecessary work
 */
export function RepeatingGroupPagination(props: RepeatingGroupPaginationProps) {
  const { visibleRows } = useRepeatingGroupRowState();
  const { hasPagination, rowsPerPage } = useRepeatingGroupPagination();

  if (!hasPagination || visibleRows.length <= rowsPerPage) {
    return null;
  }

  return <RGPagination {...props} />;
}

function RGPagination({ inTable = true }: RepeatingGroupPaginationProps) {
  const { changePage, node } = useRepeatingGroup();
  const { hasPagination, rowsPerPage, currentPage, totalPages } = useRepeatingGroupPagination();
  const pagesWithErrors = usePagesWithErrors(rowsPerPage, node);
  const isTablet = useIsMobileOrTablet();
  const isMobile = useIsMobile();
  const isMini = useIsMini();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings || {});

  const getScrollPosition = useCallback(
    () => document.querySelector(`[data-pagination-id="${node.id}"]`)?.getClientRects().item(0)?.y,
    [node],
  );

  /**
   * The last page can have fewer items than the other pages,
   * navigating to or from the last page will cause everything to move.
   * This resets the scroll position so that the buttons are in the same place.
   */
  const resetScrollPosition = useResetScrollPosition(getScrollPosition);

  // Should never be true, but leaving it for type inference
  if (!hasPagination) {
    return null;
  }

  const onChange = async () => {
    const prevScrollPosition = getScrollPosition();
    resetScrollPosition(prevScrollPosition);
  };

  const setCurrentPage = (pagenumber: number) => {
    changePage(pagenumber - 1);
  };

  return (
    <ConditionalWrapper
      condition={inTable}
      wrapper={(children) => (
        <Table.Body>
          <Table.Row className={!isTablet ? classes.row : undefined}>
            <Table.Cell colSpan={100}>{children}</Table.Cell>
          </Table.Row>
        </Table.Body>
      )}
    >
      <PaginationComponent
        nextTextKey={textResourceBindings?.pagination_next_button ?? 'general.next'}
        backTextKey={textResourceBindings?.pagination_back_button ?? 'general.back'}
        data-pagination-id={node.id}
        className={classes.pagination}
        currentPage={currentPage + 1}
        totalPages={totalPages}
        pagesWithErrors={pagesWithErrors}
        onChange={() => onChange}
        setCurrentPage={setCurrentPage}
        compact={isTablet}
        hideLabels={isMobile}
        size={isMini ? 'sm' : 'md'}
      />
    </ConditionalWrapper>
  );
}

type PaginationComponentProps = {
  nextTextKey: string;
  backTextKey: string;
  size: NonNullable<Parameters<typeof Pagination>[0]['size']>;
  compact: boolean;
  hideLabels: boolean;
  currentPage: number;
  totalPages: number;
  pagesWithErrors: number[];
  setCurrentPage: (pageNumber: number) => void;
  onChange: Parameters<typeof Pagination>[0]['onChange'];
} & Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>;

function PaginationComponent({
  nextTextKey,
  backTextKey,
  size,
  compact,
  hideLabels,
  currentPage,
  totalPages,
  pagesWithErrors,
  setCurrentPage,
  onChange,
  ...rest
}: PaginationComponentProps) {
  const { pages, prevButtonProps, nextButtonProps, hasPrev, hasNext } = usePagination({
    setCurrentPage,
    currentPage,
    totalPages,
    onChange,
  });
  const { langAsString } = useLanguage();

  const nextLabel = langAsString(nextTextKey);
  const previousLabel = langAsString(backTextKey);

  return (
    <Pagination
      aria-label='Pagination'
      size={size}
      {...rest}
    >
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Button
            className={!hasPrev ? classes.hidden : undefined}
            aria-label={previousLabel}
            {...prevButtonProps}
          >
            {!hideLabels && previousLabel}
          </Pagination.Button>
        </Pagination.Item>
        {pages.map(({ page, buttonProps, itemKey }) => {
          const hasErrors = typeof page === 'number' && pagesWithErrors.includes(page - 1);
          const label = hasErrors
            ? `${langAsString('general.edit_alt_error')}: ${langAsString('general.page_number', [page])}`
            : langAsString('general.page_number', [page]);

          return (
            <Pagination.Item key={itemKey}>
              <Pagination.Button
                color={hasErrors ? 'danger' : 'accent'}
                aria-current={currentPage === page}
                aria-label={label}
                {...buttonProps}
              >
                {page}
              </Pagination.Button>
            </Pagination.Item>
          );
        })}
        <Pagination.Item>
          <Pagination.Button
            aria-label={nextLabel}
            className={!hasNext ? classes.hidden : undefined}
            {...nextButtonProps}
          >
            {!hideLabels && nextLabel}
          </Pagination.Button>
        </Pagination.Item>
      </Pagination.List>
    </Pagination>
  );
}

/**
 * Returns a list of pagination pages containing errors
 */
function usePagesWithErrors(rowsPerPage: number | undefined, node: LayoutNode<'RepeatingGroup'>) {
  const rows = useNodeItem(node).rows;
  const nodeValidationsSelector = NodesInternal.useValidationsSelector();
  const traversalSelector = useNodeTraversalSelector();

  return useMemo(() => {
    if (typeof rowsPerPage !== 'number') {
      return [];
    }

    const visibleRows: RepGroupRow[] = [];
    for (const row of rows) {
      if (row && !row.groupExpressions?.hiddenRow) {
        visibleRows.push(row);
      }
    }

    const pagesWithErrors: number[] = [];

    for (let i = 0; i < visibleRows.length; i++) {
      const pageNumber = Math.floor(i / rowsPerPage);
      if (pagesWithErrors.includes(pageNumber)) {
        continue;
      }

      const deepNodes = visibleRows[i].items?.flatMap((node) => traversalSelector((t) => t.with(node).flat(), [node]));
      for (const node of deepNodes || []) {
        const validations = nodeValidationsSelector(node, 'visible', 'error');
        if (validations.length > 0) {
          pagesWithErrors.push(pageNumber);
          break;
        }
      }
    }

    return pagesWithErrors;
  }, [nodeValidationsSelector, rows, rowsPerPage, traversalSelector]);
}
