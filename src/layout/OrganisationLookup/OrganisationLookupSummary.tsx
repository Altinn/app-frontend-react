import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsFor } from 'src/features/validation/selectors/bindingValidationsForNode';
import classes from 'src/layout/OrganisationLookup/OrganisationLookupSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { SummaryContains, SummaryFlex } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useSummaryOverrides, useSummaryProp } from 'src/layout/Summary2/summaryStoreContext';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export function OrganisationLookupSummary({ targetBaseComponentId }: Summary2Props) {
  const { dataModelBindings, textResourceBindings, required } = useItemWhenType(
    targetBaseComponentId,
    'OrganisationLookup',
  );
  const title = textResourceBindings?.title;
  const { formData } = useDataModelBindings(dataModelBindings);
  const { organisation_lookup_orgnr, organisation_lookup_name } = formData;
  const emptyFieldText = useSummaryOverrides<'OrganisationLookup'>(targetBaseComponentId)?.emptyFieldText;
  const isCompact = useSummaryProp('isCompact');
  const bindingValidations = useBindingValidationsFor<'OrganisationLookup'>(targetBaseComponentId);
  const isEmpty = !(organisation_lookup_orgnr || organisation_lookup_name);

  return (
    <SummaryFlex
      targetBaseId={targetBaseComponentId}
      content={
        isEmpty
          ? required
            ? SummaryContains.EmptyValueRequired
            : SummaryContains.EmptyValueNotRequired
          : SummaryContains.SomeUserContent
      }
    >
      <div className={classes.organisationSummaryWrapper}>
        <Heading
          data-size='sm'
          level={2}
        >
          <Lang id={title} />
        </Heading>
        <div className={classes.organisationLookupSummary}>
          <div className={classes.organisationLookupSummaryNr}>
            <SingleValueSummary
              title={<Lang id='organisation_lookup.orgnr_label' />}
              displayData={organisation_lookup_orgnr}
              targetBaseComponentId={targetBaseComponentId}
              hideEditButton={organisation_lookup_name ? true : false}
              isCompact={isCompact}
              emptyFieldText={emptyFieldText}
            />
            <ComponentValidations
              validations={bindingValidations?.organisation_lookup_orgnr}
              baseComponentId={targetBaseComponentId}
            />
          </div>
          {organisation_lookup_name && (
            <div className={classes.organisationLookupSummaryName}>
              <SingleValueSummary
                title={<Lang id='organisation_lookup.org_name' />}
                displayData={organisation_lookup_name}
                targetBaseComponentId={targetBaseComponentId}
                hideEditButton={false}
                isCompact={isCompact}
                emptyFieldText={emptyFieldText}
              />
              <ComponentValidations
                validations={bindingValidations?.organisation_lookup_name}
                baseComponentId={targetBaseComponentId}
              />
            </div>
          )}
        </div>
      </div>
    </SummaryFlex>
  );
}
