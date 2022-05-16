import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import * as React from 'react';
import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';
import { MessageComponent } from '../components/message/MessageComponent';

const messageComponentStyle = {
  display: 'block',
  width: 'fit-content',
};

export function renderValidationMessagesForComponent(
  validationMessages: any,
  id: string,
): JSX.Element[] {
  if (!validationMessages) {
    return null;
  }
  const validationMessageElements: JSX.Element[] = [];
  if (validationMessages.errors && validationMessages.errors.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.errors,
        `error_${id}`,
        'error',
      ),
    );
  }

  if (validationMessages.warnings && validationMessages.warnings.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.warnings,
        `message_${id}`,
        'warning',
      ),
    );
  }

  if (validationMessages.info && validationMessages.info.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(validationMessages.info, `info_${id}`, 'info'),
    );
  }

  if (validationMessages.success && validationMessages.success.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.success,
        `success_${id}`,
        'success',
      ),
    );
  }

  return validationMessageElements.length > 0
    ? validationMessageElements
    : null;
}

const getPanelVariant = ({ messageType }) => {
  switch (messageType) {
    case 'warning':
      return PanelVariant.Warning;
    case 'info':
      return PanelVariant.Info;
    case 'success':
      return PanelVariant.Success;
  }
  return undefined;
};

export function renderValidationMessages(
  messages: React.ReactNode[],
  id: string,
  messageType: any,
) {

  if (messageType !== 'error') {
    return (
      <FullWidthWrapper>
        <Panel
          variant={getPanelVariant({ messageType })}
          showPointer
          showIcon
          title={'Nyttig å vite'}
        >
          <ol>
            {messages.map((message: React.ReactNode, idx: number) => {
              if (typeof message === 'string') {
                return (
                  <li key={`validationMessage-${id}-${message}`}>
                    <p role='alert'>{message}</p>
                  </li>
                );
              }
              return (
                <li role='alert' key={`validationMessage-${id}-${idx}`}>
                  {message}
                </li>
              );
            })}
          </ol>
        </Panel>
      </FullWidthWrapper>
    );
  }

  return (
    <MessageComponent
      messageType='error'
      style={messageComponentStyle}
      key='error'
      id={id}
    >
      <ol>
        {messages.map((message: React.ReactNode, idx: number) => {
          if (typeof message === 'string') {
            return (
              <li key={`validationMessage-${id}-${message}`}>
                <p role='alert'>{message}</p>
              </li>
            );
          }
          return (
            <li role='alert' key={`validationMessage-${id}-${idx}`}>
              {message}
            </li>
          );
        })}
      </ol>
    </MessageComponent>
  );
}
