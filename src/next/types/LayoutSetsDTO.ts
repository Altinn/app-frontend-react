export interface LayoutSet {
  id: string;
  dataType: string;
  tasks: string[];
}

export interface LayoutSetsSchema {
  $schema: string;
  sets: LayoutSet[];
  uiSettings: Record<string, unknown>;
}

export const layoutSetsSchemaExample: LayoutSetsSchema = {
  $schema: 'https://altinncdn.no/toolkits/altinn-app-frontend/4/schemas/json/layout/layout-sets.schema.v1.json',
  sets: [
    {
      id: 'ComponentLayouts',
      dataType: 'model',
      tasks: ['Task_1'],
    },
    {
      id: 'PreviousProcessSummary',
      dataType: 'model2',
      tasks: ['PreviousProcessSummary'],
    },
  ],
  uiSettings: {},
};
