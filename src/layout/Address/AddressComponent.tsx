import React, { useEffect } from 'react';

import { Textfield } from '@digdir/designsystemet-react';

import { Label } from 'src/components/form/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsForNode } from 'src/features/validation/selectors/bindingValidationsForNode';
import { useComponentValidationsForNode } from 'src/features/validation/selectors/componentValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { usePostPlaceQuery } from 'src/hooks/queries/usePostPlaceQuery';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import classes from 'src/layout/Address/AddressComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindingsForAddress } from 'src/layout/Address/config.generated';

export type IAddressProps = PropsFromGenericComponent<'Address'>;

const bindingKeys: IDataModelBindingsForAddress = {
  address: 'address',
  postPlace: 'postPlace',
  zipCode: 'zipCode',
  houseNumber: 'houseNumber',
  careOf: 'careOf',
};

export function AddressComponent({ node }: IAddressProps) {
  const {
    id,
    required,
    readOnly,
    labelSettings,
    simplified,
    saveWhileTyping,
    textResourceBindings,
    dataModelBindings,
  } = useNodeItem(node);

  const bindingValidations = useBindingValidationsForNode(node);
  const componentValidations = useComponentValidationsForNode(node);
  const { formData, setValue, debounce } = useDataModelBindings(dataModelBindings, saveWhileTyping);
  const { address, careOf, postPlace, zipCode, houseNumber } = formData;

  const updatePostPlace = useEffectEvent((newPostPlace) => {
    if (newPostPlace != null && newPostPlace != postPlace) {
      setValue('postPlace', newPostPlace);
    }
  });

  const zipCodeDebounced = FD.useDebouncedPick(dataModelBindings.zipCode);
  const slowZip = typeof zipCodeDebounced === 'string' ? zipCodeDebounced : undefined;
  const postPlaceQueryData = usePostPlaceQuery(slowZip, !hasValidationErrors(bindingValidations?.zipCode));
  useEffect(() => updatePostPlace(postPlaceQueryData), [postPlaceQueryData, updatePostPlace]);

  return (
    <div
      className={classes.addressComponent}
      key={`address_component_${id}`}
    >
      <div>
        <Label
          label={<Lang id={textResourceBindings?.title || 'address_component.address'} />}
          helpText={undefined}
          id={`address_address_${id}`}
          required={required}
          readOnly={readOnly}
          labelSettings={labelSettings}
        />
        <Textfield
          id={`address_address_${id}`}
          data-bindingkey={bindingKeys.address}
          error={hasValidationErrors(bindingValidations?.address)}
          size={'small'}
          value={address}
          onChange={(ev) => setValue('address', ev.target.value)}
          onBlur={debounce}
          readOnly={readOnly}
          required={required}
          autoComplete={simplified ? 'street-address' : 'address-line1'}
        />
        <ComponentValidations validations={bindingValidations?.address} />
      </div>

      {!simplified && (
        <div>
          <Label
            label={<Lang id={textResourceBindings?.careOfTitle || 'address_component.care_of'} />}
            helpText={undefined}
            id={`address_care_of_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <Textfield
            id={`address_care_of_${id}`}
            data-bindingkey={bindingKeys.careOf}
            error={hasValidationErrors(bindingValidations?.careOf)}
            size={'small'}
            value={careOf}
            onChange={(ev) => setValue('careOf', ev.target.value)}
            onBlur={debounce}
            readOnly={readOnly}
            autoComplete='address-line2'
          />
          <ComponentValidations validations={bindingValidations?.careOf} />
        </div>
      )}

      <div className={classes.addressComponentPostplaceZipCode}>
        <div className={classes.addressComponentZipCode}>
          <Label
            label={<Lang id={textResourceBindings?.zipCodeTitle || 'address_component.zip_code'} />}
            helpText={undefined}
            id={`address_zip_code_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <div className={classes.addressComponentSmallInputs}>
            <Textfield
              id={`address_zip_code_${id}`}
              data-bindingkey={bindingKeys.zipCode}
              error={hasValidationErrors(bindingValidations?.zipCode)}
              size={'small'}
              value={zipCode}
              onChange={(ev) => setValue('zipCode', ev.target.value)}
              onBlur={debounce}
              readOnly={readOnly}
              required={required}
              inputMode='numeric'
              autoComplete='postal-code'
            />
          </div>
        </div>

        <div className={classes.addressComponentPostplace}>
          <Label
            label={<Lang id={textResourceBindings?.postPlaceTitle || 'address_component.post_place'} />}
            helpText={undefined}
            id={`address_post_place_${id}`}
            required={required}
            readOnly={true}
            labelSettings={labelSettings}
          />
          <Textfield
            id={`address_post_place_${id}`}
            data-bindingkey={bindingKeys.postPlace}
            error={hasValidationErrors(bindingValidations?.postPlace)}
            size={'small'}
            value={postPlace}
            readOnly={true}
            required={required}
            autoComplete='address-level1'
          />
        </div>
        <ComponentValidations validations={bindingValidations?.zipCode} />
        <ComponentValidations validations={bindingValidations?.postPlace} />
      </div>

      {!simplified && (
        <div>
          <Label
            label={<Lang id={textResourceBindings?.houseNumberTitle || 'address_component.house_number'} />}
            helpText={undefined}
            id={`address_house_number_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <p>
            <Lang id={'address_component.house_number_helper'} />
          </p>
          <div className={classes.addressComponentSmallInputs}>
            <Textfield
              id={`address_house_number_${id}`}
              data-bindingkey={bindingKeys.houseNumber}
              error={hasValidationErrors(bindingValidations?.houseNumber)}
              size={'small'}
              value={houseNumber}
              onChange={(ev) => setValue('houseNumber', ev.target.value)}
              onBlur={debounce}
              readOnly={readOnly}
              autoComplete='address-line3'
            />
          </div>
          <ComponentValidations validations={bindingValidations?.houseNumber} />
        </div>
      )}

      <ComponentValidations validations={componentValidations} />
    </div>
  );
}
