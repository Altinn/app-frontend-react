import React from 'react';

import { LegacyTextField } from '@digdir/design-system-react';
import axios from 'axios';

import { Label } from 'src/components/form/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useStateDeepEqual } from 'src/hooks/useStateDeepEqual';
import classes from 'src/layout/Address/AddressComponent.module.css';
import { httpGet } from 'src/utils/network/sharedNetworking';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindingsForAddressInternal } from 'src/layout/Address/config.generated';
import type { IComponentValidations } from 'src/utils/validation/types';

export type IAddressComponentProps = PropsFromGenericComponent<'AddressComponent'>;

interface IAddressValidationErrors {
  address?: string;
  zipCode?: string;
  houseNumber?: string;
  postPlace?: string;
}

type AddressKey = keyof IDataModelBindingsForAddressInternal;
const AddressKeys: AddressKey[] = ['address', 'zipCode', 'postPlace', 'careOf', 'houseNumber'];

export function AddressComponent({ componentValidations, node }: IAddressComponentProps) {
  // eslint-disable-next-line import/no-named-as-default-member
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const { id, required, readOnly, labelSettings, simplified, saveWhileTyping } = node.item;
  const { langAsString } = useLanguage();

  const bindings = ('dataModelBindings' in node.item && node.item.dataModelBindings) || {};
  const saveData = FD.useSetForBindings(bindings, saveWhileTyping);
  const { address, careOf, postPlace, zipCode, houseNumber } = FD.usePickFreshStrings(bindings);

  const [validations, setValidations] = useStateDeepEqual<IAddressValidationErrors>({});
  const prevZipCode = React.useRef<string | undefined>(undefined);
  const hasFetchedPostPlace = React.useRef<boolean>(false);

  const validate = React.useCallback(() => {
    const validationErrors: IAddressValidationErrors = {};
    if (zipCode && !zipCode.match(/^\d{4}$/)) {
      validationErrors.zipCode = langAsString('address_component.validation_error_zipcode');
      saveData('postPlace', '');
    } else {
      delete validationErrors.zipCode;
    }
    if (houseNumber && !houseNumber.match(/^[a-z,A-Z]\d{4}$/)) {
      validationErrors.houseNumber = langAsString('address_component.validation_error_house_number');
    } else {
      delete validationErrors.houseNumber;
    }
    return validationErrors;
  }, [houseNumber, langAsString, zipCode, saveData]);

  const onSaveField = React.useCallback(
    (key: AddressKey, value: any) => {
      const validationErrors: IAddressValidationErrors = validate();
      setValidations(validationErrors);
      if (!validationErrors[key]) {
        saveData(key, value);
        if (key === 'zipCode' && !value) {
          // if we are removing a zip code, also remove post place from form data
          saveData('postPlace', '');
        }
      }
    },
    [validate, setValidations, saveData],
  );

  React.useEffect(() => {
    if (!zipCode || !zipCode.match(/^\d{4}$/)) {
      postPlace && saveData('postPlace', '');
      return;
    }

    if (prevZipCode.current === zipCode && hasFetchedPostPlace.current === true) {
      return;
    }

    const fetchPostPlace = async (pnr: string, cancellationToken: any) => {
      hasFetchedPostPlace.current = false;
      try {
        prevZipCode.current = zipCode;
        const response = await httpGet('https://api.bring.com/shippingguide/api/postalCode.json', {
          params: {
            clientUrl: window.location.href,
            pnr,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          cancelToken: cancellationToken,
        });
        if (response.valid) {
          saveData('postPlace', response.result);
          setValidations({ ...validations, zipCode: undefined });
          onSaveField('postPlace', response.result);
        } else {
          const errorMessage = langAsString('address_component.validation_error_zipcode');
          saveData('postPlace', '');
          setValidations({ ...validations, zipCode: errorMessage });
        }
        hasFetchedPostPlace.current = true;
      } catch (err) {
        // eslint-disable-next-line import/no-named-as-default-member
        if (axios.isCancel(err)) {
          // Intentionally ignored
        } else {
          window.logError(`AddressComponent (${id}):\n`, err);
        }
      }
    };

    fetchPostPlace(zipCode, source.token);
    return function cleanup() {
      source.cancel('ComponentWillUnmount');
    };
  }, [zipCode, langAsString, source, onSaveField, validations, id, setValidations, postPlace, saveData]);

  const joinValidationMessages = (): IComponentValidations => {
    let validationMessages = componentValidations || {};

    Object.keys(AddressKeys).forEach((fieldKey) => {
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

    Object.keys(validations).forEach((fieldKey) => {
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

  const allValidations = joinValidationMessages() as {
    [Key in AddressKey]: IComponentValidations[string] | undefined;
  };

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
          isValid={allValidations.address?.errors?.length === 0}
          value={address}
          onChange={(ev) => saveData('address', ev.target.value)}
          readOnly={readOnly}
          required={required}
          autoComplete={simplified ? 'street-address' : 'address-line1'}
        />
        {allValidations?.address && renderValidationMessagesForComponent(allValidations.address, `${id}_address`)}
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
            isValid={allValidations.careOf?.errors?.length === 0}
            value={careOf}
            onChange={(ev) => saveData('careOf', ev.target.value)}
            readOnly={readOnly}
            autoComplete='address-line2'
          />
          {allValidations?.careOf && renderValidationMessagesForComponent(allValidations.careOf, `${id}_careOf`)}
        </div>
      )}

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
              isValid={allValidations.zipCode?.errors?.length === 0}
              value={zipCode}
              onChange={(ev) => onSaveField('zipCode', ev.target.value)}
              readOnly={readOnly}
              required={required}
              inputMode='numeric'
              autoComplete='postal-code'
            />
          </div>
          {allValidations?.zipCode && renderValidationMessagesForComponent(allValidations.zipCode, `${id}_zipCode`)}
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
            isValid={allValidations.postPlace?.errors?.length === 0}
            value={postPlace}
            readOnly={true}
            required={required}
            autoComplete='address-level1'
          />
          {allValidations?.postPlace &&
            renderValidationMessagesForComponent(allValidations.postPlace, `${id}_postPlace`)}
        </div>
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
              isValid={allValidations.houseNumber?.errors?.length === 0}
              value={houseNumber}
              onChange={(ev) => saveData('houseNumber', ev.target.value)}
              readOnly={readOnly}
              autoComplete='address-line3'
            />
          </div>
          {allValidations?.houseNumber &&
            renderValidationMessagesForComponent(allValidations.houseNumber, `${id}_houseNumber`)}
        </div>
      )}
    </div>
  );
}
