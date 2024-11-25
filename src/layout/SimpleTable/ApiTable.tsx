import React from 'react';

import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { PropsFromGenericComponent } from 'src/layout';

export function SimpleTableComponent({ node }: PropsFromGenericComponent<'SimpleTable'>) {
  const item = useNodeItem(node);

  console.log('item', item);

  return <div>API table</div>;
}
