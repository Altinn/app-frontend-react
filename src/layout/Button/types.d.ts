import type { ILayoutCompBase } from 'src/layout/layout';
import type { IMapping } from 'src/types';

export type ButtonMode = 'submit' | 'save' | 'go-to-task' | 'instantiate';

type ValidTexts = 'title';
export interface ILayoutCompButton extends ILayoutCompBase<'Button', undefined, ValidTexts> {
  mode?: ButtonMode;

  taskId?: string; // Required for go-to-task

  busyWithId?: string;
  mapping?: IMapping;
}
