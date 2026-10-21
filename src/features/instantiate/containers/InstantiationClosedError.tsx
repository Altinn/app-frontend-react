import React from 'react';

import { InstantiationErrorPage } from 'src/features/instantiate/containers/InstantiationErrorPage';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';

export function InstantiationClosedError() {
  const { langAsString } = useLanguage();

  return (
    <InstantiationErrorPage
      title={<Lang id='instantiate.closed_error_title' />}
      content={<Lang id='instantiate.closed_error_text' />}
      showContactInfo={true}
      statusCode={`${langAsString('party_selection.error_caption_prefix')} 410`}
    />
  );
}
