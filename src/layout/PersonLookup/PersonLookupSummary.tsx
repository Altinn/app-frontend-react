import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsFor } from 'src/features/validation/selectors/bindingValidationsForNode';
import classes from 'src/layout/PersonLookup/PersonLookupSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { SummaryContains, SummaryFlex } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useSummaryOverrides, useSummaryProp } from 'src/layout/Summary2/summaryStoreContext';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface PersonLookupSummaryProps {
  componentNode: LayoutNode<'PersonLookup'>;
}

export function PersonLookupSummary({ componentNode }: PersonLookupSummaryProps) {
  const { dataModelBindings, textResourceBindings, required } = useItemWhenType(componentNode.baseId, 'PersonLookup');
  const { formData } = useDataModelBindings(dataModelBindings);
  const { person_lookup_name, person_lookup_ssn } = formData;
  const emptyFieldText = useSummaryOverrides(componentNode)?.emptyFieldText;
  const isCompact = useSummaryProp('isCompact');
  const bindingValidations = useBindingValidationsFor<'PersonLookup'>(componentNode.baseId);
  const isEmpty = !(person_lookup_name || person_lookup_ssn);

  return (
    <SummaryFlex
      target={componentNode}
      content={
        isEmpty
          ? required
            ? SummaryContains.EmptyValueRequired
            : SummaryContains.EmptyValueNotRequired
          : SummaryContains.SomeUserContent
      }
    >
      <div className={classes.personSummaryWrapper}>
        <Heading
          data-size='sm'
          level={2}
        >
          <Lang id={textResourceBindings?.title} />
        </Heading>
        <div className={classes.personLookupComponent}>
          <div className={classes.personLookupComponentSsn}>
            <SingleValueSummary
              title={<Lang id='person_lookup.ssn_label' />}
              displayData={person_lookup_ssn ? obfuscateSsn(person_lookup_ssn) : ''}
              componentNode={componentNode}
              hideEditButton={true}
              isCompact={isCompact}
              emptyFieldText={emptyFieldText}
            />
            <ComponentValidations
              validations={bindingValidations?.person_lookup_ssn}
              baseComponentId={componentNode.baseId}
            />
          </div>

          <div className={classes.personLookupComponentName}>
            <SingleValueSummary
              title={<Lang id='person_lookup.name_label' />}
              displayData={person_lookup_name}
              componentNode={componentNode}
              hideEditButton={false}
              isCompact={isCompact}
              emptyFieldText={emptyFieldText}
            />
            <ComponentValidations
              validations={bindingValidations?.person_lookup_name}
              baseComponentId={componentNode.baseId}
            />
          </div>
        </div>
      </div>
    </SummaryFlex>
  );
}

function obfuscateSsn(ssn: string): string {
  return `${ssn.slice(0, -5)} *****`;
}
