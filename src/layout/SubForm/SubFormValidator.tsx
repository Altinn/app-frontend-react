import { useEffect } from 'react';

import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useDataTypeFromLayoutSet } from 'src/features/form/layout/LayoutsContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeValidationProps } from 'src/layout/layout';

export function SubFormValidator(props: NodeValidationProps<'SubForm'>) {
  const { node, externalItem } = props;
  const applicationMetadata = useApplicationMetadata();
  const targetType = useDataTypeFromLayoutSet(externalItem.layoutSet);
  const dataType = applicationMetadata.dataTypes.find(
    (x) => x.id.toLocaleLowerCase() === targetType?.toLocaleLowerCase(),
  );

  const addError = NodesInternal.useAddError();

  useEffect(() => {
    if (dataType === undefined) {
      addError('Finner ikke datatypen i applicationmetadata', node);
      window.logErrorOnce(`SubFormValidator for node med id ${node.id}: Klarer ikke finne datatype for noden.`);
    } else if (dataType.appLogic?.allowInSubform !== true) {
      const message = `Datatypen '${dataType.id}' er ikke tillatt for bruk i underskjema`;
      addError(message, node);
      window.logErrorOnce(`SubFormValidator for node med id ${node.id}: ${message}`);
    }
  }, [addError, dataType, node]);

  return null;
}
