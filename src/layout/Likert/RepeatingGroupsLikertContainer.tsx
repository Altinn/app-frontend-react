import React from 'react';

import { Table } from '@digdir/design-system-react';
import { Grid, Typography } from '@material-ui/core';
import cn from 'classnames';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useGetOptions } from 'src/hooks/useGetOptions';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { LayoutStyle } from 'src/layout/common.generated';
import { GenericComponent } from 'src/layout/GenericComponent';
import classes from 'src/layout/Likert/LikertComponent.module.css';
import { getOptionLookupKey } from 'src/utils/options';
import type { IGenericComponentProps } from 'src/layout/GenericComponent';
import type { CompGroupRepeatingLikertInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type RepeatingGroupsLikertContainerProps = {
  node: LayoutNodeForGroup<CompGroupRepeatingLikertInternal>;
};

export const RepeatingGroupsLikertContainer = ({ node }: RepeatingGroupsLikertContainerProps) => {
  const firstLikertChild = node?.children((item) => item.type === 'Likert') as LayoutNode<'Likert'> | undefined;
  const { optionsId, mapping, queryParameters, source, options } = firstLikertChild?.item || {};
  const mobileView = useIsMobileOrTablet();
  const apiOptions = useGetOptions({ optionsId, mapping, queryParameters, source });
  const calculatedOptions = apiOptions || options || [];
  const lookupKey = optionsId && getOptionLookupKey({ id: optionsId, mapping });
  const fetchingOptions = useAppSelector((state) => lookupKey && state.optionState.options[lookupKey]?.loading);
  const { lang } = useLanguage();

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
          {node?.children().map((comp) => {
            if (comp.isType('Group') || comp.isType('Summary')) {
              window.logWarnOnce('Unexpected Group or Summary inside likert container:\n', comp.item.id);
              return;
            }

            return (
              <GenericComponent
                key={comp.item.id}
                node={comp}
              />
            );
          })}
        </div>
      </Grid>
    );
  }

  return (
    <>
      <Header />
      {fetchingOptions ? (
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
              className={classes.likertTableHeader}
            >
              <Table.Row>
                <Table.HeaderCell
                  id={`${id}-likert-columnheader-left`}
                  aria-hidden={true}
                >
                  <span className={cn({ 'sr-only': node?.item.textResourceBindings?.leftColumnHeader == null })}>
                    {lang(
                      node?.item.textResourceBindings?.leftColumnHeader ?? 'likert.left_column_default_header_text',
                    )}
                  </span>
                </Table.HeaderCell>
                {calculatedOptions.map((option, index) => {
                  const colLabelId = `${id}-likert-columnheader-${index}`;
                  return (
                    <Table.HeaderCell
                      key={option.value}
                      aria-hidden='true'
                      id={colLabelId}
                      className={classes.likertTableHeaderCell}
                    >
                      {lang(option.label)}
                    </Table.HeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Head>
            <Table.Body id={`likert-table-body-${id}`}>
              {node?.children().map((comp) => {
                if (comp.isType('Group') || comp.isType('Summary')) {
                  window.logWarnOnce('Unexpected Group or Summary inside likert container:\n', comp.item.id);
                  return;
                }

                const override: IGenericComponentProps<'Likert'>['overrideItemProps'] = {
                  layout: LayoutStyle.Table,
                };

                return (
                  <GenericComponent
                    key={comp.item.id}
                    node={comp as LayoutNode<'Likert'>}
                    overrideItemProps={override}
                  />
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </>
  );
};
