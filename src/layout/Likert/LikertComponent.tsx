import React from 'react';

import { TableCell, TableRow } from '@digdir/design-system-react';
import { Typography } from '@material-ui/core';

import { RadioButton } from 'src/components/form/RadioButton';
import { useLanguage } from 'src/hooks/useLanguage';
import { LayoutStyle } from 'src/layout/common.generated';
import classes from 'src/layout/Likert/LikertComponent.module.css';
import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import { getPlainTextFromNode } from 'src/utils/stringHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IControlledRadioGroupProps } from 'src/layout/RadioButtons/ControlledRadioGroup';

export const LikertComponent = (props: PropsFromGenericComponent<'Likert'>) => {
  const nodeLayout = props.node.item.layout;
  const overriddenLayout = props.overrideItemProps?.layout;
  const actualLayout = overriddenLayout || nodeLayout;

  if (actualLayout === LayoutStyle.Table) {
    return <RadioGroupTableRow {...props} />;
  }

  return (
    <div className={classes.likertRadioGroupWrapperMobile}>
      <ControlledRadioGroup {...props} />
    </div>
  );
};

const RadioGroupTableRow = (props: IControlledRadioGroupProps) => {
  const { node, componentValidations, legend, isValid } = props;
  const { selected, handleChange, calculatedOptions, handleBlur, fetchingOptions } = useRadioButtons(props);
  const { lang, langAsString } = useLanguage();

  const id = node.item.id;
  const groupContainerId = node.closest((n) => n.type === 'Group')?.item.id;
  const RenderLegend = legend;
  const rowLabelId = `row-label-${id}`;
  const texts = node.item.textResourceBindings;

  return (
    <TableRow
      aria-labelledby={rowLabelId}
      data-componentid={node.item.id}
      data-is-loading={fetchingOptions ? 'true' : 'false'}
      className={classes.likertTableRow}
    >
      <TableCell
        scope='row'
        id={rowLabelId}
        className={classes.likertTableRowHeader}
        variant='header'
      >
        <Typography component={'div'}>
          <RenderLegend />
          {renderValidationMessagesForComponent(componentValidations?.simpleBinding, id)}
        </Typography>
      </TableCell>
      {calculatedOptions?.map((option, colIndex) => {
        const colLabelId = `${groupContainerId}-likert-columnheader-${colIndex}`;
        const inputId = `${id}-${colIndex}`;
        const isChecked = selected === option.value;
        return (
          <TableCell
            key={option.value}
            className={classes.likertTableCell}
            onBlur={handleBlur}
          >
            <div className={classes.radioButtonContainer}>
              <RadioButton
                aria-labelledby={`${rowLabelId} ${colLabelId}`}
                checked={isChecked}
                onChange={handleChange}
                value={option.value}
                label={`${getPlainTextFromNode(lang(texts?.title))} ${langAsString(option.label)}`}
                hideLabel={true}
                name={rowLabelId}
                radioId={inputId}
                error={!isValid}
              />
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
};
