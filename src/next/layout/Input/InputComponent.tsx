import React from 'react';

import { FD } from 'src/features/formData/FormDataWrite';
import { useDataModelBindings } from 'src/features/formData/useDataModelBindings';
import { useCleanDataModelBindings, useResolvedTexts } from 'src/next/layout/GenericComponent';
import type { ComponentProps, ResolvedTexts } from 'src/next/layout/GenericComponent';

export function RenderInputComponent({ component, indices }: ComponentProps<'Input'>) {
  const textResources = useResolvedTexts<'Input'>(component.textResourceBindings, indices);
  const dataModelBindings = useCleanDataModelBindings<'Input'>(component.dataModelBindings, indices);

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
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid pink' }}>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>textResources: {JSON.stringify(textResources, null, 2)}</pre>
      Title: {textResources?.title}{' '}
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
