import type { ILayoutSet, ILayoutSetDefault, ILayoutSetSubForm } from 'src/layout/common.generated';

export function layoutSetIsSubForm(layoutSet: ILayoutSet): layoutSet is ILayoutSetSubForm {
  return 'type' in layoutSet && layoutSet.type === 'subform';
}

export function layoutSetIsDefault(layoutSet: ILayoutSet): layoutSet is ILayoutSetDefault {
  return !layoutSetIsSubForm(layoutSet);
}
