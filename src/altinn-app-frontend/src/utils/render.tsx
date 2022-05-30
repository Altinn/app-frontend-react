import * as React from 'react';
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
        'message',
      ),
    );
  }
  return validationMessageElements.length > 0
    ? validationMessageElements
    : null;
}

export function renderValidationMessages(
  messages: (
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>[]
  )[],
  id: string,
  messageType: any,
) {
  return (
    <MessageComponent
      messageType={messageType}
      style={messageComponentStyle}
      key={messageType}
      id={id}
    >
      <ol>
        {
          typeof messages[0] === 'string'
          ? <li key={`validationMessage-${id}-${messages[0]}`}>
              <p role='alert'>{messages[0]}</p>
            </li>
          : <li role='alert' key={`validationMessage-${id}`}>{messages[0]}</li>
        }
      </ol>
    </MessageComponent>
  );
}
