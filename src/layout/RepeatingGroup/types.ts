import type { ExprResolved } from 'src/features/expressions/types';
import type { GridRowsInternal } from 'src/layout/Grid/types';
import type { RepeatingGroupDef } from 'src/layout/RepeatingGroup/config.def.generated';

type Comp = ReturnType<RepeatingGroupDef['evalDefaultExpressions']>;
type RepGroupTrb = Exclude<Comp['textResourceBindings'], undefined>;
type RepGroupEdit = Exclude<Comp['edit'], undefined>;

// These types define the properties in a repeating group config that will have their expressions resolved
// per row instead of for the entire repeating group component at once.
type PerRowTrb = 'save_and_next_button' | 'save_button' | 'edit_button_close' | 'edit_button_open';
type PerRowEdit = 'deleteButton' | 'saveButton' | 'editButton' | 'alertOnDelete' | 'saveAndNextButton';
export type GroupExpressions = ExprResolved<{
  textResourceBindings?: Pick<RepGroupTrb, PerRowTrb>;
  edit?: Pick<RepGroupEdit, PerRowEdit>;
}>;

// This then, by its definition, is the opposite of the above types. It's the properties that are resolved for the
// entire repeating group component at once, including the 'rows' property.
type RepGroupBase = ExprResolved<
  Omit<
    Comp,
    | 'hiddenRow'
    | 'textResourceBindings'
    | 'edit'
    | 'rows'
    | 'rowsAfter'
    | 'rowsBefore'
    | 'rowsAfterInternal'
    | 'rowsBeforeInternal'
  >
>;
export type RepGroupInternal = RepGroupBase & {
  textResourceBindings?: Omit<RepGroupTrb, PerRowTrb>;
  edit?: Omit<RepGroupEdit, PerRowEdit>;
  rowsBefore: undefined;
  rowsAfter: undefined;
  rowsBeforeInternal?: GridRowsInternal;
  rowsAfterInternal?: GridRowsInternal;
};
