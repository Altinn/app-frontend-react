import React from 'react';

import { HelpText, Radio } from '@digdir/designsystemet-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RadioButton } from 'src/components/form/RadioButton';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsValid } from 'src/features/validation/selectors/isValid';
import classes from 'src/layout/RadioButtons/ControlledRadioGroup.module.css';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { shouldUseRowLayout } from 'src/utils/layout';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export type IControlledRadioGroupProps = IRadioButtonsContainerProps;

export const ControlledRadioGroup = (props: IControlledRadioGroupProps) => {
  const { node, overrideDisplay } = props;
  const isValid = useIsValid(node);
  const item = useNodeItem(node);
  const parentItem = useNodeItem(node.parent instanceof BaseLayoutNode ? node.parent : undefined);
  const { id, layout, readOnly, textResourceBindings, required, showLabelsInTable } = item;
  const showAsCard = 'showAsCard' in item ? item.showAsCard : false;
  const { selectedValues, handleChange, fetchingOptions, calculatedOptions } = useRadioButtons(props);
  const alertOnChange = 'alertOnChange' in item ? item.alertOnChange && !!selectedValues[0] : undefined;
  const labelSettings = 'labelSettings' in item ? item.labelSettings : undefined;
  const { lang, langAsString } = useLanguage();
  const selectedLabel = calculatedOptions.find((option) => option.value === selectedValues[0])?.label;
  const selectedLabelTranslated = langAsString(selectedLabel);
  const alertText = selectedLabel
    ? lang('form_filler.radiobutton_alert_label', [`<strong>${selectedLabelTranslated}</strong>`])
    : null;
  const confirmChangeText = langAsString('form_filler.alert_confirm');

  const getLabelPrefixForLikert = () => {
    if (parentItem?.type === 'Likert' && parentItem.textResourceBindings?.leftColumnHeader) {
      return `${langAsString(parentItem.textResourceBindings.leftColumnHeader)} `;
    }
    return null;
  };

  const labelText = (
    <span className={classes.labelContent}>
      {getLabelPrefixForLikert()}
      <Lang id={textResourceBindings?.title} />
      <RequiredIndicator required={required} />
      <OptionalIndicator
        labelSettings={labelSettings}
        required={required}
      />
    </span>
  );

  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1 && !showLabelsInTable;
  const shouldDisplayHorizontally = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });

  if (fetchingOptions) {
    return (
      <div>
        <AltinnSpinner />
      </div>
    );
  }

  return (
    <div id={id}>
      <Radio.Group
        legend={
          <span className={classes.label}>
            {labelText}
            {textResourceBindings?.help && (
              <HelpText title={langAsString(textResourceBindings.help)}>
                <Lang id={textResourceBindings.help} />
              </HelpText>
            )}
          </span>
        }
        hideLegend={overrideDisplay?.renderLegend === false}
        description={<Lang id={textResourceBindings?.description} />}
        error={!isValid}
        readOnly={readOnly}
        inline={shouldDisplayHorizontally}
        role='radiogroup'
      >
        {calculatedOptions.map((option) => (
          <RadioButton
            {...option}
            label={langAsString(option.label)}
            description={option.description && <Lang id={option.description} />}
            helpText={option.helpText && <Lang id={option.helpText} />}
            name={id}
            key={option.value}
            checked={option.value === selectedValues[0]}
            showAsCard={showAsCard}
            readOnly={readOnly}
            onChange={handleChange}
            hideLabel={hideLabel}
            size='small'
            alertOnChange={alertOnChange}
            alertText={alertText}
            confirmChangeText={confirmChangeText}
          />
        ))}
      </Radio.Group>
    </div>
  );
};
