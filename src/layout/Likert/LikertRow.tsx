import React from 'react';

import { Radio, Table } from '@digdir/design-system-react';
import { Typography } from '@material-ui/core';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { Lang } from 'src/features/language/Lang';
import { isTextReference, OverrideLang } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useDeepValidationsForNode } from 'src/features/validation/selectors/deepValidationsForNode';
import { GenericComponentLegend } from 'src/layout/GenericComponentUtils';
import classes from 'src/layout/Likert/LikertRow.module.css';
import { InnerRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import type { LikertRow } from 'src/layout/Likert/useLikertRows';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface Props {
  row: LikertRow;
  node: LayoutNode<'Likert'>;
}

export interface LikertRowProps extends Props {
  mobile: boolean;
}

export const DisplayLikertRow = ({ mobile, row, node }: LikertRowProps) => {
  if (mobile) {
    return (
      <div className={classes.likertRadioGroupWrapperMobile}>
        <MobileRow
          row={row}
          node={node}
        />
      </div>
    );
  }

  return (
    <DesktopRow
      row={row}
      node={node}
    />
  );
};

const useLikertOptions = (node: LayoutNode<'Likert'>, row: LikertRow) =>
  useGetOptions({
    ...node.item,
    dataModelBindings: row.answerPath ? { simpleBinding: row.answerPath } : undefined,
    node,
    valueType: 'single',
  });

const useLikertValidations = (node: LayoutNode<'Likert'>, row: LikertRow) =>
  useDeepValidationsForNode(node).filter((v) => {
    // We only want to show the validations for the current row
    const firstParam = v.message.params?.[0];
    return firstParam ? isTextReference(firstParam) && firstParam.dataModelPath === row.answerPath : true;
  });

const MobileRow = ({ node, row }: Props) => {
  const { id, textResourceBindings } = node.item;
  const { options, isFetching, currentStringy, setData, current } = useLikertOptions(node, row);
  const validations = useLikertValidations(node, row);

  if (isFetching) {
    return (
      <div>
        <AltinnSpinner />
      </div>
    );
  }

  return (
    <OverrideLang value={{ dataSources: { dataModelPath: row.answerPath } }}>
      <InnerRadioGroup
        id={`${id}-${row.uuid}`}
        options={options}
        currentStringy={currentStringy}
        setData={setData}
        current={current}
        isValid={validations.length === 0}
        texts={{
          labelPrefix: textResourceBindings?.leftColumnHeader,
          help: textResourceBindings?.questionHelpTexts,
          title: textResourceBindings?.questions,
          description: textResourceBindings?.questionDescriptions,
        }}
      />
      <ComponentValidations
        validations={validations}
        node={node}
      />
    </OverrideLang>
  );
};

const DesktopRow = ({ node, row }: Props) => {
  const { options, isFetching, current, setData } = useLikertOptions(node, row);
  const validations = useLikertValidations(node, row);
  const rowLabelId = `row-label-${node.item.id}-${row.uuid}`;

  return (
    <OverrideLang value={{ dataSources: { dataModelPath: row.answerPath } }}>
      <Table.Row
        aria-labelledby={`${node.item.id}-likert-columnheader-left ${rowLabelId}`}
        data-componentid={node.item.id}
        data-is-loading={isFetching ? 'true' : 'false'}
        role='radiogroup'
      >
        <Table.Cell id={rowLabelId}>
          <Typography component={'div'}>
            <GenericComponentLegend
              overrideTextResources={{
                title: node.item.textResourceBindings?.questions,
                description: node.item.textResourceBindings?.questionDescriptions,
                help: node.item.textResourceBindings?.questionHelpTexts,
              }}
            />
            <ComponentValidations
              validations={validations}
              node={node}
            />
          </Typography>
        </Table.Cell>
        {options?.map((option) => (
          <Table.Cell key={option.value}>
            <Radio
              checked={option === current}
              onChange={(ev) => setData(ev.target.value)}
              value={option.value}
              className={classes.likertRadioButton}
              name={rowLabelId}
            >
              <span className='sr-only'>
                <Lang id={option.label} />
              </span>
            </Radio>
          </Table.Cell>
        ))}
      </Table.Row>
    </OverrideLang>
  );
};
