import React, { useEffect } from 'react';

import { Textfield } from '@digdir/designsystemet-react';
import { Grid } from '@material-ui/core';

import { Label } from 'src/components/label/Label';
import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsForNode } from 'src/features/validation/selectors/bindingValidationsForNode';
import { useComponentValidationsForNode } from 'src/features/validation/selectors/componentValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { usePostPlaceQuery } from 'src/hooks/queries/usePostPlaceQuery';
import { useEffectEvent } from 'src/hooks/useEffectEvent';
import classes from 'src/layout/Address/AddressComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';
import type { IDataModelBindingsForAddressInternal } from 'src/layout/Address/config.generated';

export type IAddressProps = PropsFromGenericComponent<'Address'>;

const bindingKeys: { [k in keyof IDataModelBindingsForAddressInternal]: k } = {
  address: 'address',
  postPlace: 'postPlace',
  zipCode: 'zipCode',
  houseNumber: 'houseNumber',
  careOf: 'careOf',
};

export function AddressComponent({ node }: IAddressProps) {
  const { id, required, readOnly, labelSettings, simplified, saveWhileTyping } = node.item;

  const { textResourceBindings } = node.item;
  const bindingValidations = useBindingValidationsForNode(node);
  const componentValidations = useComponentValidationsForNode(node);
  const { formData, setValue, debounce } = useDataModelBindings(node.item.dataModelBindings, saveWhileTyping);
  const { address, careOf, postPlace, zipCode, houseNumber } = formData;

  const updatePostPlace = useEffectEvent((newPostPlace) => {
    if (newPostPlace != null && newPostPlace != postPlace) {
      setValue('postPlace', newPostPlace);
    }
  });

  const zipCodeDebounced = FD.useDebouncedPick(node.item.dataModelBindings.zipCode);
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
          id={`address_address_${id}`}
          renderLabelAs='label'
          textResourceBindings={{ title: textResourceBindings?.title ?? 'address_component.address' }}
          readOnly={readOnly}
          required={required}
          labelSettings={labelSettings}
        >
          <Grid
            item
            id={`form-content-${id}`}
            xs={12}
          >
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
          </Grid>
        </Label>
        <ComponentValidations
          validations={bindingValidations?.address}
          node={node}
        />
      </div>

      {!simplified && (
        <div>
          <Label
            id={`address_care_of_${id}`}
            renderLabelAs='label'
            textResourceBindings={{ title: textResourceBindings?.careOfTitle ?? 'address_component.care_of' }}
            readOnly={readOnly}
            required={required}
            labelSettings={labelSettings}
          >
            <Grid
              item
              id={`form-content-${id}`}
              xs={12}
            >
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
            </Grid>
          </Label>
          <ComponentValidations
            validations={bindingValidations?.careOf}
            node={node}
          />
        </div>
      )}

      <Grid
        container
        spacing={6}
      >
        <Grid
          item
          className={`${classes.addressComponentZipCode} ${classes.addressComponentSmallInputs}`}
        >
          <Label
            id={`address_zip_code_${id}`}
            renderLabelAs='label'
            textResourceBindings={{ title: textResourceBindings?.zipCodeTitle ?? 'address_component.zip_code' }}
            readOnly={readOnly}
            required={required}
            labelSettings={labelSettings}
          >
            <Textfield
              id={`address_zip_code_${id}`}
              data-bindingkey={bindingKeys.zipCode}
              error={hasValidationErrors(bindingValidations?.zipCode)}
              size='small'
              value={zipCode}
              onChange={(ev) => setValue('zipCode', ev.target.value)}
              onBlur={debounce}
              readOnly={readOnly}
              required={required}
              inputMode='numeric'
              autoComplete='postal-code'
            />
          </Label>
        </Grid>
        <Grid
          item
          className={classes.addressComponentPostplace}
        >
          <Label
            id={`address_post_place_${id}`}
            renderLabelAs='label'
            textResourceBindings={{ title: textResourceBindings?.postPlaceTitle ?? 'address_component.post_place' }}
            readOnly={readOnly}
            required={required}
            labelSettings={labelSettings}
          >
            <Textfield
              id={`address_post_place_${id}`}
              data-bindingkey={bindingKeys.postPlace}
              error={hasValidationErrors(bindingValidations?.postPlace)}
              size='small'
              value={postPlace}
              readOnly={true}
              required={required}
              autoComplete='address-level1'
              style={{ width: '100%' }}
            />
          </Label>
        </Grid>
        <ComponentValidations
          validations={bindingValidations?.zipCode}
          node={node}
        />
        <ComponentValidations
          validations={bindingValidations?.postPlace}
          node={node}
        />
      </Grid>

      {!simplified && (
        <div>
          <Label
            id={`address_house_number_${id}`}
            renderLabelAs='label'
            textResourceBindings={{
              title: textResourceBindings?.houseNumberTitle ?? 'address_component.house_number',
              help: 'address_component.house_number_helper',
            }}
            readOnly={readOnly}
            required={required}
            labelSettings={labelSettings}
          >
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
          </Label>
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
