import React from 'react';

import { RadioButton } from '@altinn/altinn-design-system';
import { TableCell, TableRow, Typography } from '@material-ui/core';

import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { LayoutStyle } from 'src/types';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { IControlledRadioGroupProps } from 'src/layout/RadioButtons/ControlledRadioGroup';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export const LikertComponent = (props: IRadioButtonsContainerProps) => {
  const { layout } = props;
  const useRadioProps = useRadioButtons(props);

  if (layout === LayoutStyle.Table) {
    return (
      <RadioGroupTableRow
        {...props}
        {...useRadioProps}
      />
    );
  }

  return (
    <ControlledRadioGroup
      {...props}
      {...useRadioProps}
    />
  );
};

const RadioGroupTableRow = ({
  id,
  selected,
  handleChange,
  calculatedOptions,
  handleBlur,
  groupContainerId,
  componentValidations,
  legend,
  isValid,
}: IControlledRadioGroupProps) => {
  const RenderLegend = legend;
  const rowLabelId = `row-label-${id}`;
  return (
    <TableRow aria-labelledby={rowLabelId}>
      <th
        scope='row'
        id={rowLabelId}
        style={{ whiteSpace: 'normal', fontWeight: 400, borderBottom: '1px solid rgb(0, 143, 214)', paddingLeft: 12 }}
      >
        <Typography component={'div'}>
          <RenderLegend />
          {renderValidationMessagesForComponent(componentValidations?.simpleBinding, id)}
        </Typography>
      </th>
      {calculatedOptions?.map((option, colIndex) => {
        // column label must reference correct id of header in table
        const colLabelId = `${groupContainerId}-likert-columnheader-${colIndex}`;
        const inputId = `${id}-${colIndex}`;
        const isChecked = selected === option.value;
        return (
          <TableCell
            key={option.value}
            align={'center'}
            onBlur={handleBlur}
          >
            <RadioButton
              checked={isChecked}
              onChange={handleChange}
              value={option.value}
              label={`${rowLabelId} ${colLabelId}`}
              hideLabel={true}
              name={rowLabelId}
              radioId={inputId}
              error={!isValid}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
};
