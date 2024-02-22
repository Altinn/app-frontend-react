import React, { forwardRef } from 'react';
import type { Ref } from 'react';

import { Radio, Table } from '@digdir/design-system-react';
import { Typography } from '@material-ui/core';

import { useLanguage } from 'src/hooks/useLanguage';
import { LayoutStyle } from 'src/layout/common.generated';
import classes from 'src/layout/Likert/LikertComponent.module.css';
import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IControlledRadioGroupProps } from 'src/layout/RadioButtons/ControlledRadioGroup';

export const LikertComponent = forwardRef((props: PropsFromGenericComponent<'Likert'>, ref: Ref<HTMLElement>) => {
  const nodeLayout = props.node.item.layout;
  const overriddenLayout = props.overrideItemProps?.layout;
  const actualLayout = overriddenLayout || nodeLayout;

  if (actualLayout === LayoutStyle.Table) {
    return (
      <RadioGroupTableRow
        {...props}
        ref={ref as Ref<HTMLTableRowElement>}
      />
    );
  }

  return (
    <div className={classes.likertRadioGroupWrapperMobile}>
      <ControlledRadioGroup {...props} />
    </div>
  );
});
LikertComponent.displayName = 'LikertComponent';

const RadioGroupTableRow = forwardRef<HTMLTableRowElement, IControlledRadioGroupProps>((props, ref) => {
  const { node, componentValidations, legend } = props;
  const { selected, handleChange, calculatedOptions, handleBlur, fetchingOptions } = useRadioButtons(props);
  const { langAsString } = useLanguage();

  const id = node.item.id;
  const likertId = node.parents((p) => p.item.type === 'Group')?.[0].item.id;

  const rowLabelId = `row-label-${id}`;
  const headerColumnId = `${likertId}-likert-columnheader-left`;

  const RenderLegend = legend;

  return (
    <Table.Row
      aria-labelledby={`${headerColumnId} ${rowLabelId}`}
      data-componentid={node.item.id}
      data-is-loading={fetchingOptions ? 'true' : 'false'}
      ref={ref}
      role='radiogroup'
    >
      <Table.Cell id={rowLabelId}>
        <Typography component={'div'}>
          <RenderLegend />
          {renderValidationMessagesForComponent(componentValidations?.simpleBinding, id)}
        </Typography>
      </Table.Cell>
      {calculatedOptions?.map((option) => {
        const isChecked = selected === option.value;
        return (
          <Table.Cell
            key={option.value}
            onBlur={handleBlur}
          >
            <Radio
              checked={isChecked}
              onChange={handleChange}
              value={option.value}
              className={classes.likertRadioButton}
              name={rowLabelId}
            >
              <span className='sr-only'>{langAsString(option.label)}</span>
            </Radio>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
});
RadioGroupTableRow.displayName = 'RadioGroupTableRow';
