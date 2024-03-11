import React from 'react';

import { Description } from 'src/components/form/Description';
import { Label } from 'src/components/form/Label';
import { Legend } from 'src/components/form/Legend';
import { Lang } from 'src/features/language/Lang';
import { useFormComponentCtxStrict } from 'src/layout/FormComponentContext';
import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { ITextResourceBindings } from 'src/layout/layout';

export function GenericComponentLabel() {
  const { overrideDisplay, id, node } = useFormComponentCtxStrict();
  const item = useNodeItem(node);
  if (overrideDisplay?.renderLabel === false) {
    return null;
  }

  const trb = (item.textResourceBindings || {}) as Exclude<ITextResourceBindings, undefined>;
  const titleTrb = 'title' in trb ? trb.title : undefined;
  const helpTrb = 'help' in trb ? trb.help : undefined;

  return (
    <Label
      key={`label-${id}`}
      label={<Lang id={titleTrb} />}
      helpText={helpTrb && <Lang id={helpTrb} />}
      id={id}
      readOnly={'readOnly' in item ? item.readOnly : false}
      required={'required' in item ? item.required : false}
      labelSettings={'labelSettings' in item ? item.labelSettings : undefined}
    />
  );
}

export function GenericComponentDescription() {
  const { id, node } = useFormComponentCtxStrict();
  const item = useNodeItem(node);
  const trb = (item.textResourceBindings || {}) as Exclude<ITextResourceBindings, undefined>;
  const descriptionTrb = 'description' in trb ? trb.description : undefined;

  if (!descriptionTrb) {
    return null;
  }

  return (
    <Description
      key={`description-${id}`}
      description={<Lang id={descriptionTrb} />}
      id={id}
    />
  );
}

export function GenericComponentLegend() {
  const { overrideDisplay, id, node } = useFormComponentCtxStrict();
  const item = useNodeItem(node);
  if (overrideDisplay?.renderLegend === false) {
    return null;
  }

  const trb = (item.textResourceBindings || {}) as Exclude<ITextResourceBindings, undefined>;
  const titleTrb = 'title' in trb ? trb.title : undefined;
  const helpTrb = 'help' in trb ? trb.help : undefined;
  const descriptionTrb = 'description' in trb ? trb.description : undefined;

  return (
    <Legend
      key={`legend-${id}`}
      label={<Lang id={titleTrb} />}
      description={descriptionTrb && <Lang id={descriptionTrb} />}
      helpText={helpTrb && <Lang id={helpTrb} />}
      id={id}
      required={'required' in item ? item.required : false}
      labelSettings={'labelSettings' in item ? item.labelSettings : undefined}
      layout={('layout' in item && item.layout) || undefined}
    />
  );
}
