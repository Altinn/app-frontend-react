import React, { useState } from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { useQuery } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';

import { Button } from 'src/app-components/button/Button';
import { Input } from 'src/app-components/Input/Input';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { Label } from 'src/app-components/Label/Label';
import { Description } from 'src/components/form/Description';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/PersonLookup/PersonLookupComponent.module.css';
import { validateName, validateSsn } from 'src/layout/PersonLookup/validation';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

/*
TODO: Implement actual request
TODO: Handle API errors.
*/

const personLookupKeys = {
  lookup: (ssn: string | number, name: string) => [{ scope: 'personLookup', ssn, name }],
} as const;

export type Person = {
  name: string;
  ssn: string;
};

async function fetchPerson({
  queryKey: [{ ssn, name }],
}: QueryFunctionContext<ReturnType<(typeof personLookupKeys)['lookup']>>) {
  // throw new Error('person_lookup.validation_error_not_found');
  if (!ssn || !name) {
    throw new Error('Missing ssn or name');
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { name: `Ola ${name}`, ssn };
}

export function PersonLookupComponent({ node }: PropsFromGenericComponent<'PersonLookup'>) {
  const { id, dataModelBindings, required } = useNodeItem(node);
  const [tempSsn, setTempSsn] = useState('');
  const [tempName, setTempName] = useState('');
  const [ssnErrors, setSsnErrors] = useState<string[]>();
  const [nameErrors, setNameErrors] = useState<string[]>();

  const {
    formData: { person_lookup_ssn, person_lookup_name },
    setValue,
  } = useDataModelBindings(dataModelBindings);

  const {
    refetch: performLookup,
    isFetching,
    error: apiError,
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

    const { data, error } = await performLookup();
    if (data && !error) {
      setValue('person_lookup_name', data.name);
      setValue('person_lookup_ssn', data.ssn);
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
          />
          {hasSuccessfullyFetched && <Description description='Fra folkeregisteret' />}
        </div>
        <NumericInput
          id={`${id}_ssn`}
          value={hasSuccessfullyFetched ? person_lookup_ssn : tempSsn}
          className={classes.ssn}
          required={required}
          readOnly={hasSuccessfullyFetched}
          error={ssnErrors?.length && <Lang id={ssnErrors.join(' ')} />}
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
          error={nameErrors?.length && <Lang id={nameErrors.join(' ')} />}
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
        {apiError && (
          <ErrorMessage
            size='small'
            style={{ gridArea: 'apiError' }}
          >
            <Lang id={apiError.message} />
          </ErrorMessage>
        )}
      </div>
    </ComponentStructureWrapper>
  );
}
