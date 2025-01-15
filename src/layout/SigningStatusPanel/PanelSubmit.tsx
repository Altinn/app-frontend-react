import React from 'react';

import { Button } from 'src/app-components/Button/Button';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

type SubmitPanelProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
};

export function SubmitPanel({ node }: SubmitPanelProps) {
  const { next, busy } = useProcessNavigation() ?? {};
  const { langAsString } = useLanguage();
  const { id: nodeId, textResourceBindings } = useNodeItem(node);

  function handleSubmit() {
    next?.({ nodeId });
  }

  const titleReadyForSubmit = textResourceBindings?.submit_panel_title ?? 'signing.submit_panel_title';
  const descriptionReadyForSubmit =
    textResourceBindings?.submit_panel_description ?? 'signing.submit_panel_description';

  return (
    <SigningPanel
      node={node}
      variant='success'
      heading={langAsString(titleReadyForSubmit)}
      description={langAsString(descriptionReadyForSubmit)}
      actionButton={
        <Button
          onClick={handleSubmit}
          size='md'
          color='success'
          disabled={busy}
        >
          <Lang id='signing.submit_button' />
        </Button>
      }
    />
  );
}
