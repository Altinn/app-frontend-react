import { subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type {
  ApplicationMetadata,
  ComponentConfig,
  ComponentConfigs,
  DataType,
  FrontEndSettings,
} from '../../types';

export interface ApplicationStore {
  // Application metadata
  applicationMetadata: ApplicationMetadata | undefined;

  // Frontend settings
  frontEndSettings: FrontEndSettings;

  // Component configurations
  componentConfigs: ComponentConfigs;

  // Methods
  setApplicationMetadata: (metadata: ApplicationMetadata) => void;
  setFrontEndSettings: (settings: FrontEndSettings) => void;
  setComponentConfigs: (configs: ComponentConfigs) => void;
  getDataType: (dataTypeId: string) => DataType | undefined;
  getComponentConfig: (componentType: string) => ComponentConfig | undefined;
  getAllDataTypes: () => DataType[];
  getOrganization: () => string;
  getApplicationId: () => string;
  getApplicationTitle: (language?: string) => string;
  hasFeature: (featureName: string) => boolean;
  reset: () => void;
}

const initialState = {
  applicationMetadata: undefined,
  frontEndSettings: {},
  componentConfigs: {},
};

export const createApplicationStore = () =>
  createStore<ApplicationStore>()(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setApplicationMetadata: (metadata) => set({ applicationMetadata: metadata }),

      setFrontEndSettings: (settings) => set({ frontEndSettings: settings }),

      setComponentConfigs: (configs) => set({ componentConfigs: configs }),

      getDataType: (dataTypeId) => {
        const metadata = get().applicationMetadata;
        if (!metadata) return undefined;
        return metadata.dataTypes.find((dt) => dt.id === dataTypeId);
      },

      getComponentConfig: (componentType) => {
        const configs = get().componentConfigs;
        return configs[componentType];
      },

      getAllDataTypes: () => {
        const metadata = get().applicationMetadata;
        return metadata?.dataTypes || [];
      },

      getOrganization: () => {
        const metadata = get().applicationMetadata;
        return metadata?.org || '';
      },

      getApplicationId: () => {
        const metadata = get().applicationMetadata;
        return metadata?.id || '';
      },

      getApplicationTitle: (language = 'nb') => {
        const metadata = get().applicationMetadata;
        if (!metadata?.title) return '';
        return metadata.title[language] || metadata.title.nb || metadata.title.en || '';
      },

      hasFeature: (featureName) => {
        const metadata = get().applicationMetadata;
        if (!metadata?.features) return false;
        return Boolean(metadata.features[featureName]);
      },

      reset: () => set(initialState),
    })),
  );

export const applicationStore = createApplicationStore();