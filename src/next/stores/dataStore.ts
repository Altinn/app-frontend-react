import { createStore } from 'zustand/index';

import { exampleLayoutCollection } from 'src/next/types/LayoutsDto';
import { layoutSetsSchemaExample } from 'src/next/types/LayoutSetsDTO';
import { exampleLayoutSettings } from 'src/next/types/PageOrderDTO';
import { exampleProcess } from 'src/next/types/ProcessDTO';
import type { ILayoutCollection } from 'src/layout/layout';
import type { LayoutSetsSchema } from 'src/next/types/LayoutSetsDTO';
import type { PageOrderDTO } from 'src/next/types/PageOrderDTO';
import type { ProcessSchema } from 'src/next/types/ProcessDTO';

interface DataStore {
  layoutSetsConfig: LayoutSetsSchema;
  process: ProcessSchema;
  pageOrder: PageOrderDTO;
  layouts: ILayoutCollection;
  setLayoutSets: (schema: LayoutSetsSchema) => void;
  setProcess: (proc: ProcessSchema) => void;
  setPageOrder: (order: PageOrderDTO) => void;
  setLayouts: (layouts: ILayoutCollection) => void;
}

export const dataStore = createStore<DataStore>((set) => ({
  layoutSetsConfig: layoutSetsSchemaExample,
  process: exampleProcess,
  layouts: exampleLayoutCollection,
  pageOrder: exampleLayoutSettings,

  // setter methods
  setLayoutSets: (schema) => set({ layoutSetsConfig: schema }),
  setProcess: (proc) => set({ process: proc }),
  setPageOrder: (order) => set({ pageOrder: order }),
  setLayouts: (layouts) => set({ layouts }),
}));
