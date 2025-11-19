import React, { useMemo } from 'react';

import { List, Paragraph, Tag } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { HelpText } from 'src/app-components/HelpText/HelpText';
import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceDataElements } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { getDocumentDisplayName } from 'src/layout/Lommebok/api';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import { PresentationValue } from 'src/layout/Lommebok/PresentationValue';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

/**
 * Helper hook to check if a document has been saved (wallet data OR file upload)
 */
function useDocumentSavedStatus(doc: RequestedDocument): boolean {
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

/**
 * Component to render a single document list item with presentation fields
 */
interface DocumentListItemProps {
  doc: RequestedDocument;
  handleRequestDocument: (docType: RequestedDocument['type']) => void;
  handleAlternativeUpload: (docType: RequestedDocument['type']) => void;
}

export function DocumentListItem({ doc, handleRequestDocument, handleAlternativeUpload }: DocumentListItemProps) {
  const selector = FD.useDebouncedSelector();
  const uploadedElements = useInstanceDataElements(doc.alternativeUploadToDataType);
  const hasSaved = useDocumentSavedStatus(doc);
  const hasSaveToDataType = !!doc.saveToDataType;
  const hasUploadedFile = uploadedElements.length > 0;

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

  return (
    <List.Item className={classes.documentListItem}>
      <div className={classes.documentItemContent}>
        <div className={classes.documentInfo}>
          <span className={classes.documentName}>{getDocumentDisplayName(doc.type)}</span>
          {!hasSaveToDataType && (
            <HelpText
              title='Data is not saved'
              placement='right'
            >
              <Paragraph data-size='sm'>
                <strong>This data is not saved anywhere.</strong>
              </Paragraph>
              <Paragraph data-size='sm'>To save the data:</Paragraph>
              <List.Ordered data-size='sm'>
                <List.Item>Request document from wallet to receive data</List.Item>
                <List.Item>Download the XSD file from the dialog when data is received</List.Item>
                <List.Item>Upload this as a new data model in Altinn Studio</List.Item>
                <List.Item>
                  Set the <code>saveToDataType</code> property to the data type ID
                </List.Item>
              </List.Ordered>
            </HelpText>
          )}
        </div>
        <div className={classes.documentActions}>
          {hasSaved ? (
            hasUploadedFile ? (
              <Tag
                data-color='success'
                data-size='sm'
              >
                <Lang id='wallet.alternative_file_uploaded' />
              </Tag>
            ) : (
              <Tag
                data-color='success'
                data-size='sm'
              >
                <Lang id='wallet.document_saved' />
              </Tag>
            )
          ) : (
            <>
              <Button
                onClick={() => handleRequestDocument(doc.type)}
                variant='primary'
                size='sm'
              >
                <Lang id='wallet.request_document' />
              </Button>
              {doc.alternativeUploadToDataType && (
                <Button
                  onClick={() => handleAlternativeUpload(doc.type)}
                  variant='secondary'
                  size='sm'
                >
                  <Lang id='wallet.upload_document' />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Show presentation fields if data has been saved via wallet (not file upload) */}
      {hasSaved && !hasUploadedFile && presentationFields.length > 0 && (
        <div className={classes.presentationFields}>
          {presentationFields.map((field, index) => (
            <div
              key={index}
              className={classes.presentationField}
            >
              <strong>{field.title}:</strong>{' '}
              <PresentationValue
                value={field.value}
                displayType={field.displayType}
              />
            </div>
          ))}
        </div>
      )}
    </List.Item>
  );
}
