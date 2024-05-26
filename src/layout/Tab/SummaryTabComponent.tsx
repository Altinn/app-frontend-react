import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { useLanguage } from 'src/features/language/useLanguage';
import { GenericComponent } from 'src/layout/GenericComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type SummaryTabComponentProps = {
  targetNode: LayoutNode<'Tab'>;
};

export const SummaryTabComponent = ({ targetNode }: SummaryTabComponentProps) => {
  const { langAsString } = useLanguage();

  const title = langAsString(targetNode.item.textResourceBindings?.['title']);

  return (
    <div>
      <div>
        <Heading>{title}</Heading>
      </div>
      <div>
        {targetNode.item.childComponents.map((n) => (
          // TODO: Add support for summary components like SummaryGroupComponent
          <GenericComponent
            key={n.item.id}
            node={n}
          />
        ))}
      </div>
    </div>
  );
};
