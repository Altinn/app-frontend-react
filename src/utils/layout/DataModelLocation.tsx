import { createContext } from 'src/core/contexts/context';
import type { IDataModelReference } from 'src/layout/common.generated';

const { Provider, useCtx } = createContext<IDataModelReference | undefined>({
  name: 'DataModelLocation',
  default: undefined,
  required: false,
});

export const DataModelLocationProvider = Provider;
export const useCurrentDataModelLocation = useCtx;
