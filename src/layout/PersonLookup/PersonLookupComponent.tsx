import React, { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Ajv, type JSONSchemaType } from 'ajv';
import addErrors from 'ajv-errors';
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
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

/*
TODO: Implement actual request
TODO: Handle API errors
*/

const personLookupKeys = {
  lookup: (ssn: string | number, name: string) => ['personLookup', ssn, name],
} as const;

/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_FNR =
  /^((((0[1-9]|[12]\d|30)(0[469]|11)|(0[1-9]|[12]\d|3[01])(0[13578]|1[02])|((0[1-9]|1\d|2[0-8])02))\d{2})|2902([02468][048]|[13579][26]))\d{5}$/;
/**
 * @see https://github.com/navikt/k9-punsj-frontend/blob/435a445a14797dee5c19fb1c1a70c323c3f4187c/src/app/rules/IdentRules.ts
 */
const REGEX_DNR =
  /^((((4[1-9]|[56]\d|70)(0[469]|11)|(4[1-9]|[56]\d|7[01])(0[13578]|1[02])|((4[1-9]|5\d|6[0-8])02))\d{2})|6902([02468][048]|[13579][26]))\d{5}$/;

type Person = {
  name: string;
  ssn: string;
};

const ajv = new Ajv({ allErrors: true });
addErrors(ajv);

const schema: JSONSchemaType<Person> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, errorMessage: 'person_lookup.validation_error_name_too_short' },
    ssn: {
      type: 'string',
      pattern: new RegExp(`((${REGEX_FNR.source}))|((${REGEX_DNR.source}))`).source,
      errorMessage: 'person_lookup.validation_error_ssn',
    },
  },
  required: ['name', 'ssn'],
};
const validate = ajv.compile(schema);

async function fetchPerson({ queryKey }: QueryFunctionContext<ReturnType<(typeof personLookupKeys)['lookup']>>) {
  const [ssn, name] = queryKey;
  if (!ssn || !name) {
    throw new Error('Missing ssn or name');
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { name: `Ola ${name}`, ssn };
}

export function PersonLookupComponent({ node }: PropsFromGenericComponent<'PersonLookup'>) {
  const { id, dataModelBindings, required } = useNodeItem(node);
  const [localSsn, setLocalSsn] = useState('');
  const [localName, setLocalName] = useState('');

  const {
    formData: { person_lookup_ssn, person_lookup_name },
    setValue,
  } = useDataModelBindings(dataModelBindings);

  const { refetch: performLookup, isFetching } = useQuery({
    queryKey: personLookupKeys.lookup(localSsn, localName),
    queryFn: fetchPerson,
    enabled: false,
    gcTime: 0,
  });

  function validateInput({ name, ssn }: Person) {
    const isValid = validate({ name, ssn });

    return isValid;
  }

  const ssnErrors = validate.errors
    ?.filter((error) => error.instancePath === '/ssn')
    .map((error) => error.message)
    .filter((it) => it != null);
  const nameErrors = validate.errors
    ?.filter((error) => error.instancePath === '/name')
    .map((error) => error.message)
    .filter((it) => it != null);

  async function handleSubmit() {
    const isValid = validateInput({ name: localName, ssn: localSsn });

    if (!isValid) {
      return;
    }

    const { data, error } = await performLookup();
    if (!data || error) {
      return; // TODO: handle error
    }

    setValue('person_lookup_name', data.name);
    setValue('person_lookup_ssn', data.ssn);
  }

  function handleClear() {
    setValue('person_lookup_name', '');
    setValue('person_lookup_ssn', '');
    setLocalName('');
    setLocalSsn('');
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
            readonly={hasSuccessfullyFetched}
          />
          {hasSuccessfullyFetched && <Description description='Fra folkeregisteret' />}
        </div>
        <NumericInput
          id={`${id}_ssn`}
          value={hasSuccessfullyFetched ? person_lookup_ssn : localSsn}
          className={classes.ssn}
          required={required}
          readOnly={hasSuccessfullyFetched}
          error={ssnErrors?.length && <Lang id={ssnErrors.join(' ')} />}
          onValueChange={(e) => {
            setLocalSsn(e.value);
          }}
          allowLeadingZeros
        />
        <div className={classes.nameLabel}>
          <Label
            htmlFor={`${id}_name`}
            required={required}
            label='Etternavn'
            readonly={hasSuccessfullyFetched}
          />
          {hasSuccessfullyFetched && <Description description='Fra folkeregisteret' />}
        </div>
        <Input
          id={`${id}_name`}
          value={hasSuccessfullyFetched ? person_lookup_name : localName}
          className={classes.name}
          type='text'
          required={required}
          readOnly={hasSuccessfullyFetched}
          error={nameErrors?.length && <Lang id={nameErrors.join(' ')} />}
          onChange={(e) => {
            setLocalName(e.target.value);
          }}
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
            <Button onClick={handleClear}>Fjern</Button>
          )}
        </div>
      </div>
    </ComponentStructureWrapper>
  );
}
