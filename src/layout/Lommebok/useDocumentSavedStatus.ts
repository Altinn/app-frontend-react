import { useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceDataElements } from 'src/features/instance/InstanceContext';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

/**
 * Helper hook to check if a document has been saved (wallet data OR file upload)
 */
export function useDocumentSavedStatus(doc: RequestedDocument): boolean {
  const selector = FD.useDebouncedSelector();
  const uploadedElements = useInstanceDataElements(doc.alternativeUploadToDataType);

  return useMemo(() => {
    // Check if alternative file has been uploaded
    if (doc.alternativeUploadToDataType && uploadedElements.length > 0) {
      return true;
    }

    // Check if ANY configured field has data in the data model
    if (doc.saveToDataType && doc.data && doc.data.length > 0) {
      return doc.data.some((mapping) => {
        const value = selector({ dataType: doc.saveToDataType!, field: mapping.field });
        return value !== undefined && value !== null && value !== '';
      });
    }

    return false;
  }, [doc, uploadedElements, selector]);
}
