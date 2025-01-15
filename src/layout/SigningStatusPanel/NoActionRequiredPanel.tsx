import React from 'react';
import { useParams } from 'react-router-dom';

import { Link } from '@digdir/designsystemet-react';

import { Button } from 'src/app-components/Button/Button';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { SigningPanel } from 'src/layout/SigningStatusPanel/SigningPanel';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import { returnUrlToMessageBox } from 'src/utils/urls/urlHelper';
import type { CurrentUserStatus } from 'src/layout/SigningStatusPanel/SigningStatusPanelComponent';
import type { BaseLayoutNode } from 'src/utils/layout/LayoutNode';

type NoActionRequiredPanelProps = {
  node: BaseLayoutNode<'SigningStatusPanel'>;
  currentUserStatus: Extract<CurrentUserStatus, 'signed' | 'notSigning'>;
};

export function NoActionRequiredPanel({ node, currentUserStatus }: NoActionRequiredPanelProps) {
  const { langAsString } = useLanguage();
  const partyId = Number(useParams().partyId);
  const { textResourceBindings } = useNodeItem(node);

  const titleHasSigned =
    textResourceBindings?.no_action_required_panel_title_has_signed ??
    'signing.no_action_required_panel_title_has_signed';
  const titleNotSigned =
    textResourceBindings?.no_action_required_panel_title_not_signed ??
    'signing.no_action_required_panel_title_not_signed';
  const descriptionHasSigned =
    textResourceBindings?.no_action_required_panel_description_has_signed ??
    'signing.no_action_required_panel_description_has_signed';
  const descriptionNotSigned =
    textResourceBindings?.no_action_required_panel_description_not_signed ??
    'signing.no_action_required_panel_description_not_signed';
  const goToInboxButton = textResourceBindings?.no_action_required_button ?? 'signing.no_action_required_button';

  const hasSigned = currentUserStatus === 'signed';

  return (
    <SigningPanel
      node={node}
      variant={hasSigned ? 'success' : 'info'}
      heading={langAsString(hasSigned ? titleHasSigned : titleNotSigned)}
      description={langAsString(hasSigned ? descriptionHasSigned : descriptionNotSigned)}
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
