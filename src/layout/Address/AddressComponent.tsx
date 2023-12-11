import React, { useEffect } from 'react';

import { LegacyTextField } from '@digdir/design-system-react';

import { Label } from 'src/components/form/Label';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { hasValidationErrors } from 'src/features/validation/utils';
import {
  useBindingValidationsForNode,
  useComponentValidationsForNode,
} from 'src/features/validation/validationProvider';
import { usePostPlaceQuery } from 'src/hooks/queries/usePostPlaceQuery';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import classes from 'src/layout/Address/AddressComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindingsForAddressInternal } from 'src/layout/Address/config.generated';

export type IAddressComponentProps = PropsFromGenericComponent<'AddressComponent'>;
type AddressKeys = keyof IDataModelBindingsForAddressInternal;

export function AddressComponent({ formData, handleDataChange, node }: IAddressComponentProps) {
  const { id, required, readOnly, labelSettings, simplified, saveWhileTyping } = node.item;

  const bindingValidations = useBindingValidationsForNode(node);
  const componentValidations = useComponentValidationsForNode(node);

  const bindings = 'dataModelBindings' in node.item ? node.item.dataModelBindings || {} : {};
  const handleFieldChange =
    (key: AddressKeys): IAddressComponentProps['handleDataChange'] =>
    (value) => {
      handleDataChange(value, { key });
    };

  const {
    value: address,
    setValue: setAddress,
    saveValue: saveAddress,
    onPaste: onAddressPaste,
  } = useDelayedSavedState(handleFieldChange('address'), bindings.address, formData.address || '', saveWhileTyping);
  function onChangeAddress(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress(e.target.value);
  }

  const {
    value: zipCode,
    setValue: setZipCode,
    saveValue: saveZipCode,
    onPaste: onZipCodePaste,
  } = useDelayedSavedState(handleFieldChange('zipCode'), bindings.zipCode, formData.zipCode || '', saveWhileTyping);
  function onChangeZipCode(e: React.ChangeEvent<HTMLInputElement>) {
    setZipCode(e.target.value);
  }

  const { value: postPlace, setValue: setPostPlace } = useDelayedSavedState(
    handleFieldChange('postPlace'),
    bindings.postPlace,
    formData.postPlace || '',
    saveWhileTyping,
  );

  const {
    value: careOf,
    setValue: setCareOf,
    saveValue: saveCareOf,
    onPaste: onCareOfPaste,
  } = useDelayedSavedState(handleFieldChange('careOf'), bindings.careOf, formData.careOf || '', saveWhileTyping);
  function onChangeCareOf(e: React.ChangeEvent<HTMLInputElement>) {
    setCareOf(e.target.value);
  }

  const {
    value: houseNumber,
    setValue: setHouseNumber,
    saveValue: saveHouseNumber,
    onPaste: onHouseNumberPaste,
  } = useDelayedSavedState(
    handleFieldChange('houseNumber'),
    bindings.houseNumber,
    formData.houseNumber || '',
    saveWhileTyping,
  );
  function onChangeHouseNumber(e: React.ChangeEvent<HTMLInputElement>) {
    setHouseNumber(e.target.value);
  }

  const postPlaceQueryData = usePostPlaceQuery(formData.zipCode, !hasValidationErrors(bindingValidations?.zipCode));
  useEffect(() => {
    if (postPlaceQueryData != null && postPlaceQueryData != postPlace) {
      setPostPlace(postPlaceQueryData, true);
    }
    // TODO(useDelayedSavedState): This hook could disappear, but for now, a problem is that the function references are very volatile and will cause many rerenders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postPlaceQueryData]);

  return (
    <div
      className={classes.addressComponent}
      key={`address_component_${id}`}
    >
      <div>
        <Label
          label={<Lang id={'address_component.address'} />}
          helpText={undefined}
          id={`address_address_${id}`}
          required={required}
          readOnly={readOnly}
          labelSettings={labelSettings}
        />
        <LegacyTextField
          id={`address_address_${id}`}
          isValid={!hasValidationErrors(bindingValidations?.address)}
          value={address}
          onChange={onChangeAddress}
          onBlur={saveAddress}
          onPaste={onAddressPaste}
          readOnly={readOnly}
          required={required}
          autoComplete={simplified ? 'street-address' : 'address-line1'}
        />
        <ComponentValidations
          validations={bindingValidations?.address}
          node={node}
        />
      </div>

      {!simplified && (
        <div>
          <Label
            label={<Lang id={'address_component.care_of'} />}
            helpText={undefined}
            id={`address_care_of_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <LegacyTextField
            id={`address_care_of_${id}`}
            isValid={!hasValidationErrors(bindingValidations?.careOf)}
            value={careOf}
            onChange={onChangeCareOf}
            onBlur={saveCareOf}
            onPaste={onCareOfPaste}
            readOnly={readOnly}
            autoComplete='address-line2'
          />
          <ComponentValidations
            validations={bindingValidations?.careOf}
            node={node}
          />
        </div>
      )}
      <div>
        <div className={classes.addressComponentPostplaceZipCode}>
          <div className={classes.addressComponentZipCode}>
            <Label
              label={<Lang id={'address_component.zip_code'} />}
              helpText={undefined}
              id={`address_zip_code_${id}`}
              required={required}
              readOnly={readOnly}
              labelSettings={labelSettings}
            />
            <div className={classes.addressComponentSmallInputs}>
              <LegacyTextField
                id={`address_zip_code_${id}`}
                isValid={!hasValidationErrors(bindingValidations?.zipCode)}
                value={zipCode}
                onChange={onChangeZipCode}
                onBlur={saveZipCode}
                onPaste={onZipCodePaste}
                readOnly={readOnly}
                required={required}
                inputMode='numeric'
                autoComplete='postal-code'
              />
            </div>
          </div>

          <div className={classes.addressComponentPostplace}>
            <Label
              label={<Lang id={'address_component.post_place'} />}
              helpText={undefined}
              id={`address_post_place_${id}`}
              required={required}
              readOnly={true}
              labelSettings={labelSettings}
            />
            <LegacyTextField
              id={`address_post_place_${id}`}
              isValid={!hasValidationErrors(bindingValidations?.postPlace)}
              value={postPlace}
              readOnly={true}
              required={required}
              autoComplete='address-level1'
            />
          </div>
        </div>
        <ComponentValidations
          validations={bindingValidations?.zipCode}
          node={node}
        />
        <ComponentValidations
          validations={bindingValidations?.postPlace}
          node={node}
        />
      </div>

      {!simplified && (
        <div>
          <Label
            label={<Lang id={'address_component.house_number'} />}
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
            <LegacyTextField
              id={`address_house_number_${id}`}
              isValid={!hasValidationErrors(bindingValidations?.houseNumber)}
              value={houseNumber}
              onChange={onChangeHouseNumber}
              onBlur={saveHouseNumber}
              onPaste={onHouseNumberPaste}
              readOnly={readOnly}
              autoComplete='address-line3'
            />
          </div>
          <ComponentValidations
            validations={bindingValidations?.houseNumber}
            node={node}
          />
        </div>
      )}

      <ComponentValidations
        validations={componentValidations}
        node={node}
      />
    </div>
  );
}
