import React from 'react';

import { RadioButton } from '@digdir/design-system-react';
import { TableCell, TableRow, Typography } from '@material-ui/core';

import classes from 'src/layout/Likert/LikertComponent.module.css';
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
    <div className={classes.likertRadioGroupWrapperMobile}>
      <ControlledRadioGroup
        {...props}
        {...useRadioProps}
      />
    </div>
  );
};

const RadioGroupTableRow = ({
  id,
  selected,
  handleChange,
  calculatedOptions,
  handleBlur,
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
        className={classes.likertTableHeader}
      >
        <Typography component={'div'}>
          <RenderLegend />
          {renderValidationMessagesForComponent(componentValidations?.simpleBinding, id)}
        </Typography>
      </th>
      {calculatedOptions?.map((option, colIndex) => {
        const inputId = `${id}-${colIndex}`;
        const isChecked = selected === option.value;
        return (
          <TableCell
            key={option.value}
            align={'center'}
            style={{ padding: '4px 12px' }}
            onBlur={handleBlur}
          >
            <RadioButton
              checked={isChecked}
              onChange={handleChange}
              value={option.value}
              label={
                <span>
                  <RenderLegend /> {option.label}
                </span>
              }
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
