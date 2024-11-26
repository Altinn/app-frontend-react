import React, { useState } from 'react';

import { ErrorMessage } from '@digdir/designsystemet-react';
import { type QueryFunctionContext, useQuery } from '@tanstack/react-query';

import type { PropsFromGenericComponent } from '..';

import { Button } from 'src/app-components/button/Button';
import { NumericInput } from 'src/app-components/Input/NumericInput';
import { Label } from 'src/app-components/Label/Label';
import { Description } from 'src/components/form/Description';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { getDescriptionId } from 'src/components/label/Label';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsForNode } from 'src/features/validation/selectors/bindingValidationsForNode';
import { hasValidationErrors } from 'src/features/validation/utils';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/OrganisationLookup/OrganisationLookupComponent.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { httpGet } from 'src/utils/network/networking';
import { appPath } from 'src/utils/urls/appUrlHelper';

const orgLookupKeys = {
  lookup: (orgNr: string) => [{ scope: 'organisationLookup', orgNr }],
} as const;

export type Organisation = {
  orgNr: string;
  name: string;
};
export type OrganisationLookupResponse = { org: Organisation; error: null } | { org: null; error: string };

async function fetchOrg({
  queryKey: [{ orgNr }],
}: QueryFunctionContext<ReturnType<(typeof orgLookupKeys)['lookup']>>): Promise<
  { org: Organisation; error: null } | { org: null; error: string }
> {
  if (!orgNr) {
    throw new Error('orgNr is required');
  }
  const url = `${appPath}/api/v1/lookup/${orgNr}`;

  try {
    const response = await httpGet<{ data: Organisation }>(url);
    if (!response) {
      throw new Error('No data');
    }
    const data = response.data;
    if (!data) {
      throw new Error('No data');
    }
    return { org: data, error: null };
  } catch (error) {
    if (error.response.status === 403) {
      return { org: null, error: 'organisation_lookup.validation_error_forbidden' };
    }
    if (error.response.status === 429) {
      return { org: null, error: 'organisation_lookup.validation_error_too_many_requests' };
    }

    return { org: null, error: 'organisation_lookup.unknown_error' };
  }
}

export function OrganisationLookupComponent({ node }: PropsFromGenericComponent<'OrganisationLookup'>) {
  const { id, dataModelBindings, required } = useNodeItem(node);
  const [tempOrgNr, setTempOrgNr] = useState('');

  const {
    formData: { organisation_lookup_orgnr },
    setValue,
  } = useDataModelBindings(dataModelBindings);

  const bindingValidations = useBindingValidationsForNode(node);
  const { langAsString } = useLanguage();

  const {
    data,
    refetch: performLookup,
    isFetching,
  } = useQuery({
    queryKey: orgLookupKeys.lookup(tempOrgNr),
    queryFn: fetchOrg,
    enabled: false,
    gcTime: 0,
  });

  function handleValidateOrgnr(orgNr: string) {
    return true;
  }

  async function handleSubmit() {
    const isValid = handleValidateOrgnr(tempOrgNr);

    if (!isValid) {
      return;
    }

    const { data } = await performLookup();
    if (data?.org) {
      setValue('organisation_lookup_orgnr', data.org.orgNr);
    }
  }

  function handleClear() {
    setValue('organisation_lookup_orgnr', '');
    setTempOrgNr('');
  }

  const hasSuccessfullyFetched = !!organisation_lookup_orgnr;

  return (
    <ComponentStructureWrapper node={node}>
      <div className={classes.componentWrapper}>
        <div className={classes.orgnrLabel}>
          <Label
            htmlFor={`${id}_orgnr`}
            label={langAsString('organisation_lookup.orgnr_label')}
            required={required}
            requiredIndicator={<RequiredIndicator required={required} />}
            description={
              hasSuccessfullyFetched ? (
                <Description
                  description={langAsString('organisation_lookup.orgnr_description')}
                  componentId={`${id}_orgnr`}
                />
              ) : undefined
            }
          />
        </div>
        <NumericInput
          id={`${id}_orgnr`}
          aria-describedby={hasSuccessfullyFetched ? getDescriptionId(`${id}_orgnr`) : undefined}
          value={hasSuccessfullyFetched ? organisation_lookup_orgnr : tempOrgNr}
          className={classes.orgnr}
          required={required}
          readOnly={hasSuccessfullyFetched || isFetching}
          error={
            hasValidationErrors(bindingValidations?.organisation_lookup_orgnr) && (
              <ComponentValidations validations={bindingValidations?.organisation_lookup_orgnr} />
            )
          }
          onValueChange={(e) => {
            setTempOrgNr(e.value);
          }}
          onBlur={(e) => handleValidateOrgnr(e.target.value)}
          allowLeadingZeros
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
