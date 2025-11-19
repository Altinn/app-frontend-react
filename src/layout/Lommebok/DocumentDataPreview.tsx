import React from 'react';

import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import { PresentationValue } from 'src/layout/Lommebok/PresentationValue';

interface PresentationField {
  title: string;
  value: unknown;
  displayType?: 'string' | 'date' | 'image';
}

interface DocumentDataPreviewProps {
  fields: PresentationField[];
}

/**
 * Shared component for displaying presentation fields in a nice grid layout
 * Used both in the success dialog and in the Details view when data is saved
 */
export function DocumentDataPreview({ fields }: DocumentDataPreviewProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className={classes.dataPreview}>
      {fields.map((field, index) => (
        <div
          key={index}
          className={classes.dataPreviewItem}
        >
          <dt className={classes.dataPreviewLabel}>{field.title}</dt>
          <dd className={classes.dataPreviewValue}>
            <PresentationValue
              value={field.value}
              displayType={field.displayType}
            />
          </dd>
        </div>
      ))}
    </div>
  );
}
