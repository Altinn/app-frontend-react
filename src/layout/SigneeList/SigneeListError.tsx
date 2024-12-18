import React from 'react';

import { isAxiosError } from 'axios';
import { ZodError } from 'zod';

import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { problemDetailsSchema } from 'src/layout/SigneeList/SigneeListComponent';

export function SigneeListError({ error }: { error: Error }) {
  const { langAsString } = useLanguage();

  if (error instanceof ZodError) {
    //   // TODO: alarm? telemetri?
    window.logErrorOnce(
      `Did not get the expected response from the server. The response didn't match the expected schema: \n${error}`,
    );

    return (
      <div>
        <Lang id='signee_list.parse_error' />
        <br />
        <Lang
          id='general.customer_service_error_message'
          params={[
            'general.customer_service_phone_number',
            'general.customer_service_email',
            'general.customer_service_slack',
          ].map((it, idx) => (
            <Lang
              key={idx}
              id={it?.toString()}
            />
          ))}
        />
      </div>
    );
  }

  if (isAxiosError(error)) {
    const parsed = problemDetailsSchema.safeParse(error.response?.data);

    if (parsed.success) {
      window.logErrorOnce(langAsString(error.message));
      return <Lang id='signee_list.api_error_display' />;
    }
  }

  return <Lang id='signee_list.unknown_api_error' />;
}
