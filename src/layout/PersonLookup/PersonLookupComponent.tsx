import React, { useState } from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';

import { Button } from 'src/app-components/button/Button';
import { Input } from 'src/app-components/Input/Input';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { Label } from 'src/app-components/Label/Label';
import { Description } from 'src/components/form/Description';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsForNode } from 'src/features/validation/selectors/bindingValidationsForNode';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/PersonLookup/PersonLookupComponent.module.css';
import { validateName, validatePersonLookupResponse, validateSsn } from 'src/layout/PersonLookup/validation';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { httpPost } from 'src/utils/network/networking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';

const personLookupKeys = {
  lookup: (ssn: string, name: string) => [{ scope: 'personLookup', ssn, name }],
} as const;

export type Person = {
  name: string;
  ssn: string;
};
export type PersonLookupResponse = { success: false; personDetails: null } | { success: true; personDetails: Person };

async function fetchPerson({
  queryKey: [{ ssn, name }],
}: QueryFunctionContext<ReturnType<(typeof personLookupKeys)['lookup']>>): Promise<
  { person: Person; error: null } | { person: null; error: string }
> {
  if (!ssn || !name) {
    throw new Error('Missing ssn or name');
  }
  const body = { socialSecurityNumber: ssn, lastName: name };
  const url = `${appPath}/api/v1/lookup/person`;

  try {
    const response = await httpPost(url, undefined, body);
    const data = response.data;

    if (!validatePersonLookupResponse(data)) {
      return { person: null, error: 'person_lookup.validation_error_no_response_from_server' };
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

export function PersonLookupComponent({ node }: PropsFromGenericComponent<'PersonLookup'>) {
  const { id, dataModelBindings, required } = useNodeItem(node);
  const [tempSsn, setTempSsn] = useState('');
  const [tempName, setTempName] = useState('');
  const [ssnErrors, setSsnErrors] = useState<string[]>();
  const [nameErrors, setNameErrors] = useState<string[]>();

  const bindingValidations = useBindingValidationsForNode(node);

  const {
    formData: { person_lookup_ssn, person_lookup_name },
    setValue,
  } = useDataModelBindings(dataModelBindings);

  const {
    data,
    refetch: performLookup,
    isFetching,
  } = useQuery({
    queryKey: personLookupKeys.lookup(tempSsn, tempName),
    queryFn: fetchPerson,
    enabled: false,
    gcTime: 0,
  });

  function handleValidateName(name: string) {
    if (!validateName({ name })) {
      const nameErrors = validateName.errors
        ?.filter((error) => error.instancePath === '/name')
        .map((error) => error.message)
        .filter((it) => it != null);

      setNameErrors(nameErrors);
      return false;
    }
    setNameErrors(undefined);
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
      setValue('person_lookup_name', data.person.name);
      setValue('person_lookup_ssn', data.person.ssn);
    }
  }

  function handleClear() {
    setValue('person_lookup_name', '');
    setValue('person_lookup_ssn', '');
    setTempName('');
    setTempSsn('');
  }

  const hasSuccessfullyFetched = !!person_lookup_name && !!person_lookup_ssn;

  return (
    <ComponentStructureWrapper node={node}>
      <div className={classes.componentWrapper}>
        <div className={classes.ssnLabel}>
          <Label
            htmlFor={`${id}_ssn`}
            label='Fødselsnummer'
            required={required}
            requiredIndicator={<RequiredIndicator required={required} />}
          />
          {hasSuccessfullyFetched && <Description description='Fra folkeregisteret' />}
        </div>
        <NumericInput
          id={`${id}_ssn`}
          value={hasSuccessfullyFetched ? person_lookup_ssn : tempSsn}
          className={classes.ssn}
          required={required}
          readOnly={hasSuccessfullyFetched}
          error={
            (ssnErrors?.length && <Lang id={ssnErrors.join(' ')} />) || (
              <ComponentValidations validations={bindingValidations?.person_lookup_ssn} />
            )
          }
          onValueChange={(e) => {
            setTempSsn(e.value);
          }}
          onBlur={(e) => handleValidateSsn(e.target.value)}
          allowLeadingZeros
        />
        <div className={classes.nameLabel}>
          <Label
            htmlFor={`${id}_name`}
            required={required}
            requiredIndicator={<RequiredIndicator required={required} />}
            label='Etternavn'
          />
          {hasSuccessfullyFetched && <Description description='Fra folkeregisteret' />}
        </div>
        <Input
          id={`${id}_name`}
          value={hasSuccessfullyFetched ? person_lookup_name : tempName}
          className={classes.name}
          type='text'
          required={required}
          readOnly={hasSuccessfullyFetched}
          error={
            (nameErrors?.length && <Lang id={nameErrors.join(' ')} />) || (
              <ComponentValidations validations={bindingValidations?.person_lookup_name} />
            )
          }
          onChange={(e) => {
            setTempName(e.target.value);
          }}
          onBlur={(e) => handleValidateName(e.target.value)}
        />

        <div className={classes.submit}>
          {!hasSuccessfullyFetched ? (
            <Button
              onClick={handleSubmit}
              variant='secondary'
              isLoading={isFetching}
            >
              Hent opplysninger
            </Button>
          ) : (
            <Button
              variant='secondary'
              color='danger'
              onClick={handleClear}
            >
              Fjern
            </Button>
          )}
        </div>
        {data?.error && (
          <ErrorMessage
            size='small'
            style={{ gridArea: 'apiError' }}
          >
            <Lang id={data.error} />
          </ErrorMessage>
        )}
      </div>
    </ComponentStructureWrapper>
  );
}
