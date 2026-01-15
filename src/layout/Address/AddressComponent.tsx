import React from 'react';

import { LegacyTextField } from '@digdir/design-system-react';

import { Label } from 'src/components/form/Label';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useLanguage } from 'src/hooks/useLanguage';
import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';
import classes from 'src/layout/Address/AddressComponent.module.css';
import { usePostPlace } from 'src/layout/Address/usePostPlace';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IComponentValidations } from 'src/utils/validation/types';

export type IAddressComponentProps = PropsFromGenericComponent<'AddressComponent'>;

interface IAddressValidationErrors {
  address?: string;
  zipCode?: string;
  houseNumber?: string;
  postPlace?: string;
}

export enum AddressKeys {
  address = 'address',
  zipCode = 'zipCode',
  postPlace = 'postPlace',
  careOf = 'careOf',
  houseNumber = 'houseNumber',
}

export function AddressComponent({ formData, handleDataChange, componentValidations, node }: IAddressComponentProps) {
  const { id, required, readOnly, labelSettings, simplified, saveWhileTyping } = node.item;
  const { lang, langAsString } = useLanguage();

  const handleDataChangeOverride =
    (key: AddressKeys): IAddressComponentProps['handleDataChange'] =>
    (value) =>
      onSaveField(key, value);

  const {
    value: address,
    setValue: setAddress,
    onPaste: onAddressPaste,
  } = useDelayedSavedState(handleDataChangeOverride(AddressKeys.address), formData.address || '', saveWhileTyping);
  const {
    value: zipCode,
    setValue: setZipCode,
    onPaste: onZipCodePaste,
  } = useDelayedSavedState(handleDataChangeOverride(AddressKeys.zipCode), formData.zipCode || '', saveWhileTyping);
  const { value: postPlace, setValue: setPostPlace } = useDelayedSavedState(
    handleDataChangeOverride(AddressKeys.postPlace),
    formData.postPlace || '',
    saveWhileTyping,
  );
  const {
    value: careOf,
    setValue: setCareOf,
    onPaste: onCareOfPaste,
  } = useDelayedSavedState(handleDataChangeOverride(AddressKeys.careOf), formData.careOf || '', saveWhileTyping);
  const {
    value: houseNumber,
    setValue: setHouseNumber,
    onPaste: onHouseNumberPaste,
  } = useDelayedSavedState(
    handleDataChangeOverride(AddressKeys.houseNumber),
    formData.houseNumber || '',
    saveWhileTyping,
  );

  const [validations, setValidations] = useStateDeepEqual<IAddressValidationErrors>({});
  const isValidZipCode = formData.zipCode?.match(/^\d{4}$/);
  const postPlaceFromHook = usePostPlace(isValidZipCode ? formData.zipCode : undefined, true);
  const hasLookedUp = React.useRef<boolean>(false);

  const validate = React.useCallback(() => {
    const validationErrors: IAddressValidationErrors = {};
    if (zipCode && !zipCode.match(/^\d{4}$/)) {
      validationErrors.zipCode = langAsString('address_component.validation_error_zipcode');
      setPostPlace('');
    } else {
      delete validationErrors.zipCode;
    }
    if (houseNumber && !houseNumber.match(/^[a-z,A-Z]\d{4}$/)) {
      validationErrors.houseNumber = langAsString('address_component.validation_error_house_number');
    } else {
      delete validationErrors.houseNumber;
    }
    return validationErrors;
  }, [houseNumber, langAsString, zipCode, setPostPlace]);

  const onSaveField = React.useCallback(
    (key: AddressKeys, value: any) => {
      const validationErrors: IAddressValidationErrors = validate();
      setValidations(validationErrors);
      if (!validationErrors[key]) {
        handleDataChange(value, { key });
        if (key === AddressKeys.zipCode && !value) {
          // if we are removing a zip code, also remove post place from form data
          setPostPlace('', true);
        }
      }
    },
    [validate, setValidations, handleDataChange, setPostPlace],
  );

  React.useEffect(() => {
    if (!formData.zipCode || !isValidZipCode) {
      if (postPlace !== '') {
        setPostPlace('');
      }
      hasLookedUp.current = false;
      return;
    }

    if (postPlaceFromHook) {
      setPostPlace(postPlaceFromHook);
      setValidations({ ...validations, zipCode: undefined });
      handleDataChange(postPlaceFromHook, { key: AddressKeys.postPlace });
      hasLookedUp.current = true;
    } else if (hasLookedUp.current || postPlaceFromHook === '') {
      // If we've looked up before and got empty result, or hook returned empty string for valid format
      // This means the zip code format is valid but doesn't exist in the registry
      if (postPlaceFromHook === '' && hasLookedUp.current) {
        const errorMessage = langAsString('address_component.validation_error_zipcode');
        setPostPlace('');
        setValidations({ ...validations, zipCode: errorMessage });
      }
    }
  }, [
    formData.zipCode,
    isValidZipCode,
    postPlaceFromHook,
    postPlace,
    setPostPlace,
    handleDataChange,
    langAsString,
    setValidations,
    validations,
  ]);

  const updateField = (key: AddressKeys, saveImmediately: boolean, event: any): void => {
    const changedFieldValue: string = event.target.value;
    const changedKey: string = AddressKeys[key];

    switch (changedKey) {
      case AddressKeys.address: {
        setAddress(changedFieldValue, saveImmediately);
        break;
      }
      case AddressKeys.careOf: {
        setCareOf(changedFieldValue, saveImmediately);
        break;
      }
      case AddressKeys.houseNumber: {
        setHouseNumber(changedFieldValue, saveImmediately);
        break;
      }
      case AddressKeys.postPlace: {
        setPostPlace(changedFieldValue, saveImmediately);
        break;
      }
      case AddressKeys.zipCode: {
        setZipCode(changedFieldValue, saveImmediately);
        break;
      }
      default:
        break;
    }
  };

  const joinValidationMessages = (): IComponentValidations => {
    let validationMessages = componentValidations || {};

    Object.keys(AddressKeys).forEach((fieldKey: string) => {
      if (!validationMessages[fieldKey]) {
        validationMessages = {
          ...validationMessages,
          [fieldKey]: {
            errors: [],
            warnings: [],
          },
        };
      }
    });

    Object.keys(validations).forEach((fieldKey: string) => {
      const source = validations[fieldKey];
      if (source) {
        const target = validationMessages[fieldKey];
        if (target) {
          const match = target.errors && target.errors.indexOf(source) > -1;
          if (!match) {
            validationMessages[fieldKey]?.errors?.push(validations[fieldKey]);
          }
        } else {
          validationMessages = {
            ...validationMessages,
            [fieldKey]: {
              errors: [],
              warnings: [],
            },
          };
          (validationMessages[fieldKey] || {}).errors = [validations[fieldKey]];
        }
      }
    });

    return validationMessages;
  };

  const allValidations = joinValidationMessages();

  return (
    <div
      className={classes.addressComponent}
      key={`address_component_${id}`}
    >
      <div>
        <Label
          labelText={lang('address_component.address')}
          helpText={undefined}
          id={`address_address_${id}`}
          required={required}
          readOnly={readOnly}
          labelSettings={labelSettings}
        />
        <LegacyTextField
          id={`address_address_${id}`}
          isValid={allValidations.address?.errors?.length === 0}
          value={address}
          onChange={updateField.bind(null, AddressKeys.address, false)}
          onBlur={updateField.bind(null, AddressKeys.address, true)}
          onPaste={() => onAddressPaste()}
          readOnly={readOnly}
          required={required}
          autoComplete={simplified ? 'street-address' : 'address-line1'}
        />
        {allValidations?.[AddressKeys.address]
          ? renderValidationMessagesForComponent(allValidations[AddressKeys.address], `${id}_${AddressKeys.address}`)
          : null}
      </div>

      {!simplified && (
        <div>
          <Label
            labelText={lang('address_component.care_of')}
            helpText={undefined}
            id={`address_care_of_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <LegacyTextField
            id={`address_care_of_${id}`}
            isValid={allValidations.careOf?.errors?.length === 0}
            value={careOf}
            onChange={updateField.bind(null, AddressKeys.careOf, false)}
            onBlur={updateField.bind(null, AddressKeys.careOf, true)}
            onPaste={() => onCareOfPaste()}
            readOnly={readOnly}
            autoComplete='address-line2'
          />
          {allValidations?.[AddressKeys.careOf]
            ? renderValidationMessagesForComponent(allValidations[AddressKeys.careOf], `${id}_${AddressKeys.careOf}`)
            : null}
        </div>
      )}

      <div className={classes.addressComponentPostplaceZipCode}>
        <div className={classes.addressComponentZipCode}>
          <Label
            labelText={lang('address_component.zip_code')}
            helpText={undefined}
            id={`address_zip_code_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <div className={classes.addressComponentSmallInputs}>
            <LegacyTextField
              id={`address_zip_code_${id}`}
              isValid={allValidations.zipCode?.errors?.length === 0}
              value={zipCode}
              onChange={updateField.bind(null, AddressKeys.zipCode, false)}
              onBlur={updateField.bind(null, AddressKeys.zipCode, true)}
              onPaste={() => onZipCodePaste()}
              readOnly={readOnly}
              required={required}
              inputMode='numeric'
              autoComplete='postal-code'
            />
          </div>
          {allValidations?.[AddressKeys.careOf]
            ? renderValidationMessagesForComponent(allValidations[AddressKeys.zipCode], `${id}_${AddressKeys.zipCode}`)
            : null}
        </div>

        <div className={classes.addressComponentPostplace}>
          <Label
            labelText={lang('address_component.post_place')}
            helpText={undefined}
            id={`address_post_place_${id}`}
            required={required}
            readOnly={true}
            labelSettings={labelSettings}
          />
          <LegacyTextField
            id={`address_post_place_${id}`}
            isValid={allValidations.postPlace?.errors?.length === 0}
            value={postPlace}
            readOnly={true}
            required={required}
            autoComplete='address-level1'
          />
          {allValidations?.[AddressKeys.postPlace]
            ? renderValidationMessagesForComponent(
                allValidations[AddressKeys.postPlace],
                `${id}_${AddressKeys.postPlace}`,
              )
            : null}
        </div>
      </div>

      {!simplified && (
        <div>
          <Label
            labelText={lang('address_component.house_number')}
            helpText={undefined}
            id={`address_house_number_${id}`}
            required={required}
            readOnly={readOnly}
            labelSettings={labelSettings}
          />
          <p>{lang('address_component.house_number_helper')}</p>
          <div className={classes.addressComponentSmallInputs}>
            <LegacyTextField
              id={`address_house_number_${id}`}
              isValid={allValidations.houseNumber?.errors?.length === 0}
              value={houseNumber}
              onChange={updateField.bind(null, AddressKeys.houseNumber, false)}
              onBlur={updateField.bind(null, AddressKeys.houseNumber, true)}
              onPaste={() => onHouseNumberPaste()}
              readOnly={readOnly}
              autoComplete='address-line3'
            />
          </div>
          {allValidations?.[AddressKeys.houseNumber]
            ? renderValidationMessagesForComponent(
                allValidations[AddressKeys.houseNumber],
                `${id}_${AddressKeys.houseNumber}`,
              )
            : null}
        </div>
      )}
    </div>
  );
}
