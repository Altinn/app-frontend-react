import React from 'react';
import { useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { signeeListQuery } from 'src/layout/SigneeList/api';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type SubmitPanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
};

export function SubmitPanel({ node }: SubmitPanelProps) {
  const { next, busy } = useProcessNavigation() ?? {};
  const { nodeId, textResourceBindings } = useNodeItem(node, (i) => ({
    nodeId: i.id,
    textResourceBindings: i.textResourceBindings,
  }));
  const queryClient = useQueryClient();
  const { partyId, instanceGuid } = useParams();

  async function handleSubmit() {
    await next?.({ nodeId });
    queryClient.invalidateQueries({ queryKey: signeeListQuery(partyId!, instanceGuid!).queryKey });
  }

  const titleReadyForSubmit = textResourceBindings?.submitPanelTitle ?? 'signing.submit_panel_title';
  const descriptionReadyForSubmit = textResourceBindings?.submitPanelDescription ?? 'signing.submit_panel_description';
  const submitButtonText = textResourceBindings?.submitButton ?? 'signing.submit_button';

  return (
    <SigningPanel
      node={node}
      variant='success'
      heading={<Lang id={titleReadyForSubmit} />}
      description={
        <Lang
          id={descriptionReadyForSubmit}
          params={[
            <Lang
              key='submitButtonText'
              id={submitButtonText}
            />,
          ]}
        />
      }
      actionButton={
        <Button
          onClick={handleSubmit}
          size='md'
          color='success'
          disabled={busy}
          isLoading={busy}
        >
          <Lang id={submitButtonText} />
        </Button>
      }
    />
  );
}
