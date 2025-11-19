import { queryOptions, skipToken } from '@tanstack/react-query';

import { httpGet, httpPost } from 'src/utils/network/networking';
import { appPath } from 'src/utils/urls/appUrlHelper';

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

// API functions
export const startWalletVerification = async (): Promise<VerificationStartResponse> => {
  const url = getWalletVerificationStartUrl();

  const requestBody = {
    credential_issuer: 'https://utsteder.test.eidas2sandkasse.net',
    // credential_configuration_id: 'org.iso.18013.5.1.mDL_mso_mdoc', // Førerkort
    credential_configuration_id: 'no.digdir.eudiw.pid_mso_mdoc', // Norsk identitetsnummer
    // credential_configuration_id: 'no.minid.mpid_sd_jwt_vc', // Did not work (MinID PID)
    // vct: 'urn:eudi:pid:1',
    // doctype: 'eu.europa.ec.eudi.pid.1',
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
