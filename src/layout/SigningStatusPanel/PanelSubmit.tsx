import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
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

  function handleSubmit() {
    next?.({ nodeId });
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
        >
          <Lang id={submitButtonText} />
        </Button>
      }
    />
  );
}
