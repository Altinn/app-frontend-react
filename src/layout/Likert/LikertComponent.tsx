import React from 'react';

import { Label as DesignsystemetLabel, Table } from '@digdir/designsystemet-react';
import cn from 'classnames';

import type { PropsFromGenericComponent } from '..';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { Caption } from 'src/components/form/Caption';
import { Description } from 'src/components/form/Description';
import { getDescriptionId, getLabelId } from 'src/components/label/Label';
import { LabelContent } from 'src/components/label/LabelContent';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useNodeOptions } from 'src/features/options/useNodeOptions';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { LayoutStyle } from 'src/layout/common.generated';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import classes from 'src/layout/LikertItem/LikertItemComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { typedBoolean } from 'src/utils/typing';
import type { IGenericComponentProps } from 'src/layout/GenericComponent';

type LikertComponentProps = PropsFromGenericComponent<'Likert'>;

export const LikertComponent = ({ node }: LikertComponentProps) => {
  const { textResourceBindings, rows } = useNodeItem(node);
  const mobileView = useIsMobileOrTablet();
  const { options: calculatedOptions, isFetching } = useNodeOptions(rows.find((row) => !!row)?.itemNode);
  const { lang } = useLanguage();
  const rowNodes = rows.map((row) => row?.itemNode).filter(typedBoolean);

  const id = node.id;

  const title = textResourceBindings?.title;
  const description = textResourceBindings?.description;

  if (mobileView) {
    return (
      <ComponentStructureWrapper
        node={node}
        data-componentid={node.id}
        data-componentbaseid={node.baseId}
      >
        {(title || description) && (
          <div className={classes.likertMobileLabel}>
            <span id={getLabelId(node.id)}>
              <DesignsystemetLabel
                asChild
                size='lg'
              >
                <LabelContent
                  componentId={node.id}
                  label={title}
                />
              </DesignsystemetLabel>
            </span>
            <Description
              description={description}
              componentId={node.id}
            />
          </div>
        )}
        <div
          role='group'
          className={classes.likertMobileGroup}
          aria-labelledby={textResourceBindings?.title ? getLabelId(node.id) : undefined}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(node.id) : undefined}
        >
          {rowNodes.map((comp) => (
            <GenericComponent
              key={comp.id}
              node={comp}
            />
          ))}
        </div>
      </ComponentStructureWrapper>
    );
  }

  return (
    <ComponentStructureWrapper
      node={node}
      data-componentid={node.id}
      data-componentbaseid={node.baseId}
    >
      {isFetching ? (
        <AltinnSpinner />
      ) : (
        <Table
          id={id}
          className={classes.likertTable}
          aria-describedby={textResourceBindings?.description ? getDescriptionId(id) : undefined}
        >
          <Caption
            id={node.id}
            title={textResourceBindings?.title}
            description={textResourceBindings?.description}
            designSystemLabelProps={{ size: 'lg' }}
          />
          <Table.Head id={`likert-table-header-${id}`}>
            <Table.Row>
              <Table.HeaderCell scope='col'>
                <span
                  className={cn({
                    'sr-only': textResourceBindings?.leftColumnHeader == null,
                  })}
                >
                  <Lang id={textResourceBindings?.leftColumnHeader ?? 'likert.left_column_default_header_text'} />
                </span>
              </Table.HeaderCell>
              {calculatedOptions.map((option, index) => (
                <Table.HeaderCell
                  key={option.value}
                  scope='col'
                  id={`${id}-likert-columnheader-${index}`}
                >
                  {lang(option.label)}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rowNodes.map((comp) => {
              const override: IGenericComponentProps<'LikertItem'>['overrideItemProps'] = {
                layout: LayoutStyle.Table,
              };

              return (
                <GenericComponent
                  key={comp.id}
                  node={comp}
                  overrideDisplay={{ directRender: true }}
                  overrideItemProps={override}
                />
              );
            })}
          </Table.Body>
        </Table>
      )}
    </ComponentStructureWrapper>
  );
};
