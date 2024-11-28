import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { ComponentValidations } from 'src/features/validation/ComponentValidations';
import { useBindingValidationsForNode } from 'src/features/validation/selectors/bindingValidationsForNode';
import classes from 'src/layout/OrganisationLookup/OrganisationLookupComponent.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface OrganisationLookupSummaryProps {
  componentNode: LayoutNode<'OrganisationLookup'>;
}

export function OrganisationLookupSummary({ componentNode }: OrganisationLookupSummaryProps) {
  const { dataModelBindings } = useNodeItem(componentNode, (i) => ({ dataModelBindings: i.dataModelBindings }));
  const { formData } = useDataModelBindings(dataModelBindings);
  const { organisation_lookup_orgnr, organisation_lookup_name } = formData;

  const bindingValidations = useBindingValidationsForNode(componentNode);

  return (
    <div className={classes.organisationLookupSummary}>
      <div className={classes.organisationLookupSummaryNr}>
        <SingleValueSummary
          title={
            <Lang
              id='organisation_lookup.orgnr_label'
              node={componentNode}
            />
          }
          displayData={organisation_lookup_orgnr}
          componentNode={componentNode}
          hideEditButton={organisation_lookup_name ? true : false}
        />
        <ComponentValidations
          validations={bindingValidations?.organisation_lookup_orgnr}
          node={componentNode}
        />
      </div>
      {organisation_lookup_name && (
        <div className={classes.organisationLookupSummaryName}>
          <SingleValueSummary
            title=''
            displayData={organisation_lookup_name}
            componentNode={componentNode}
            hideEditButton={false}
          />
          <ComponentValidations
            validations={bindingValidations?.organisation_lookup_name}
            node={componentNode}
          />
        </div>
      )}
    </div>
  );
}
