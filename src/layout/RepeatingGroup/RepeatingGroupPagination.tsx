import React, { useCallback } from 'react';

import { Pagination, Table } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMini, useIsMobile, useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useRepeatingGroup } from 'src/layout/RepeatingGroup/RepeatingGroupContext';
import classes from 'src/layout/RepeatingGroup/RepeatingGroupPagination.module.css';

export function RepeatingGroupPagination() {
  const { hasPagination, rowsPerPage, currentPage, totalPages, changePage, visibleRows, node } = useRepeatingGroup();
  const { langAsString } = useLanguage();
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
          <Pagination
            data-pagination-id={node.item.id}
            className={classes.pagination}
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onChange={onChange}
            compact={isTablet}
            hideLabels={isMobile}
            size={isMini ? 'small' : 'medium'}
            itemLabel={(n) => langAsString('general.page_number', [n])}
            nextLabel={langAsString('general.next')}
            previousLabel={langAsString('general.back')}
          />
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  );
}
