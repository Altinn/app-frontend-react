import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ChangeEvent } from 'react';

import { Checkbox, Radio, Spinner } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from 'src/app-components/Button/Button';
import { Panel } from 'src/app-components/Panel/Panel';
import { RadioButton } from 'src/components/form/RadioButton';
import { useIsAuthorised } from 'src/features/instance/ProcessContext';
import { UnknownError } from 'src/features/instantiate/containers/UnknownError';
import { Lang } from 'src/features/language/Lang';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { authorizedOrganisationDetailsQuery } from 'src/layout/SigningStatusPanel/api';
import { SigningPanel } from 'src/layout/SigningStatusPanel/PanelSigning';
import classes from 'src/layout/SigningStatusPanel/SigningStatusPanel.module.css';
import { SubmitSigningButton } from 'src/layout/SigningStatusPanel/SubmitSigningButton';
import { doPerformAction } from 'src/queries/queries';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type AwaitingCurrentUserSignaturePanelProps = {
  node: LayoutNode<'SigningStatusPanel'>;
  hasMissingSignatures: boolean;
};

export function AwaitingCurrentUserSignaturePanel({
  node,
  hasMissingSignatures,
}: Readonly<AwaitingCurrentUserSignaturePanelProps>) {
  const { instanceOwnerPartyId, instanceGuid } = useParams();
  const isAuthorised = useIsAuthorised();
  const canSign = isAuthorised('sign');
  const canWrite = isAuthorised('write');

  const selectedLanguage = useCurrentLanguage();
  const queryClient = useQueryClient();
  const textResourceBindings = useNodeItem(node, (i) => i.textResourceBindings);
  const { langAsString } = useLanguage();

  const title = textResourceBindings?.awaitingSignaturePanelTitle ?? 'signing.awaiting_signature_panel_title';
  const checkboxLabel = textResourceBindings?.checkboxLabel ?? 'signing.checkbox_label';
  const checkboxDescription = textResourceBindings?.checkboxDescription;
  const signingButtonText = textResourceBindings?.signingButton ?? 'signing.sign_button';

  const {
    data: authorizedOrganisationDetails,
    isLoading: isApiLoading,
    error: apiError,
  } = useQuery(authorizedOrganisationDetailsQuery(instanceOwnerPartyId!, instanceGuid!));

  const {
    mutate: handleSign,
    error,
    isSuccess,
    isPending,
  } = useMutation({
    mutationFn: async (onBehalfOf: string) => {
      if (instanceOwnerPartyId && instanceGuid) {
        return doPerformAction(
          instanceOwnerPartyId,
          instanceGuid,
          { action: 'sign', metadata: { onBehalfOf } },
          selectedLanguage,
          queryClient,
        );
      }
    },
  });

  const [confirmReadDocuments, setConfirmReadDocuments] = useState(false);
  const [onBehalfOf, setOnBehalfOf] = useState('self');

  // This shouldn't really happen, but if it does it indicates that our backend is out of sync with Autorisasjon somehow
  if (!canSign) {
    return <UnknownError />;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setOnBehalfOf(event.target.value);
  }

  if (isApiLoading) {
    return (
      <Panel
        variant='info'
        isOnBottom
      >
        <div className={classes.loadingContainer}>
          <Spinner title={langAsString('signing.loading')} />
        </div>
      </Panel>
    );
  }

  return (
    <SigningPanel
      node={node}
      variant='info'
      heading={<Lang id={title} />}
      actionButton={
        <>
          <Button
            onClick={() => handleSign(onBehalfOf)}
            disabled={!confirmReadDocuments || isPending || isSuccess}
            size='md'
            color='success'
          >
            <Lang id={signingButtonText} />
          </Button>
          {!hasMissingSignatures && canWrite && <SubmitSigningButton node={node} />}
        </>
      }
      description={<Lang id={checkboxDescription} />}
      errorMessage={error ? <Lang id='signing.error_signing' /> : undefined}
    >
      {authorizedOrganisationDetails && authorizedOrganisationDetails.length > 0 && (
        <Radio.Group
          legend='Hvem ønsker du å signere på vegne av?'
          hideLegend={false}
          description='Følgende er parter du har rettigheter til å signere på vegne av.'
          error={false}
          readOnly={false}
          inline={false}
          role='radiogroup'
        >
          <RadioButton
            value='self'
            label='Meg selv'
            name='self'
            onChange={handleChange}
          />
          {authorizedOrganisationDetails.map((org) => (
            <RadioButton
              value={org.orgName}
              label={org.orgName}
              helpText='Fordi du haren nøkkelrolle i denne befriften, kan du velge å signere på vegne av denne parten.'
              name={org.orgName}
              key={org.partyId}
              // checked={option.value === selectedValues[0]}
              // showAsCard={showAsCard}
              // readOnly={readOnly}
              onChange={handleChange}
              // hideLabel={hideLabel}
              // size='small'
              // alertOnChange={alertOnChange}
              // alertText={alertText}
              // confirmChangeText={confirmChangeText}
            />
          ))}
        </Radio.Group>
      )}
      <Checkbox
        value={String(confirmReadDocuments)}
        checked={confirmReadDocuments}
        onChange={() => setConfirmReadDocuments(!confirmReadDocuments)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setConfirmReadDocuments(!confirmReadDocuments);
          }
        }}
        className={classes.checkbox}
      >
        <Lang id={checkboxLabel} />
      </Checkbox>
    </SigningPanel>
  );
}
