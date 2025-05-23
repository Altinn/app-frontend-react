import type { ILayoutSet } from 'src/layout/common.generated';
import type { ILikertFilter } from 'src/layout/Likert/config.generated';

export const getLikertStartStopIndex = (lastIndex: number, filters: ILikertFilter = []) => {
  if (typeof lastIndex === 'undefined') {
    return { startIndex: 0, stopIndex: -1 };
  }

  const start = filters.find(({ key }) => key === 'start')?.value;
  const stop = filters.find(({ key }) => key === 'stop')?.value;
  const startIndex = typeof start === 'string' ? parseInt(start) : (start ?? 0);
  const providedStopIndex = typeof stop === 'string' ? parseInt(stop) : stop;

  // For some reason, the stop index configuration is 1-based, while the start index is 0-based in the Likert
  // configuration. We'll work around that here, but it should be fixed in Likert2.
  const stopIndex = typeof providedStopIndex === 'number' ? providedStopIndex - 1 : lastIndex;

  const boundedStopIndex = Math.min(stopIndex, lastIndex);

  return { startIndex, stopIndex: boundedStopIndex };
};

/**
 * Some tasks other than data (for instance confirm, or other in the future) can be configured to behave like data steps
 * @param task the task
 * @param layoutSets the layout sets
 */
export function behavesLikeDataTask(task: string | null | undefined, layoutSets: ILayoutSet[] | null): boolean {
  if (!task) {
    return false;
  }

  return !!layoutSets?.some((set) => set.tasks?.includes(task));
}
