import React, { forwardRef } from 'react';

import { Radio, Table } from '@digdir/designsystemet-react';

import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getLabelId } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { LayoutStyle } from 'src/layout/common.generated';
import classes from 'src/layout/LikertItem/LikertItemComponent.module.css';
import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IControlledRadioGroupProps } from 'src/layout/RadioButtons/ControlledRadioGroup';

export const LikertItemComponent = forwardRef<HTMLTableRowElement, PropsFromGenericComponent<'LikertItem'>>(
  (props, ref) => {
    const item = useNodeItem(props.node);
    const overriddenLayout = props.overrideItemProps?.layout;
    const layout = overriddenLayout ?? item.layout;

    if (layout === LayoutStyle.Table) {
      return (
        <RadioGroupTableRow
          {...props}
          ref={ref}
        />
      );
    }

    return <ControlledRadioGroup {...props} />;
  },
);
LikertItemComponent.displayName = 'LikertItemComponent';

const RadioGroupTableRow = forwardRef<HTMLTableRowElement, IControlledRadioGroupProps>((props, ref) => {
  const { node } = props;
  const { selectedValues, handleChange, calculatedOptions, fetchingOptions } = useRadioButtons(props);
  const validations = useUnifiedValidationsForNode(node);

  const { id, readOnly, textResourceBindings, required } = useNodeItem(node);
  const groupContainer =
    node.parent instanceof BaseLayoutNode && node.parent.isType('Likert') ? node.parent : undefined;

  return (
    <Table.Row
      data-componentid={node.id}
      data-is-loading={fetchingOptions ? 'true' : 'false'}
      ref={ref}
      role='row'
      tabIndex={0}
    >
      <Table.HeaderCell
        id={getLabelId(node.id)}
        scope='row'
        role='rowheader'
      >
        <Lang id={textResourceBindings?.title} />
        <RequiredIndicator required={required} />
        <ComponentValidations validations={validations} />
      </Table.HeaderCell>
      {calculatedOptions?.map((option, index) => {
        const isChecked = selectedValues[0] === option.value;
        // TODO: get this from props when LikertItemComponent is refactored to be an internal component
        const labelledby = `${getLabelId(id)} ${groupContainer?.baseId}-likert-columnheader-${index}`;

        return (
          <Table.Cell key={option.value}>
            <Radio
              checked={isChecked}
              readOnly={readOnly}
              onChange={handleChange}
              value={option.value}
              className={classes.likertRadioButton}
              aria-labelledby={labelledby}
            />
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
});

RadioGroupTableRow.displayName = 'RadioGroupTableRow';
