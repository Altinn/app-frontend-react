import * as React from 'react';
import { render } from '@testing-library/react';

import { MessageComponent, MessageType } from './MessageComponent';

describe('MessageComponent', () => {
  const mockId = 'mockId';
  let mockMessageType: MessageType;
  let mockMessages: string[];

  beforeEach(() => {
    mockMessageType = 'message';
    mockMessages = ['this is a message'];
  });
  it('should match snapshot', () => {
    const { container } = render(
      <MessageComponent
        messageType={mockMessageType}
        style={{ display: 'block', width: 'fit-content' }}
        key={'messageType'}
        id={mockId}
      >
        <ol>
          {mockMessages.map((message: string, idx: number) => {
            return <li key={idx}>{message}</li>;
          })}
        </ol>
      </MessageComponent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  it('should have class a-message-info when into type', () => {
    mockMessageType = 'info';
    const { container } = render(
      <MessageComponent
        messageType={mockMessageType}
        style={{ display: 'block', width: 'fit-content' }}
        key={'messageType'}
        id={mockId}
      >
        <ol>
          {mockMessages.map((message: string, idx: number) => {
            return <li key={idx}>{message}</li>;
          })}
        </ol>
      </MessageComponent>,
    );
    expect(
      container.querySelector('#mockId.a-message-info'),
    ).toBeInTheDocument();
  });
  it('should have class a-message-error when error type', () => {
    mockMessageType = 'error';
    const { container } = render(
      <MessageComponent
        messageType={mockMessageType}
        style={{ display: 'block', width: 'fit-content' }}
        key={'messageType'}
        id={mockId}
      >
        <ol>
          {mockMessages.map((message: string, idx: number) => {
            return <li key={idx}>{message}</li>;
          })}
        </ol>
      </MessageComponent>,
    );
    expect(
      container.querySelector('#mockId.a-message-error'),
    ).toBeInTheDocument();
  });
  it('should have class a-message-success when success type', () => {
    mockMessageType = 'success';
    const { container } = render(
      <MessageComponent
        messageType={mockMessageType}
        style={{ display: 'block', width: 'fit-content' }}
        key={'messageType'}
        id={mockId}
      >
        <ol>
          {mockMessages.map((message: string, idx: number) => {
            return <li key={idx}>{message}</li>;
          })}
        </ol>
      </MessageComponent>,
    );
    expect(
      container.querySelector('#mockId.a-message-success'),
    ).toBeInTheDocument();
  });
});
