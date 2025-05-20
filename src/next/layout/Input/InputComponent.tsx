import React from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useResolvedTexts } from 'src/next/layout/GenericComponent';
import type { ComponentProps, ResolvedTexts } from 'src/next/layout/GenericComponent';

export function RenderInputComponent({
  component,
  cleanedDataModelBindings: dataModelBindings,
}: ComponentProps<'Input'>) {
  const textResources = useResolvedTexts<'Input'>(component.textResourceBindings);

  const {
    formData: { simpleBinding: realFormValue },
    setValue: _,
  } = useDataModelBindings(dataModelBindings, 400);

  const setLeafValue = FD.useSetLeafValue();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    dataModelBindings?.simpleBinding &&
      setLeafValue({
        reference: dataModelBindings.simpleBinding,
        newValue: value,
      });
  }

  return (
    <DumbInputComponent
      data={realFormValue}
      textResources={textResources}
      onChange={handleChange}
    />
  );
}

function DumbInputComponent({
  data,
  textResources,
  onChange,
}: {
  data: string;
  textResources: ResolvedTexts<'Input'>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>textResources: {JSON.stringify(textResources, null, 2)}</pre>
      <input
        type='text'
        value={data}
        onChange={(event) => {
          onChange(event);
        }}
      />
    </div>
  );
}
