import { createStrictContext } from 'src/utils/createContext';

export interface FileTableRowContext {
  index: number;
  editIndex: number;
  setEditIndex: (index: number) => void;
}

const { Provider, useCtx } = createStrictContext<FileTableRowContext>();

export const FileTableRowContextProvider = Provider;
export const useFileTableRowContext = () => useCtx();
