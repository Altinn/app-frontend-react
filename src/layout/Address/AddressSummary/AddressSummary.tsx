import React from 'react';

import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { Lang } from 'src/features/language/Lang';
import { useUnifiedValidationsForNode } from 'src/features/validation/selectors/unifiedValidationsForNode';
import { validationsOfSeverity } from 'src/features/validation/utils';
import styles from 'src/layout/Address/AddressSummary/AddressSummary.module.css';
import { SingleValueSummary } from 'src/layout/Summary2/CommonSummaryComponents/SingleValueSummary';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface AddressSummaryProps {
  componentNode: LayoutNode<'Address'>;
}

export function AddressSummary({ componentNode }: AddressSummaryProps) {
  const textResourceBindings = componentNode.item.textResourceBindings;
  const { title, careOfTitle, zipCodeTitle, postPlaceTitle, houseNumberTitle } = textResourceBindings ?? {};
  const { formData } = useDataModelBindings(componentNode.item.dataModelBindings);
  const { address, postPlace, zipCode, careOf, houseNumber } = formData;
  const validations = useUnifiedValidationsForNode(componentNode);
  const errors = validationsOfSeverity(validations, 'error');

  return (
    <>
      <div className={styles.container}>
        <SingleValueSummary
          title={<Lang id={title || 'address_component.address'} />}
          displayData={address}
          errors={errors}
          componentNode={componentNode}
        />

        <SingleValueSummary
          title={<Lang id={careOfTitle || 'address_component.care_of'} />}
          displayData={careOf}
          errors={errors}
          componentNode={componentNode}
          hideEditButton={true}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.flexGrow}>
          <SingleValueSummary
            title={<Lang id={zipCodeTitle || 'address_component.zip_code'} />}
            displayData={zipCode}
            errors={errors}
            componentNode={componentNode}
            hideEditButton={true}
          />
        </div>

        <div className={styles.flexGrow}>
          <SingleValueSummary
            title={<Lang id={postPlaceTitle || 'address_component.post_place'} />}
            displayData={postPlace}
            errors={errors}
            componentNode={componentNode}
            hideEditButton={true}
          />
        </div>
      </div>

      {!componentNode.item.simplified && (
        <SingleValueSummary
          title={<Lang id={houseNumberTitle || 'address_component.house_number'} />}
          displayData={houseNumber}
          errors={errors}
          componentNode={componentNode}
          hideEditButton={true}
        />
      )}
    </>
  );
}
