import React, { forwardRef } from 'react';

import { Label, Radio, Table } from '@digdir/designsystemet-react';
import cn from 'classnames';

import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getLabelId } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { LayoutStyle } from 'src/layout/common.generated';
import classes from 'src/layout/LikertItem/LikertItemComponent.module.css';
import { ControlledRadioGroup } from 'src/layout/RadioButtons/ControlledRadioGroup';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { useExternalItem } from 'src/utils/layout/hooks';
import { LayoutNode } from 'src/utils/layout/LayoutNode';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export const LikertItemComponent = forwardRef<HTMLTableRowElement, PropsFromGenericComponent<'LikertItem'>>(
  (props, ref) => {
    const item = useItemWhenType(props.node.baseId, 'LikertItem');
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

const RadioGroupTableRow = forwardRef<HTMLTableRowElement, PropsFromGenericComponent<'LikertItem'>>((props, ref) => {
  const { node } = props;
  const { selectedValues, handleChange, calculatedOptions, fetchingOptions } = useRadioButtons(props);
  const validations = useUnifiedValidationsForNode(node.baseId);

  const { id, readOnly, textResourceBindings, required } = useItemWhenType(node.baseId, 'LikertItem');
  const groupContainer = node.parent instanceof LayoutNode && node.parent.isType('Likert') ? node.parent : undefined;

  const columns = useExternalItem(props.node.baseId, 'LikertItem').columns;

  return (
    <Table.Row
      data-componentid={node.id}
      data-is-loading={fetchingOptions ? 'true' : 'false'}
      ref={ref}
      role='row'
    >
      <Table.Cell
        id={getLabelId(node.id)}
        role='rowheader'
      >
        <Label
          asChild
          data-size='sm'
          weight='regular'
        >
          <span>
            <Lang id={textResourceBindings?.title} />
            <RequiredIndicator required={required} />
          </span>
        </Label>
        <ComponentValidations
          validations={validations}
          baseComponentId={node.baseId}
        />
      </Table.Cell>
      {calculatedOptions?.map((option, index) => {
        const isChecked = selectedValues[0] === option.value;
        const rowLabelId = getLabelId(id);
        const labelledby = `${rowLabelId} ${groupContainer?.baseId}-likert-columnheader-${index}`;
        const divider = columns?.find((column) => column.value == option.value)?.divider;

        return (
          <Table.Cell
            key={option.value}
            className={cn({
              [classes.likertCellDividerStart]: divider === 'before',
              [classes.likertCellDividerEnd]: divider === 'after',
              [classes.likertCellDividerBoth]: divider === 'both',
            })}
          >
            <div className={classes.likertRadioButton}>
              <Radio
                checked={isChecked}
                readOnly={readOnly}
                onChange={handleChange}
                value={option.value}
                name={rowLabelId}
                aria-labelledby={labelledby}
              />
            </div>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
});

RadioGroupTableRow.displayName = 'RadioGroupTableRow';
