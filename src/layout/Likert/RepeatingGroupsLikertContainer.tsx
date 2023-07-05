import React from 'react';

import { Grid, TableCell, Typography } from '@material-ui/core';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { AltinnTable } from 'src/components/organisms/AltinnTable';
import { AltinnTableBody } from 'src/components/table/AltinnTableBody';
import { AltinnTableHeader } from 'src/components/table/AltinnTableHeader';
import { AltinnTableRow } from 'src/components/table/AltinnTableRow';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useGetOptions } from 'src/hooks/useGetOptions';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import { LayoutStyle } from 'src/types';
import { getOptionLookupKey } from 'src/utils/options';
import type { IGenericComponentProps } from 'src/layout/GenericComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

type RepeatingGroupsLikertContainerProps = {
  node: LayoutNodeFromType<'Group'>;
};

export const RepeatingGroupsLikertContainer = ({ node }: RepeatingGroupsLikertContainerProps) => {
  const firstLikertChild = node?.children((item) => item.type === 'Likert') as LayoutNodeFromType<'Likert'> | undefined;
  const { optionsId, mapping, source, options } = firstLikertChild?.item || {};
  const mobileView = useIsMobileOrTablet();
  const apiOptions = useGetOptions({ optionsId, mapping, source });
  const calculatedOptions = apiOptions || options || [];
  const lookupKey = optionsId && getOptionLookupKey({ id: optionsId, mapping });
  const fetchingOptions = useAppSelector((state) => lookupKey && state.optionState.options[lookupKey]?.loading);
  const { lang } = useLanguage();

  const id = node.item.id;
  const hasDescription = !!node?.textResourceBindings?.description;
  const hasTitle = !!node?.textResourceBindings?.title;
  const titleId = `likert-title-${id}`;
  const descriptionId = `likert-description-${id}`;

  const Header = (
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
          {lang(node?.textResourceBindings?.title)}
        </Typography>
      )}
      {hasDescription && (
        <Typography
          variant='body1'
          gutterBottom
          id={descriptionId}
        >
          {lang(node?.textResourceBindings?.description)}
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
        {Header}
        <div
          role='group'
          aria-labelledby={(hasTitle && titleId) || undefined}
          aria-describedby={(hasDescription && descriptionId) || undefined}
        >
          {node?.children().map((comp) => {
            if (comp.isType('Group') || comp.isType('Summary')) {
              window.logWarn('Unexpected Group or Summary inside likert container:\n', comp);
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
      {Header}
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <AltinnTable
          id={id}
          tableLayout='auto'
          wordBreak='normal'
          aria-labelledby={(hasTitle && titleId) || undefined}
          aria-describedby={(hasDescription && descriptionId) || undefined}
        >
          <AltinnTableHeader
            id={`likert-table-header-${id}`}
            padding={'dense'}
          >
            <AltinnTableRow>
              {node?.textResourceBindings?.leftColumnHeader ? (
                <TableCell>{lang(node?.textResourceBindings?.leftColumnHeader)}</TableCell>
              ) : (
                <td />
              )}
              {calculatedOptions.map((option, index) => {
                const colLabelId = `${id}-likert-columnheader-${index}`;
                return (
                  <TableCell
                    key={option.value}
                    id={colLabelId}
                    align='center'
                  >
                    {lang(option.label)}
                  </TableCell>
                );
              })}
            </AltinnTableRow>
          </AltinnTableHeader>
          <AltinnTableBody
            id={`likert-table-body-${id}`}
            padding={'dense'}
          >
            {node?.children().map((comp) => {
              if (comp.isType('Group') || comp.isType('Summary')) {
                window.logWarn('Unexpected Group or Summary inside likert container:\n', comp);
                return;
              }

              const override: IGenericComponentProps<'Likert'>['overrideItemProps'] = {
                layout: LayoutStyle.Table,
              };

              return (
                <GenericComponent
                  key={comp.item.id}
                  node={comp as LayoutNodeFromType<'Likert'>}
                  overrideItemProps={override}
                />
              );
            })}
          </AltinnTableBody>
        </AltinnTable>
      )}
    </>
  );
};
