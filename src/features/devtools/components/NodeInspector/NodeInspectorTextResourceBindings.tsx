import React from 'react';

import classes from 'src/features/devtools/components/NodeInspector/NodeInspector.module.css';
import { Value } from 'src/features/devtools/components/NodeInspector/NodeInspectorDataField';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import type { ITextResourceBindings } from 'src/types';

interface Props {
  textResourceBindings: ITextResourceBindings;
}

export function NodeInspectorTextResourceBindings({ textResourceBindings }: Props) {
  const textResources = useAppSelector((state) => state.textResources.resources);
  const { langAsString } = useLanguage();

  return (
    <Value
      property={'textResourceBindings'}
      collapsible={true}
      className={classes.typeObject}
    >
      <dl className={classes.propertyList}>
        {Object.keys(textResourceBindings).map((key) => {
          const inResources = textResources.find((resource) => resource.id === textResourceBindings[key]);

          return (
            <Value
              key={key}
              property={key}
              className={classes.typeLongString}
            >
              <em>Råverdi:</em> {textResourceBindings[key]}
              <br />
              <em>Tekstressurs:</em> {inResources ? 'Ja' : 'Nei'}
              <br />
              <em>Resultat:</em> {langAsString(textResourceBindings[key])}
            </Value>
          );
        })}
      </dl>
    </Value>
  );
}
