import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { returnUrlToMessageBox } from 'src/utils/urls/urlHelper';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type NoActionRequiredPanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
  currentUserStatus: Extract<CurrentUserStatus, 'signed' | 'notSigning'>;
};

export function NoActionRequiredPanel({ node, currentUserStatus }: NoActionRequiredPanelProps) {
  const partyId = Number(useParams().partyId);
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);

  const titleHasSigned =
    textResourceBindings?.noActionRequiredPanelTitleHasSigned ?? 'signing.no_action_required_panel_title_has_signed';
  const titleNotSigned =
    textResourceBindings?.noActionRequiredPanelTitleNotSigned ?? 'signing.no_action_required_panel_title_not_signed';
  const descriptionHasSigned =
    textResourceBindings?.noActionRequiredPanelDescriptionHasSigned ??
    'signing.no_action_required_panel_description_has_signed';
  const descriptionNotSigned =
    textResourceBindings?.noActionRequiredPanelDescriptionNotSigned ??
    'signing.no_action_required_panel_description_not_signed';
  const goToInboxButton = textResourceBindings?.noActionRequiredButton ?? 'signing.no_action_required_button';

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      node={node}
      variant={hasSigned ? 'success' : 'info'}
      heading={<Lang id={hasSigned ? titleHasSigned : titleNotSigned} />}
      description={<Lang id={hasSigned ? descriptionHasSigned : descriptionNotSigned} />}
      actionButton={
        <Button
          color='first'
          size='md'
          asChild
        >
          <Link
            href={returnUrlToMessageBox(window.location.origin, partyId) ?? '#'}
            className={classes.buttonLink}
          >
            <Lang id={goToInboxButton} />
          </Link>
        </Button>
      }
    />
  );
}
