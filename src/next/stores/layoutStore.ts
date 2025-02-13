import { createStore } from 'zustand/index';

import { exampleLayoutCollection } from 'src/next/types/LayoutsDto';
import { layoutSetsSchemaExample } from 'src/next/types/LayoutSetsDTO';
import { exampleLayoutSettings } from 'src/next/types/PageOrderDTO';
import { exampleProcess } from 'src/next/types/ProcessDTO';
import type { ILayoutCollection } from 'src/layout/layout';
import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
import type { ProcessSchema } from 'src/next/types/ProcessDTO';

// export type ILayoutCollection = { [pageName: string]: ILayoutFile };

interface Layouts {
  layoutSetsSchema: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;
  layouts: ILayoutCollection;
}

export const layoutStore = createStore<Layouts>((set) => ({
  layoutSetsSchema: layoutSetsSchemaExample,
  process: exampleProcess,
  layouts: exampleLayoutCollection,
  pageOrder: exampleLayoutSettings,
}));
