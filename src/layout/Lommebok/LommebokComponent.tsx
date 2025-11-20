import React from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { Description } from 'src/components/form/Description';
import { Lang } from 'src/features/language/Lang';
import { DocumentRequestItem } from 'src/layout/Lommebok/DocumentRequestItem';
import { IssueDocumentItem } from 'src/layout/Lommebok/IssueDocumentItem';
import classes from 'src/layout/Lommebok/LommebokComponent.module.css';
import { useIndexedId } from 'src/utils/layout/DataModelLocation';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function LommebokComponent(props: PropsFromGenericComponent<'Lommebok'>) {
  const { request, issue, textResourceBindings } = useItemWhenType(props.baseComponentId, 'Lommebok');
  const { title, description } = textResourceBindings || {};
  const indexedId = useIndexedId(props.baseComponentId);

  return (
    <div className={classes.container}>
      <Heading
        level={2}
        data-size='sm'
      >
        <Lang id={title} />
      </Heading>
      {description && (
        <Description
          description={<Lang id={description} />}
          componentId={indexedId}
        />
      )}

      {request?.map((doc) => (
        <DocumentRequestItem
          key={doc.type}
          doc={doc}
        />
      ))}

      {issue?.map((doc) => (
        <IssueDocumentItem
          key={doc.type}
          doc={doc}
        />
      ))}
    </div>
  );
}
