import React from 'react';

import { Lang } from 'src/features/language/Lang';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { SubmitSigningButton } from 'src/layout/SigningStatusPanel/SubmitSigningButton';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type SubmitPanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
};

export function SubmitPanel({ node }: SubmitPanelProps) {
  const { textResourceBindings } = useNodeItem(node, (i) => ({
    nodeId: i.id,
    textResourceBindings: i.textResourceBindings,
  }));

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
      actionButton={<SubmitSigningButton node={node} />}
    />
  );
}
