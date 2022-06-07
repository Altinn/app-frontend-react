import * as React from 'react';
import { MessageComponent } from '../components/message/MessageComponent';

const messageComponentStyle = {
  display: 'block',
  width: 'fit-content',
};

export function renderValidationMessagesForComponent(
  validationMessages: any,
  id: string,
  showAllValidationMessages: boolean
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
        showAllValidationMessages
      ),
    );
  }

  if (validationMessages.warnings && validationMessages.warnings.length > 0) {
    validationMessageElements.push(
      renderValidationMessages(
        validationMessages.warnings,
        `message_${id}`,
        'message',
        showAllValidationMessages
      ),
    );
  }
  return validationMessageElements.length > 0
    ? validationMessageElements
    : null;
}

function singleValidationMessage(message: any, id: string) {
  if (typeof message === 'string') {
  return (
    <li key={`validationMessage-${id}-${message}`}>
      <p role='alert'>{message}</p>
    </li>
  );
  }
  return <li role='alert' key={`validationMessage-${id}`}>{message}</li>;
}

export function renderValidationMessages(
  messages: (
    | string
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>[]
  )[],
  id: string,
  messageType: any,
  showAllValidationMessages: boolean
) {
  return (
    <MessageComponent
      messageType={messageType}
      style={messageComponentStyle}
      key={messageType}
      id={id}
    >{
      showAllValidationMessages
      ? <ol>
          {messages.map((message: any, idx: number) => {
              if (typeof message === 'string') {
                return (
                  <li key={`validationMessage-${id}-${message}`}>
                    <p role='alert'>{message}</p>
                  </li>
                );
              }
              return <li role='alert' key={`validationMessage-${id}-${idx}`}>{message}</li>;
            })}
        </ol>
      : <ol>
          {
            singleValidationMessage(messages[0], id)
          }
        </ol>
    }
    </MessageComponent>
  );
}
