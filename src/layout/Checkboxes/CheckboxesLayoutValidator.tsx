import { useEffect } from 'react';

import { useLanguage } from 'src/features/language/useLanguage';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { NodeValidationProps } from 'src/layout/layout';

export function CheckboxesLayoutValidator(props: NodeValidationProps<'Checkboxes'>) {
  const { node, externalItem } = props;
  const { langAsString } = useLanguage();
  const group = externalItem.dataModelBindings.group;
  const deletionStrategy = externalItem.deletionStrategy;
  const isDeleted = externalItem.dataModelBindings.isDeleted;

  const addError = NodesInternal.useAddError();

  useEffect(() => {
    let error: string | null = null;

    if (!group) {
      if (!!deletionStrategy || !!isDeleted) {
        error = langAsString('config_error.deletion_strategy_no_save_to_list');
      }
    } else if (group) {
      if (!deletionStrategy) {
        error = langAsString('config_error.save_to_list_no_deletion_strategy');
      }
      if (deletionStrategy === 'soft' && !isDeleted) {
        error = langAsString('config_error.soft_delete_no_is_deleted');
      }
      if (deletionStrategy === 'hard' && !!isDeleted) {
        error = langAsString('config_error.hard_delete_with_is_deleted');
      }
    }

    if (error) {
      addError(error, node);
      window.logErrorOnce(`Validation error for '${node.id}': ${error}`);
    }
  }, [addError, node, deletionStrategy, isDeleted, langAsString, group]);

  return null;
}
