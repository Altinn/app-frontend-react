import { queryOptions, skipToken } from '@tanstack/react-query';
import slugify from 'slugify';

import credentialOptions from 'src/layout/Lommebok/options.json';
import { credentialTypes } from 'src/layout/Lommebok/types';
import { httpGet, httpPost } from 'src/utils/network/networking';
import { appPath } from 'src/utils/urls/appUrlHelper';
import type { RequestedDocument } from 'src/layout/Lommebok/config.generated';

// TypeScript interfaces for API responses
export interface VerificationStartResponse {
  verifier_transaction_id: string;
  authorization_request: string;
}

export interface VerificationStatusResponse {
  status: 'PENDING' | 'AVAILABLE' | 'FAILED';
}

export interface VerificationResultResponse {
  claims: {
    norwegian_national_id_number?: string;
    norwegian_national_id_number_type?: string;
    // Legacy fields for backwards compatibility
    portrait?: string;
    given_name?: string;
    family_name?: string;
    birth_date?: string;
    issue_date?: string;
    expiry_date?: string;
    issuing_country?: string;
    document_number?: string;
    driving_privileges?: Array<{
      vehicle_category_code?: string;
      issue_date?: string;
      expiry_date?: string;
    }>;
  };
}

export interface WalletState {
  verificationId: string | null;
  authorizationUrl: string | null;
  status: 'idle' | 'pending' | 'available' | 'failed';
  portrait: string | null;
  claims: VerificationResultResponse['claims'] | null;
}

// URL helper functions
export const getWalletVerificationStartUrl = () => `${appPath}/api/wallet/verify/start`;

export const getWalletVerificationStatusUrl = (verificationId: string) =>
  `${appPath}/api/wallet/verify/status/${verificationId}`;

export const getWalletVerificationResultUrl = (verificationId: string) =>
  `${appPath}/api/wallet/verify/result/${verificationId}`;

type Keys = RequestedDocument['type'];

// Generate validRequests from options.json
const validRequests = Object.entries(credentialOptions.credential_configurations_supported).reduce(
  (acc, [credentialId, config]) => {
    // Use the first Norwegian locale display name and slugify it
    const displayName = config.display.find((d) => d.locale === 'no')?.name || credentialId;
    const key = slugify(displayName, { lower: true, strict: true, locale: 'nb' });

    // Determine type and value based on format
    let type: 'vct' | 'doctype';
    let value: string;

    if ('doctype' in config) {
      type = 'doctype';
      value = config.doctype;
    } else if ('vct' in config) {
      type = 'vct';
      value = config.vct;
    } else {
      // Fallback - shouldn't happen with valid data
      throw new Error(`Unknown credential format for ${credentialId}`);
    }

    acc[key] = {
      name: displayName,
      type,
      value,
    };

    return acc;
  },
  {} as Record<Keys, { type: 'vct' | 'doctype'; value: string; name: string }>,
);

// Helper function to get document display name
export const getDocumentDisplayName = (docType: Keys): string =>
  validRequests[docType]?.name || `Not in known types: ${credentialTypes.join(', ')}`;

// Helper function to get claims for a document type
export const getDocumentClaims = (docType: Keys): Array<{ name: string; mandatory: boolean }> => {
  const credentialId = Object.entries(credentialOptions.credential_configurations_supported).find(([_, config]) => {
    const displayName = config.display.find((d) => d.locale === 'no')?.name || '';
    const key = slugify(displayName, { lower: true, strict: true, locale: 'nb' });
    return key === docType;
  });

  if (!credentialId) {
    return [];
  }

  const [, config] = credentialId;
  return (
    config.claims?.map((claim) => ({
      name: claim.display.find((d) => d.locale === 'no')?.name || claim.path[claim.path.length - 1],
      mandatory: claim.mandatory,
    })) || []
  );
};

// API functions
export const startWalletVerification = async (request: Keys): Promise<VerificationStartResponse> => {
  const url = getWalletVerificationStartUrl();

  const requestBody = {
    credential_issuer: credentialOptions.credential_issuer,
    vct: validRequests[request].type === 'vct' ? validRequests[request].value : undefined,
    doctype: validRequests[request].type === 'doctype' ? validRequests[request].value : undefined,
  };

  const response = await httpPost<VerificationStartResponse>(url, {}, requestBody);
  return response.data;
};

export const fetchWalletStatus = async (verificationId: string): Promise<VerificationStatusResponse> => {
  const url = getWalletVerificationStatusUrl(verificationId);
  const response = await httpGet<VerificationStatusResponse>(url);
  if (!response) {
    throw new Error('Failed to fetch wallet status');
  }
  return response;
};

export const fetchWalletResult = async (verificationId: string): Promise<VerificationResultResponse> => {
  const url = getWalletVerificationResultUrl(verificationId);
  const response = await httpGet<VerificationResultResponse>(url);
  if (!response) {
    throw new Error('Failed to fetch wallet result');
  }
  return response;
};

// Query key factory
export const walletQueries = {
  all: () => ['wallet'] as const,

  statusKey: (verificationId: string | null) => [...walletQueries.all(), 'status', verificationId] as const,

  status: (verificationId: string | null) =>
    queryOptions({
      queryKey: walletQueries.statusKey(verificationId),
      queryFn: verificationId ? () => fetchWalletStatus(verificationId) : skipToken,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        // Stop polling when status is AVAILABLE or FAILED
        if (status === 'AVAILABLE' || status === 'FAILED') {
          return false;
        }
        // Poll every 5 seconds while PENDING
        return 5000;
      },
      retry: false, // Don't retry failed requests while polling
    }),
} as const;
