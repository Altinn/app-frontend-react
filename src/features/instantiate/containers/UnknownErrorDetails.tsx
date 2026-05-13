import React, { useState } from 'react';

import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';

import { AccordionItem } from 'src/app-components/Accordion/AccordionItem';
import { Button } from 'src/app-components/Button/Button';
import { Flex } from 'src/app-components/Flex/Flex';
import classes from 'src/features/instantiate/containers/UnknownErrorDetails.module.css';

interface UnknownErrorDetailsProps {
  error: Error | AxiosError;
  className?: string;
}

export function UnknownErrorDetails({ error }: UnknownErrorDetailsProps) {
  const [now] = useState(new Date());
  const [axiosError] = useState(() => {
    if (isAxiosError(error)) {
      return {
        responseStatus: error.response?.status,
        responseData: error.response?.data,
      };
    }
    return null;
  });
  const [location] = useState(window?.location.href);

  function handleCopyErrorClicked() {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      location,
      time: now.toISOString(),
      ...axiosError,
    };
    navigator.clipboard?.writeText(JSON.stringify(errorInfo, null, 2));
  }

  return (
    <AccordionItem
      title='Vis detaljer om feilen'
      className={classes.errorSummary}
    >
      <Flex>
        <Flex
          container
          justifyContent='space-between'
          alignItems='center'
          direction='row'
          className={classes.errorTitle}
        >
          <DetailItem
            name={error.name}
            value={error.message}
          />
          <Button
            variant='secondary'
            onClick={handleCopyErrorClicked}
          >
            Kopier
          </Button>
        </Flex>

        <DetailItem
          name='Location'
          value={location}
        />

        <DetailItem
          name='Time'
          value={now.toISOString()}
        />

        {axiosError && (
          <DetailItem
            name='Response status'
            value={axiosError.responseStatus ? axiosError.responseStatus.toString() : ''}
          />
        )}
        {error.stack && (
          <DetailItem
            name='Stacktrace'
            value={error.stack}
          />
        )}
      </Flex>
    </AccordionItem>
  );
}

function DetailItem({ name, value }: { name: string; value: string }) {
  return (
    <div className={classes.errorItem}>
      <div>
        <strong>{name}:</strong>
      </div>
      <div>{value}</div>
    </div>
  );
}
