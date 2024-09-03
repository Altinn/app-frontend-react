import type { ILayoutSet, ILayoutSetDefault, ILayoutSetSubForm } from 'src/layout/common.generated';

export function layoutSetIsSubForm(layoutSet: ILayoutSet): layoutSet is ILayoutSetSubForm {
  return 'type' in layoutSet && layoutSet.type === 'subform';
}
// TODO: normal needs a better name
export function layoutSetIsDefault(layoutSet: ILayoutSet): layoutSet is ILayoutSetDefault {
  return 'tasks' in layoutSet && Array.isArray(layoutSet.tasks) && layoutSet.tasks.length != 0;
}
