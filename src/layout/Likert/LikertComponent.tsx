import React from 'react';

import { Table } from '@digdir/design-system-react';
import { Grid, Typography } from '@material-ui/core';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { DisplayLikertRow } from 'src/layout/Likert/LikertRow';
import classes from 'src/layout/Likert/LikertRow.module.css';
import { useLikertRows } from 'src/layout/Likert/useLikertRows';
import type { PropsFromGenericComponent } from 'src/layout';

export const LikertComponent = ({ node }: PropsFromGenericComponent<'Likert'>) => {
  const mobileView = useIsMobileOrTablet();
  const { options: calculatedOptions, isFetching } = useGetOptions({
    ...node.item,
    node,
    valueType: 'single',
    dataModelBindings: undefined,
  });
  const { lang } = useLanguage();
  const rows = useLikertRows(node.item);

  const id = node.item.id;
  const hasDescription = !!node?.item.textResourceBindings?.description;
  const hasTitle = !!node?.item.textResourceBindings?.title;
  const titleId = `likert-title-${id}`;
  const descriptionId = `likert-description-${id}`;

  const Header = () => (
    <Grid
      item={true}
      xs={12}
      data-componentid={node?.item.id}
    >
      {hasTitle && (
        <Typography
          component='div'
          variant='h3'
          style={{ width: '100%' }}
          id={titleId}
        >
          {lang(node?.item.textResourceBindings?.title)}
        </Typography>
      )}
      {hasDescription && (
        <Typography
          variant='body1'
          gutterBottom
          id={descriptionId}
        >
          {lang(node?.item.textResourceBindings?.description)}
        </Typography>
      )}
    </Grid>
  );

  if (mobileView) {
    return (
      <Grid
        item
        container
      >
        <Header />
        <div
          role='group'
          aria-labelledby={(hasTitle && titleId) || undefined}
          aria-describedby={(hasDescription && descriptionId) || undefined}
        >
          {rows.map((row) => (
            <DisplayLikertRow
              key={`likert-row-${row.uuid}`}
              node={node}
              mobile={true}
              row={row}
            />
          ))}
        </div>
      </Grid>
    );
  }

  return (
    <>
      <Header />
      {isFetching ? (
        <AltinnSpinner />
      ) : (
        <div className={classes.likertTableContainer}>
          <Table
            id={id}
            aria-labelledby={(hasTitle && titleId) || undefined}
            aria-describedby={(hasDescription && descriptionId) || undefined}
            className={classes.likertTable}
            role='group'
          >
            <Table.Head
              id={`likert-table-header-${id}`}
              aria-hidden={true}
            >
              <Table.Row>
                <Table.HeaderCell id={`${id}-likert-columnheader-left`}>
                  <span
                    className={cn(classes.likertTableHeaderCell, {
                      'sr-only': node?.item.textResourceBindings?.leftColumnHeader == null,
                    })}
                  >
                    <Lang
                      id={node?.item.textResourceBindings?.leftColumnHeader ?? 'likert.left_column_default_header_text'}
                    />
                  </span>
                </Table.HeaderCell>
                {calculatedOptions.map((option, index) => {
                  const colLabelId = `${id}-likert-columnheader-${index}`;
                  return (
                    <Table.HeaderCell
                      key={option.value}
                      className={classes.likertTableHeaderCell}
                      id={colLabelId}
                    >
                      {lang(option.label)}
                    </Table.HeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Head>
            <Table.Body id={`likert-table-body-${id}`}>
              {rows.map((row) => (
                <DisplayLikertRow
                  key={`likert-row-${row.uuid}`}
                  mobile={false}
                  node={node}
                  row={row}
                />
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </>
  );
};
