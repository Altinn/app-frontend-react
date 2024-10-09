// ariaAnnouncerStore.ts

type SubscriberCallback = (message: string) => void;

const subscribers: SubscriberCallback[] = [];

export function ariaAnnounce(message: string): void {
  subscribers.forEach((callback) => callback(message));
}

export function subscribeToAriaAnnounce(callback: SubscriberCallback): () => void {
  subscribers.push(callback);
  return () => {
    // Unsubscribe when the component unmounts
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}
