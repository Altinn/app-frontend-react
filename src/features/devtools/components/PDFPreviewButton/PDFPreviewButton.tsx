import React from 'react';

import { Button, Fieldset } from '@digdir/design-system-react';
import { FilePdfIcon } from '@navikt/aksel-icons';

import { PDFGeneratorPreview } from 'src/features/devtools/components/PDFPreviewButton/PDFGeneratorPreview';
import classes from 'src/features/devtools/components/PDFPreviewButton/PDFPreview.module.css';
import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { useIsDev } from 'src/hooks/useIsDev';
import { ProcessTaskType } from 'src/types';

export const PDFPreviewButton = () => {
  const taskType = useTaskTypeFromBackend();
  const setPdfPreview = useDevToolsStore((state) => state.actions.setPdfPreview);
  const isDev = useIsDev();

  return (
    <Fieldset
      legend='Forhåndsvis PDF'
      description={
        !(window as any).chrome ? (
          <span>
            Vær oppmerksom på at <code>Forhåndsvis PDF</code> ikke vil se riktig ut i andre nettlesere enn Google
            Chrome.
          </span>
        ) : undefined
      }
      className={classes.fieldset}
    >
      <Button
        onClick={() => setPdfPreview(true)}
        size='small'
        disabled={taskType !== ProcessTaskType.Data}
        color='second'
      >
        {<FilePdfIcon aria-hidden />}
        Forhåndsvis PDF
      </Button>
      {isDev && <PDFGeneratorPreview />}
    </Fieldset>
  );
};
