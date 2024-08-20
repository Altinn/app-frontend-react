import React from 'react';

import { Paragraph } from '@digdir/designsystemet-react';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { ComponentStructureWrapper } from 'src/layout/ComponentStructureWrapper';
import classes from 'src/layout/Paragraph/ParagraphComponent.module.css';
import type { PropsFromGenericComponent } from 'src/layout';

export type IParagraphProps = PropsFromGenericComponent<'Paragraph'>;

export function ParagraphComponent({ node }: IParagraphProps) {
  const { id, textResourceBindings } = node.item;
  const { lang, elementAsString } = useLanguage();
  const text = lang(textResourceBindings?.title);

  // The lang() function returns an object with a type property set to 'span'
  // if text contains inline-element(s) or just a string.
  const hasInlineContent = text && typeof text === 'object' && 'type' in text && text.type === 'span';

  return (
    <ComponentStructureWrapper node={node}>
      <div className={classes.paragraphWrapper}>
        <div
          id={id}
          data-testid={`paragraph-component-${id}`}
        >
          <Paragraph asChild={!hasInlineContent}>
            {!hasInlineContent ? (
              <div>
                <Lang id={textResourceBindings?.title} />
              </div>
            ) : (
              <Lang id={textResourceBindings?.title} />
            )}
          </Paragraph>
        </div>
        {textResourceBindings?.help && (
          <HelpTextContainer
            helpText={<Lang id={textResourceBindings?.help} />}
            title={elementAsString(text)}
          />
        )}
      </div>
    </ComponentStructureWrapper>
  );
}
