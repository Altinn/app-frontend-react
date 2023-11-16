import { createStrictContext } from 'src/core/contexts/context';

export interface FileTableRowContext {
  index: number;
  editIndex: number;
  setEditIndex: (index: number) => void;
}

const { Provider, useCtx } = createStrictContext<FileTableRowContext>({ name: 'FileTableRowContext' });

export const FileTableRowProvider = Provider;
export const useFileTableRow = () => useCtx();
