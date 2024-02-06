import React from 'react';

import { Button, Fieldset } from '@digdir/design-system-react';
import { FilePdfIcon } from '@navikt/aksel-icons';

import { useDevToolsStore } from 'src/features/devtools/data/DevToolsStore';
import { useLaxInstance } from 'src/features/instance/InstanceContext';
import { useTaskTypeFromBackend } from 'src/features/instance/ProcessContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useIsLocalTest } from 'src/hooks/useIsDev';
import { ProcessTaskType } from 'src/types';

export const PDFPreviewButton = () => {
  const taskType = useTaskTypeFromBackend();
  const setPdfPreview = useDevToolsStore((state) => state.actions.setPdfPreview);
  const isLocalTest = useIsLocalTest();
  const instanceId = useLaxInstance()?.instanceId;
  const language = useCurrentLanguage();

  return (
    <Fieldset
      legend='Forhåndsvis PDF'
      description={
        !(window as any).chrome
          ? 'Vær oppmerksom på at forhåndsvisningen ikke vil se riktig ut i andre nettlesere enn Google Chrome.'
          : undefined
      }
    >
      <Button
        onClick={() => setPdfPreview(true)}
        size='small'
        disabled={taskType !== ProcessTaskType.Data}
        color='second'
        icon={<FilePdfIcon aria-hidden />}
      >
        Forhåndsvis PDF
      </Button>
      {isLocalTest && (
        <>
          <a
            style={{ marginTop: '0.5rem', display: 'inline-block' }}
            href={`/Home/PDFPreview/Index?org=${window.org}&app=${window.app}&instance=${instanceId}&lang=${language}`}
            target='_blank'
            rel='noreferrer'
          >
            Bruk lokal PDF-generator
          </a>
        </>
      )}
    </Fieldset>
  );
};
