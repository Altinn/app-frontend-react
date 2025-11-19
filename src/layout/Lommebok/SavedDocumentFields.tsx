import React, { useMemo } from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceDataElements } from 'src/features/instance/InstanceContext';
import { DocumentDataPreview } from 'src/layout/Lommebok/DocumentDataPreview';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

interface SavedDocumentFieldsProps {
  doc: RequestedDocument;
}

/**
 * Component that displays the saved presentation fields from the data model
 * Shows the wallet data that has been saved (not file uploads)
 */
export function SavedDocumentFields({ doc }: SavedDocumentFieldsProps) {
  const selector = FD.useDebouncedSelector();
  const uploadedElements = useInstanceDataElements(doc.alternativeUploadToDataType ?? 'non-existing-hopefully');
  const hasUploadedFile = doc.alternativeUploadToDataType !== undefined && uploadedElements.length > 0;

  // Get presentation field values from data model
  const presentationFields = useMemo(() => {
    if (!doc.data || doc.data.length === 0 || !doc.saveToDataType) {
      return [];
    }

    return doc.data
      .map((mapping) => {
        const value = selector({ dataType: doc.saveToDataType!, field: mapping.field });

        // Skip fields with no data
        if (value === undefined || value === null || value === '') {
          return null;
        }

        return {
          title: mapping.title,
          value,
          displayType: mapping.displayType,
        };
      })
      .filter((field): field is NonNullable<typeof field> => field !== null);
  }, [doc, selector]);

  // Don't show presentation fields if a file was uploaded instead
  if (hasUploadedFile) {
    return null;
  }

  return <DocumentDataPreview fields={presentationFields} />;
}
