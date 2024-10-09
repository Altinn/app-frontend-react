// AriaAnnouncer.tsx

import React, { useEffect, useState } from 'react';

import { subscribeToAriaAnnounce } from 'src/components/aria-announce/ariaAnnouncerStore';

export function AriaAnnouncer() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeToAriaAnnounce((msg: string) => {
      setMessage('');
      // Clear the message first to ensure the screen reader picks up new messages
      setTimeout(() => {
        setMessage(msg);
      }, 100);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div
      aria-live='assertive'
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );
}
