import React from 'react';

import { Paragraph } from '@digdir/designsystemet-react';

import { Label } from 'src/components/label/Label';
import { Lang } from 'src/features/language/Lang';
import { useOptionsFor } from 'src/features/options/useOptionsFor';
import { usePdfModeActive } from 'src/features/pdf/PDFWrapper';
import { useIsMobileOrTablet } from 'src/hooks/useDeviceWidths';
import { FileTable } from 'src/layout/FileUpload/FileUploadTable/FileTable';
import { useUploaderSummaryData } from 'src/layout/FileUpload/Summary/summary';
import { SummaryContains, SummaryFlex } from 'src/layout/Summary2/SummaryComponent2/ComponentSummary';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';

export function ImageUploadSummary2({ targetBaseComponentId }: Summary2Props) {
  const attachment = useUploaderSummaryData(targetBaseComponentId);
  const { required } = useItemWhenType(targetBaseComponentId, 'ImageUpload');
  const { options, isFetching } = useOptionsFor(targetBaseComponentId, 'single');
  const mobileView = useIsMobileOrTablet();
  const pdfModeActive = usePdfModeActive();
  const isSmall = mobileView && !pdfModeActive;
  const isEmpty = attachment.length === 0;

  const emptyValueText = required ? SummaryContains.EmptyValueRequired : SummaryContains.EmptyValueNotRequired;
  const contentLogic = isEmpty ? emptyValueText : SummaryContains.SomeUserContent;

  return (
    <SummaryFlex
      targetBaseId={targetBaseComponentId}
      content={contentLogic}
    >
      <Label
        baseComponentId={targetBaseComponentId}
        overrideId={`imageUpload-summary2-${targetBaseComponentId}`}
        renderLabelAs='span'
        weight='regular'
      />
      {isEmpty ? (
        <Paragraph asChild>
          <span>
            <Lang id='general.empty_summary' />
          </span>
        </Paragraph>
      ) : (
        <FileTable
          baseComponentId={targetBaseComponentId}
          mobileView={isSmall}
          attachments={attachment}
          options={options}
          isSummary={true}
          isFetching={isFetching}
        />
      )}
    </SummaryFlex>
  );
}
