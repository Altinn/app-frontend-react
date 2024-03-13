import React from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RadioButton } from 'src/components/form/RadioButton';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import classes from 'src/layout/RadioButtons/ControlledRadioGroup.module.css';
import { shouldUseRowLayout } from 'src/utils/layout';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { ILabelSettings } from 'src/layout/common.generated';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export type IControlledRadioGroupProps = IRadioButtonsContainerProps;

export const ControlledRadioGroup = (props: IControlledRadioGroupProps) => {
  const { node, isValid, overrideDisplay } = props;
  const { id, readOnly, textResourceBindings, required } = node.item;
  const showAsCard = 'showAsCard' in node.item ? node.item.showAsCard : false;
  const layout = 'layout' in node.item ? node.item.layout : undefined;
  const alertOnChange = 'alertOnChange' in node.item ? node.item.alertOnChange : undefined;
  const labelSettings = 'labelSettings' in node.item ? node.item.labelSettings : undefined;
  const { currentStringy, setData, isFetching, options, current } = useGetOptions({
    ...node.item,
    node,
    valueType: 'single',
  });

  const hideLabel = overrideDisplay?.renderedInTable === true && options.length === 1;
  const shouldDisplayHorizontally = shouldUseRowLayout({
    layout,
    optionsCount: options.length,
  });

  if (isFetching) {
    return (
      <div>
        <AltinnSpinner />
      </div>
    );
  }

  return (
    <InnerRadioGroup
      id={id}
      options={options}
      currentStringy={currentStringy}
      setData={setData}
      current={current}
      hideLegend={overrideDisplay?.renderLegend === false}
      showAsCard={showAsCard}
      hideLabel={hideLabel}
      readOnly={readOnly}
      shouldDisplayHorizontally={shouldDisplayHorizontally}
      isValid={isValid}
      required={required}
      alertOnChange={alertOnChange}
      labelSettings={labelSettings}
      texts={{
        title: textResourceBindings?.title,
        help: textResourceBindings?.help,
      }}
    />
  );
};

export interface RadioGroupProps {
  id: string;
  options: IOptionInternal[];
  currentStringy: string | undefined;
  setData: (data: string) => void;
  current: IOptionInternal | undefined;
  hideLegend?: boolean;
  showAsCard?: boolean;
  readOnly?: boolean;
  shouldDisplayHorizontally?: boolean;
  isValid?: boolean;
  hideLabel?: boolean;
  required?: boolean;
  alertOnChange?: boolean;
  labelSettings?: ILabelSettings;
  texts: {
    labelPrefix?: string;
    title?: string;
    help?: string;
    description?: string;
  };
}

// const getLabelPrefixForLikert = () => {
//   if (node.parent.item.type === 'Likert' && node.parent.item.textResourceBindings?.leftColumnHeader) {
//     return `${langAsString(node.parent.item.textResourceBindings.leftColumnHeader)} `;
//   }
//   return null;
// };

export const InnerRadioGroup = ({
  id,
  options,
  current,
  currentStringy,
  setData,
  texts,
  labelSettings,
  hideLegend = false,
  showAsCard = false,
  readOnly = false,
  shouldDisplayHorizontally = false,
  isValid = true,
  hideLabel = false,
  required = false,
  alertOnChange = false,
}: RadioGroupProps) => {
  const { lang, langAsString } = useLanguage(undefined);

  const selectedLabel = current?.label;
  const selectedLabelTranslated = langAsString(selectedLabel);
  const alertText = selectedLabel
    ? lang('form_filler.radiobutton_alert_label', [`<strong>${selectedLabelTranslated}</strong>`])
    : lang('form_filler.radiobutton_alert');
  const confirmChangeText = langAsString('form_filler.alert_confirm');

  return (
    <div id={id}>
      <Radio.Group
        legend={
          <span className={classes.label}>
            <span className={classes.labelContent}>
              {texts.labelPrefix ? `${langAsString(texts.labelPrefix)} ` : ''}
              <Lang id={texts.title} />
              <RequiredIndicator required={required} />
              <OptionalIndicator
                labelSettings={labelSettings}
                required={required}
              />
            </span>
            {texts.help && (
              <HelpText title={langAsString(texts.help)}>
                <Lang id={texts.help} />
              </HelpText>
            )}
          </span>
        }
        hideLegend={hideLegend}
        description={<Lang id={texts.description} />}
        error={!isValid}
        disabled={readOnly}
        inline={shouldDisplayHorizontally}
        role='radiogroup'
      >
        {options.map((option) => (
          <RadioButton
            {...option}
            label={langAsString(option.label)}
            description={option.description && <Lang id={option.description} />}
            helpText={option.helpText && <Lang id={option.helpText} />}
            name={id}
            key={option.value}
            checked={option.value === currentStringy}
            showAsCard={showAsCard}
            disabled={readOnly}
            onChange={(ev) => setData(ev.target.value)}
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
