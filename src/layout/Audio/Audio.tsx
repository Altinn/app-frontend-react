import React from 'react';

import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useLanguage } from 'src/features/language/useLanguage';
import { useParentCard } from 'src/layout/Cards/CardContext';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export type IAudioProps = PropsFromGenericComponent<'Audio'>;

export function AudioComponent({ node }: IAudioProps) {
  const { langAsString } = useLanguage();
  const { id, audio, textResourceBindings } = useNodeItem(node);
  const languageKey = useCurrentLanguage();
  const altText = textResourceBindings?.altText ? langAsString(textResourceBindings.altText) : undefined;
  const audioSrc = audio?.src?.[languageKey] || '';
  const renderedInCardMedia = useParentCard()?.renderedInMedia;
  const cardMediaHeight = useParentCard()?.minMediaHeight;

  return (
    <ComponentStructureWrapper node={node}>
      <audio
        controls
        id={id}
        style={{
          height: renderedInCardMedia ? cardMediaHeight : undefined,
          letterSpacing: '0.3px',
          width: '100%',
        }}
      >
        <source src={audioSrc} />
        <track
          kind='captions'
          src={audioSrc}
          srcLang={languageKey}
          label={altText}
        />
      </audio>
    </ComponentStructureWrapper>
  );
}
