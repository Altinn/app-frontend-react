import React, { useCallback } from 'react';

import { Pagination, Table, usePagination } from '@digdir/designsystemet-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';

import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMini, useIsMobile, useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/RepeatingGroupPagination.module.css';

export function RepeatingGroupPagination() {
  const { hasPagination, rowsPerPage, currentPage, totalPages, changePage, visibleRows, node } = useRepeatingGroup();
  const isTablet = useIsMobileOrTablet();
  const isMobile = useIsMobile();
  const isMini = useIsMini();

  const getScrollPosition = useCallback(
    () => document.querySelector(`[data-pagination-id="${node.item.id}"]`)?.getClientRects().item(0)?.y,
    [node.item.id],
  );

  if (!hasPagination) {
    return null;
  }

  if (visibleRows.length <= rowsPerPage) {
    return null;
  }

  /**
   * The last page can have fewer items than the other pages,
   * navigating to or from the last page will cause everything to move.
   * This resets the scroll position so that the buttons are in the same place.
   */
  const resetScrollPosition = (prevScrollPosition: number | undefined) => {
    if (prevScrollPosition === undefined) {
      return;
    }
    let attemptsLeft = 10;
    const check = () => {
      attemptsLeft--;
      if (attemptsLeft <= 0) {
        return;
      }
      const newScrollPosition = getScrollPosition();
      if (newScrollPosition !== undefined && newScrollPosition !== prevScrollPosition) {
        window.scrollBy({ top: newScrollPosition - prevScrollPosition });
      } else {
        requestAnimationFrame(check);
      }
    };
    requestAnimationFrame(check);
  };

  const onChange = async (pageNumber: number) => {
    const prevScrollPosition = getScrollPosition();
    await changePage(pageNumber - 1);
    resetScrollPosition(prevScrollPosition);
  };

  return (
    <Table.Body>
      <Table.Row className={!isTablet ? classes.row : undefined}>
        <Table.Cell colSpan={100}>
          <PaginationComponent
            data-pagination-id={node.item.id}
            className={classes.pagination}
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onChange={onChange}
            compact={isTablet}
            hideLabels={isMobile}
            size={isMini ? 'small' : 'medium'}
          />
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  );
}

type PaginationComponentProps = {
  size: NonNullable<Parameters<typeof Pagination>[0]['size']>;
  compact: boolean;
  hideLabels: boolean;
  currentPage: number;
  totalPages: number;
  onChange: Parameters<typeof Pagination>[0]['onChange'];
} & Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>;

const iconSize = {
  small: '1rem',
  medium: '1.5rem',
  large: '2rem',
};

function PaginationComponent({
  size,
  compact,
  hideLabels,
  currentPage,
  totalPages,
  onChange,
  ...rest
}: PaginationComponentProps) {
  const { pages, showNextPage, showPreviousPage } = usePagination({
    compact,
    currentPage,
    totalPages,
  });
  const { langAsString } = useLanguage();

  const nextLabel = langAsString('general.next');
  const previousLabel = langAsString('general.back');

  return (
    <Pagination.Root
      aria-label='Pagination'
      size={size}
      compact={compact}
      {...rest}
    >
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous
            className={!showPreviousPage ? classes.hidden : undefined}
            onClick={() => {
              onChange(currentPage - 1);
            }}
            aria-label={previousLabel}
          >
            <ChevronLeftIcon
              aria-hidden
              fontSize={iconSize[size]}
            />
            {!hideLabels && previousLabel}
          </Pagination.Previous>
        </Pagination.Item>
        {pages.map((page, i) => (
          <Pagination.Item key={`${page}${i}`}>
            {page === 'ellipsis' ? (
              <Pagination.Ellipsis />
            ) : (
              <Pagination.Button
                aria-current={currentPage === page}
                isActive={currentPage === page}
                aria-label={langAsString('general.page_number', [page])}
                onClick={() => {
                  onChange(page);
                }}
              >
                {page}
              </Pagination.Button>
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            aria-label={nextLabel}
            onClick={() => {
              onChange(currentPage + 1);
            }}
            className={!showNextPage ? classes.hidden : undefined}
          >
            {!hideLabels && nextLabel}
            <ChevronRightIcon
              aria-hidden
              fontSize={iconSize[size]}
            />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  );
}
