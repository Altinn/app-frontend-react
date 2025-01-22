import React from 'react';

import { Paragraph } from '@digdir/designsystemet-react';

import { Lang } from 'src/features/language/Lang';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type PanelErrorProps = { node: LayoutNode<'SigningStatusPanel'> };

export function PanelError({ node }: PanelErrorProps) {
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);

  const errorTitle = textResourceBindings?.errorPanelTitle ?? 'signing.error_panel_title';
  const errorDescription = textResourceBindings?.errorPanelDescription ?? 'signing.error_panel_description';

  return (
    <SigningPanel
      variant='error'
      node={node}
      heading={<Lang id={errorTitle} />}
    >
      <Paragraph>
        <Lang id={errorDescription} />
      </Paragraph>
    </SigningPanel>
  );
}
