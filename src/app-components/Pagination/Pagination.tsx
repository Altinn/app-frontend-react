import React from 'react';

import { Combobox, Pagination as DesignSystemPagination, usePagination } from '@digdir/designsystemet-react';

import classes from 'src/app-components/Pagination/Pagination.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMini, useIsMobile, useIsTablet } from 'src/hooks/useDeviceWidths';
import { optionSearchFilter } from 'src/utils/options';

type PaginationProps = {
  nextLabel: string;
  nextLabelAriaLabel: string;
  previousLabel: string;
  previousLabelAriaLabel: string;
  size: NonNullable<Parameters<typeof DesignSystemPagination>[0]['data-size']>;
  compact?: boolean;
  hideLabels?: boolean;
  showRowsPerPageDropdown?: boolean;
  currentPage: number;
  numberOfRows: number;
  pageSize: number;
  rowsPerPageText: string;
  rowsPerPageOptions?: number[];
  onPageSizeChange?: (value: string[]) => void;
  setCurrentPage: (pageNumber: number) => void;
  onChange?: Parameters<typeof DesignSystemPagination>[0]['onChange'];
} & Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>;

export const Pagination = ({
  nextLabel,
  previousLabel,
  size,
  compact,
  hideLabels,
  currentPage,
  setCurrentPage,
  onChange,
  onPageSizeChange,
  numberOfRows = 0,
  rowsPerPageOptions,
  rowsPerPageText,
  showRowsPerPageDropdown = false,
  pageSize,
}: PaginationProps) => {
  const isMini = useIsMini();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isCompact = compact || isMini || isTablet;

  const totalPages = Math.ceil(numberOfRows / pageSize);
  let showPages = isCompact ? 3 : 5;

  if (showPages > totalPages) {
    showPages = totalPages;
  }

  const { pages, prevButtonProps, nextButtonProps } = usePagination({
    currentPage,
    setCurrentPage,
    totalPages,
    onChange,
    showPages,
  });
  const { langAsString } = useLanguage();

  return (
    <>
      {showRowsPerPageDropdown && !isMobile && (
        <Combobox
          id='paginationRowsPerPageDropdown'
          data-testid='paginationRowsPerPageDropdown'
          filter={optionSearchFilter}
          size='sm'
          value={[pageSize.toString()]}
          onValueChange={onPageSizeChange}
          label={rowsPerPageText}
          aria-label={rowsPerPageText}
          className={classes.rowsPerPageDropdown}
        >
          <Combobox.Empty>
            <Lang id='form_filler.no_options_found' />
          </Combobox.Empty>
          {rowsPerPageOptions?.map((option, i) => (
            <Combobox.Option
              key={`${option}${i}`}
              value={option.toString()}
              displayValue={option.toString()}
            >
              <span>
                <wbr />
                {option}
              </span>
            </Combobox.Option>
          ))}
        </Combobox>
      )}
      <DesignSystemPagination
        data-testid='pagination'
        aria-label='Pagination'
        data-size={size}
        className={classes.pagination}
      >
        <DesignSystemPagination.List>
          <DesignSystemPagination.Item>
            <DesignSystemPagination.Button {...prevButtonProps}>
              {!hideLabels && !isMobile && previousLabel}
            </DesignSystemPagination.Button>
          </DesignSystemPagination.Item>
          {pages.map(({ page, itemKey, buttonProps }) => (
            <DesignSystemPagination.Item key={itemKey}>
              {typeof page === 'number' && (
                <DesignSystemPagination.Button
                  aria-current={currentPage === page}
                  aria-label={langAsString('general.page_number', [page])}
                  {...buttonProps}
                >
                  {page}
                </DesignSystemPagination.Button>
              )}
            </DesignSystemPagination.Item>
          ))}
          <DesignSystemPagination.Item>
            <DesignSystemPagination.Button {...nextButtonProps}>
              {!hideLabels && !isMobile && nextLabel}
            </DesignSystemPagination.Button>
          </DesignSystemPagination.Item>
        </DesignSystemPagination.List>
      </DesignSystemPagination>
    </>
  );
};
