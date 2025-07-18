import React, { useState } from 'react';

import { Field, ValidationMessage } from '@digdir/designsystemet-react';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Input } from 'src/app-components/Input/Input';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { Fieldset } from 'src/app-components/Label/Fieldset';
import { Label } from 'src/app-components/Label/Label';
import { Description } from 'src/components/form/Description';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getDescriptionId } from 'src/components/label/Label';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsFor } from 'src/features/validation/selectors/bindingValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/PersonLookup/PersonLookupComponent.module.css';
import { validatePersonLookupResponse, validateSsn } from 'src/layout/PersonLookup/validation';
import { useLabel } from 'src/utils/layout/useLabel';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import { httpPost } from 'src/utils/network/networking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';

const personLookupQueries = {
  lookup: (ssn: string, name: string) =>
    queryOptions({
      queryKey: [{ scope: 'personLookup', ssn, name }],
      queryFn: () => fetchPerson(ssn, name),
      enabled: false,
      gcTime: 0,
    }),
};

export type Person = {
  firstName: string;
  lastName: string;
  middleName: string;
  ssn: string;
};
export type PersonLookupResponse = { success: false; personDetails: null } | { success: true; personDetails: Person };

async function fetchPerson(
  ssn: string,
  name: string,
): Promise<{ person: Person; error: null } | { person: null; error: string }> {
  if (!ssn || !name) {
    throw new Error('Missing ssn or name');
  }
  const body = { socialSecurityNumber: ssn, lastName: name };
  const url = `${appPath}/api/v1/lookup/person`;

  try {
    const response = await httpPost(url, undefined, body);
    const data = response.data;

    if (!validatePersonLookupResponse(data)) {
      return { person: null, error: 'person_lookup.validation_invalid_response_from_server' };
    }

    if (!data.success) {
      return { person: null, error: 'person_lookup.validation_error_not_found' };
    }

    return { person: data.personDetails, error: null };
  } catch (error) {
    if (error.response.status === 403) {
      return { person: null, error: 'person_lookup.validation_error_forbidden' };
    }
    if (error.response.status === 429) {
      return { person: null, error: 'person_lookup.validation_error_too_many_requests' };
    }

    return { person: null, error: 'person_lookup.unknown_error' };
  }
}

export function PersonLookupComponent({ baseComponentId, overrideDisplay }: PropsFromGenericComponent<'PersonLookup'>) {
  const { id, dataModelBindings, required } = useItemWhenType(baseComponentId, 'PersonLookup');
  const { labelText, getDescriptionComponent, getHelpTextComponent } = useLabel({
    baseComponentId,
    overrideDisplay,
  });
  const [tempSsn, setTempSsn] = useState('');
  const [tempName, setTempName] = useState('');
  const [ssnErrors, setSsnErrors] = useState<string[]>();
  const [nameError, setNameError] = useState<string>();

  const bindingValidations = useBindingValidationsFor<'PersonLookup'>(baseComponentId);
  const { langAsString } = useLanguage();
  const {
    formData: { person_lookup_ssn, person_lookup_name },
    setValue,
  } = useDataModelBindings(dataModelBindings);

  const { data, refetch: performLookup, isFetching } = useQuery(personLookupQueries.lookup(tempSsn, tempName));

  function handleValidateName(name: string) {
    if (name.length < 1) {
      setNameError('person_lookup.validation_error_name_too_short');
      return false;
    }
    setNameError(undefined);
    return true;
  }

  function handleValidateSsn(ssn: string) {
    if (!validateSsn({ ssn })) {
      const ssnErrors = validateSsn.errors
        ?.filter((error) => error.instancePath === '/ssn')
        .map((error) => error.message)
        .filter((it) => it != null);

      setSsnErrors(ssnErrors);
      return false;
    }

    setSsnErrors(undefined);
    return true;
  }

  async function handleSubmit() {
    const isNameValid = handleValidateName(tempName);
    const isSsnValid = handleValidateSsn(tempSsn);
    if (!isNameValid || !isSsnValid) {
      return;
    }

    const { data } = await performLookup();
    if (data?.person) {
      setValue('person_lookup_name', getFullName(data.person));
      setValue('person_lookup_ssn', data.person.ssn);
    }
  }

  function getFullName({ firstName, middleName, lastName }) {
    return middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
  }

  function handleClear() {
    setValue('person_lookup_name', '');
    setValue('person_lookup_ssn', '');
    setTempName('');
    setTempSsn('');
    setSsnErrors(undefined);
    setNameError(undefined);
  }

  const hasSuccessfullyFetched = !!person_lookup_name && !!person_lookup_ssn;

  const invalidSsn =
    (ssnErrors?.length && ssnErrors?.length > 0) || hasValidationErrors(bindingValidations?.person_lookup_ssn);
  const invalidName = !!nameError || hasValidationErrors(bindingValidations?.person_lookup_name);

  return (
    <Fieldset
      legend={labelText}
      legendSize='lg'
      description={getDescriptionComponent()}
      help={getHelpTextComponent()}
      size='sm'
    >
      <ComponentStructureWrapper baseComponentId={baseComponentId}>
        <div className={classes.componentWrapper}>
          <div className={classes.ssnLabel}>
            <Label
              htmlFor={`${id}_ssn`}
              label={langAsString('person_lookup.ssn_label')}
              required={required}
              requiredIndicator={<RequiredIndicator required={required} />}
              description={
                hasSuccessfullyFetched ? (
                  <Description
                    description={langAsString('person_lookup.from_registry_description')}
                    componentId={`${id}_ssn`}
                    style={{ fontSize: '1rem' }}
                  />
                ) : undefined
              }
            />
          </div>
          <Field className={classes.ssn}>
            <NumericInput
              id={`${id}_ssn`}
              aria-describedby={hasSuccessfullyFetched ? getDescriptionId(`${id}_ssn`) : undefined}
              aria-label={langAsString('person_lookup.ssn_label')}
              value={hasSuccessfullyFetched ? person_lookup_ssn : tempSsn}
              required={required}
              readOnly={hasSuccessfullyFetched}
              error={invalidSsn}
              onValueChange={(e) => {
                setTempSsn(e.value);
                setSsnErrors(undefined);
              }}
              onKeyDown={async (ev) => {
                if (ev.key === 'Enter') {
                  await handleSubmit();
                }
              }}
              allowLeadingZeros
              inputMode='numeric'
              pattern='[0-9]{11}'
              autoComplete='off'
            />
            {(ssnErrors?.length && (
              <ValidationMessage>
                <Lang id={ssnErrors.join(' ')} />
              </ValidationMessage>
            )) ||
              (hasValidationErrors(bindingValidations?.person_lookup_ssn) && (
                <ComponentValidations
                  validations={bindingValidations?.person_lookup_ssn}
                  baseComponentId={baseComponentId}
                />
              ))}
          </Field>
          <div className={classes.nameLabel}>
            <Label
              htmlFor={`${id}_name`}
              required={required}
              requiredIndicator={<RequiredIndicator required={required} />}
              label={langAsString(hasSuccessfullyFetched ? 'person_lookup.name_label' : 'person_lookup.surname_label')}
              description={
                hasSuccessfullyFetched ? (
                  <Description
                    description={langAsString('person_lookup.from_registry_description')}
                    componentId={`${id}_name`}
                  />
                ) : undefined
              }
            />
          </div>
          <Field className={classes.name}>
            <Input
              id={`${id}_name`}
              aria-describedby={hasSuccessfullyFetched ? getDescriptionId(`${id}_name`) : undefined}
              aria-label={langAsString(
                hasSuccessfullyFetched ? 'person_lookup.name_label' : 'person_lookup.surname_label',
              )}
              value={hasSuccessfullyFetched ? person_lookup_name : tempName}
              type='text'
              required={required}
              readOnly={hasSuccessfullyFetched}
              error={invalidName}
              onChange={(e) => {
                setTempName(e.target.value);
                setNameError(undefined);
              }}
              onKeyDown={async (ev) => {
                if (ev.key === 'Enter') {
                  await handleSubmit();
                }
              }}
              autoComplete='family-name'
            />
            {(nameError && (
              <ValidationMessage>
                <Lang id={nameError} />
              </ValidationMessage>
            )) ||
              (hasValidationErrors(bindingValidations?.person_lookup_name) && (
                <ComponentValidations
                  validations={bindingValidations?.person_lookup_name}
                  baseComponentId={baseComponentId}
                />
              ))}
          </Field>
          <div className={classes.submit}>
            {!hasSuccessfullyFetched ? (
              <Button
                onClick={handleSubmit}
                variant='secondary'
                isLoading={isFetching}
              >
                <Lang id='person_lookup.submit_button' />
              </Button>
            ) : (
              <Button
                variant='secondary'
                color='danger'
                onClick={handleClear}
              >
                <Lang id='person_lookup.clear_button' />
              </Button>
            )}
          </div>
          {data?.error && (
            <ValidationMessage
              data-size='sm'
              className={classes.apiError}
            >
              <Lang id={data.error} />
            </ValidationMessage>
          )}
        </div>
      </ComponentStructureWrapper>
    </Fieldset>
  );
}
