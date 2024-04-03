import React from 'react';

import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { CardInternal } from 'src/layout/Card/CardInternal';
import type { PropsFromGenericComponent } from 'src/layout';

type ICardProps = PropsFromGenericComponent<'Card'>;

export const Card = ({ node }: ICardProps) => {
  const { textResourceBindings, image, video, audio, edit } = node.item;
  const { langAsString } = useLanguage();
  const languageKey = useCurrentLanguage();
  const width = image?.width || '100%';
  const altText = textResourceBindings?.altText && langAsString(textResourceBindings.altText);
  const audioSource = isWwwRoot(audio) ? getSourceUrl(audio) : audio?.src || '';
  const videoSource = isWwwRoot(video) ? getSourceUrl(video) : video?.src || '';
  const imageSource = isWwwRoot(image) ? getSourceUrl(image) : image?.src || '';
  const height = edit.minMediaHeight;

  function isWwwRoot(content): boolean {
    return content && content.src[languageKey].startsWith('wwwroot');
  }

  function getSourceUrl(content) {
    return content && content.src[languageKey].replace('wwwroot', `/${window.org}/${window.app}`);
  }

  if (image && imageSource) {
    return (
      <SharedCard node={node}>
        <img
          src={imageSource}
          alt={altText}
          style={{
            width,
            height,
          }}
        />
      </SharedCard>
    );
  }
  if (video && videoSource) {
    return (
      <SharedCard node={node}>
        <video
          controls
          style={{ height }}
        >
          <source src={videoSource}></source>
          <track
            kind='captions'
            src={videoSource}
            label={languageKey}
          />
        </video>
      </SharedCard>
    );
  }
  if (audio && audioSource) {
    return (
      <SharedCard node={node}>
        <audio
          controls
          style={{ height }}
        >
          <source src={audioSource}></source>
          <track
            kind='captions'
            src={audioSource}
            label={languageKey}
          />
        </audio>
      </SharedCard>
    );
  }
};

const SharedCard = ({ children, node }: { children: React.ReactNode; node: ICardProps['node'] }) => {
  const { langAsString } = useLanguage();
  const { color, textResourceBindings, edit } = node.item;

  const title = textResourceBindings?.title && langAsString(textResourceBindings.title);
  const body = textResourceBindings?.body && langAsString(textResourceBindings.body);
  const footer = textResourceBindings?.footer && langAsString(textResourceBindings.footer);

  return (
    <CardInternal
      title={title}
      body={body}
      footer={footer}
      color={color}
      position={edit.position}
    >
      {children}
    </CardInternal>
  );
};
