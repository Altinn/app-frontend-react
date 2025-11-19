import React, { useEffect, useState } from 'react';

import { Card, Heading } from '@digdir/designsystemet-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from 'src/app-components/Button/Button';
import { Spinner } from 'src/app-components/loading/Spinner/Spinner';
import { Panel } from 'src/app-components/Panel/Panel';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import {
  fetchWalletResult,
  startWalletVerification,
  type VerificationResultResponse,
  walletQueries,
} from 'src/layout/Lommebok/api';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export function LommebokComponent(_props: PropsFromGenericComponent<'Lommebok'>) {
  const { langAsString } = useLanguage();
  const queryClient = useQueryClient();

  // Local state
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [claims, setClaims] = useState<VerificationResultResponse['claims'] | null>(null);

  // Mutation to start verification
  const startMutation = useMutation({
    mutationKey: ['startWalletVerification'],
    mutationFn: startWalletVerification,
    onSuccess: (data) => {
      setVerificationId(data.verifier_transaction_id);
      setAuthorizationUrl(data.authorization_request);
    },
    onError: (error) => {
      window.logError('Failed to start wallet verification:', error);
    },
  });

  // Query to poll status
  const statusQuery = useQuery(walletQueries.status(verificationId));

  // Fetch result when status becomes AVAILABLE
  useEffect(() => {
    const fetchResult = async () => {
      if (statusQuery.data?.status === 'AVAILABLE' && verificationId && !claims) {
        try {
          const result = await fetchWalletResult(verificationId);
          if (result.claims) {
            setClaims(result.claims);
          }
        } catch (error) {
          window.logError('Failed to fetch wallet result:', error);
        }
      }
    };

    void fetchResult();
  }, [statusQuery.data?.status, verificationId, claims]);

  // Reset handler
  const handleReset = () => {
    setVerificationId(null);
    setAuthorizationUrl(null);
    setClaims(null);
    queryClient.removeQueries({ queryKey: walletQueries.all() });
  };

  // Handle start request
  const handleStart = () => {
    startMutation.mutate();
  };

  // Render loading state for initial request
  if (startMutation.isPending) {
    return (
      <div className={classes.container}>
        <Card color='neutral'>
          <Card.Block>
            <div className={classes.loadingContainer}>
              <Spinner aria-label={langAsString('general.loading')} />
              <Lang id='wallet.starting_verification' />
            </div>
          </Card.Block>
        </Card>
      </div>
    );
  }

  // Render error state for start mutation
  if (startMutation.isError) {
    return (
      <div className={classes.container}>
        <Panel
          variant='error'
          showIcon
        >
          <Lang id='wallet.start_failed' />
          <Button
            onClick={handleReset}
            variant='secondary'
            size='sm'
          >
            <Lang id='wallet.try_again' />
          </Button>
        </Panel>
      </div>
    );
  }

  // Render success state with claims
  if (claims) {
    return (
      <div className={classes.container}>
        <Card
          color='success'
          variant='tinted'
        >
          <Card.Block>
            <Heading
              level={2}
              data-size='md'
            >
              <Lang id='wallet.success_title' />
            </Heading>
            <div className={classes.claimsContainer}>
              {claims.norwegian_national_id_number && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_national_id_number' />:
                  </strong>{' '}
                  {claims.norwegian_national_id_number}
                </div>
              )}
              {claims.norwegian_national_id_number_type && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_national_id_type' />:
                  </strong>{' '}
                  {claims.norwegian_national_id_number_type}
                </div>
              )}
              {/* Legacy driver's license fields for backwards compatibility */}
              {claims.portrait && (
                <div className={classes.portraitContainer}>
                  <img
                    src={`data:image/jpeg;base64,${claims.portrait}`}
                    alt={langAsString('wallet.success_title')}
                    className={classes.portrait}
                  />
                </div>
              )}
              {claims.given_name && claims.family_name && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_name' />:
                  </strong>{' '}
                  {claims.given_name} {claims.family_name}
                </div>
              )}
              {claims.birth_date && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_birth_date' />:
                  </strong>{' '}
                  {claims.birth_date}
                </div>
              )}
              {claims.document_number && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_document_number' />:
                  </strong>{' '}
                  {claims.document_number}
                </div>
              )}
              {claims.issuing_country && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_issuing_country' />:
                  </strong>{' '}
                  {claims.issuing_country}
                </div>
              )}
              {claims.issue_date && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_issue_date' />:
                  </strong>{' '}
                  {claims.issue_date}
                </div>
              )}
              {claims.expiry_date && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_expiry_date' />:
                  </strong>{' '}
                  {claims.expiry_date}
                </div>
              )}
              {claims.driving_privileges && claims.driving_privileges.length > 0 && (
                <div className={classes.claim}>
                  <strong>
                    <Lang id='wallet.claim_vehicle_categories' />:
                  </strong>{' '}
                  {claims.driving_privileges.map((p) => p.vehicle_category_code).join(', ')}
                </div>
              )}
            </div>
            <Button
              onClick={handleReset}
              variant='secondary'
              size='sm'
            >
              <Lang id='wallet.request_new' />
            </Button>
          </Card.Block>
        </Card>
      </div>
    );
  }

  // Render pending/polling state
  if (verificationId && authorizationUrl) {
    const isPolling = statusQuery.isFetching;
    const hasFailed = statusQuery.data?.status === 'FAILED';

    if (hasFailed) {
      return (
        <div className={classes.container}>
          <Panel
            variant='error'
            showIcon
          >
            <Lang id='wallet.verification_failed' />
            <Button
              onClick={handleReset}
              variant='secondary'
              size='sm'
            >
              <Lang id='wallet.try_again' />
            </Button>
          </Panel>
        </div>
      );
    }

    return (
      <div className={classes.container}>
        <Card
          color='brand1'
          variant='tinted'
        >
          <Card.Block>
            <Heading
              level={2}
              data-size='md'
            >
              <Lang id='wallet.verification_title' />
            </Heading>
            <Lang id='wallet.verification_description' />
            <div className={classes.qrContainer}>
              <QRCodeSVG
                value={authorizationUrl}
                size={256}
                level='M'
                includeMargin={true}
                className={classes.qrCode}
              />
            </div>
            <div className={classes.linkContainer}>
              <a
                href={authorizationUrl}
                target='_blank'
                rel='noreferrer'
                className={classes.authLink}
              >
                <Lang id='wallet.open_wallet' />
              </a>
            </div>
            {isPolling && (
              <div className={classes.pollingIndicator}>
                <Spinner
                  aria-label={langAsString('wallet.waiting_for_verification')}
                  data-size='sm'
                />
                <Lang id='wallet.waiting_for_verification' />
              </div>
            )}
          </Card.Block>
        </Card>
      </div>
    );
  }

  // Render initial state
  return (
    <div className={classes.container}>
      <Card color='neutral'>
        <Card.Block>
          <Heading
            level={2}
            data-size='md'
          >
            <Lang id='wallet.request_title' />
          </Heading>
          <Lang id='wallet.request_description' />
          <Button
            onClick={handleStart}
            variant='primary'
          >
            <Lang id='wallet.request_button' />
          </Button>
        </Card.Block>
      </Card>
    </div>
  );
}
