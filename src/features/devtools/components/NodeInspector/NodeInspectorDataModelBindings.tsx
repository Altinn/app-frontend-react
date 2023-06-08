import React from 'react';

import classes from 'src/features/devtools/components/NodeInspector/NodeInspector.module.css';
import { Value } from 'src/features/devtools/components/NodeInspector/NodeInspectorDataField';
import { FD } from 'src/features/formData2/Compatibility';
import { useBindingSchema } from 'src/hooks/useBindingSchema';
import type { IDataModelBindings } from 'src/layout/layout';

interface Props {
  dataModelBindings: IDataModelBindings;
}

export function NodeInspectorDataModelBindings({ dataModelBindings }: Props) {
  const schema = useBindingSchema(dataModelBindings);
  const results = FD.useBindings(dataModelBindings);

  return (
    <Value
      property={'dataModelBindings'}
      collapsible={true}
      className={classes.typeObject}
    >
      <dl className={classes.propertyList}>
        {Object.keys(dataModelBindings).map((key) => (
          <Value
            key={key}
            property={key}
            className={classes.typeLongString}
          >
            <em>Råverdi: </em>
            {dataModelBindings[key]}
            <br />
            <em>Resultat: </em>
            <div className={classes.json}>{JSON.stringify(results[key], null, 2)}</div>
            <br />
            <em>Datamodell: </em>
            <div className={classes.json}>{JSON.stringify(schema?.[key] || null, null, 2)}</div>
          </Value>
        ))}
      </dl>
    </Value>
  );
}
