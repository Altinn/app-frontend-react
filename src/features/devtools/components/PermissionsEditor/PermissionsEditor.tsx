import React from 'react';
import { useDispatch } from 'react-redux';

import { Checkbox } from '@digdir/design-system-react';

import classes from 'src/features/devtools/components/PermissionsEditor/PermissionsEditor.module.css';
import { useProcessData, useTaskTypeFromBackend } from 'src/features/instance/useProcess';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';

export const PermissionsEditor = () => {
  const { read: _read, write, actions, elementId: _taskId } = useProcessData()?.currentTask || {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const _taskType = useTaskTypeFromBackend();
  const dispatch = useDispatch();

  function handleChange(_mutator: (obj: any) => void) {
    // function handleChange(mutator: (obj: IProcessPermissions) => void) {
    // const processState: IGetProcessStateFulfilled = {
    //   taskId,
    //   taskType,
    //   read,
    //   write,
    //   actions: actions ?? {},
    // };
    //
    // mutator(processState);

    // PRIORITY: Fix this
    // dispatch(ProcessActions.getFulfilled(processState));
    dispatch(FormLayoutActions.updateLayouts({}));
  }

  return (
    <Checkbox.Group
      legend='Policy'
      className={classes.checkboxWrapper}
    >
      <Checkbox
        checked={Boolean(write)}
        onChange={(e) => handleChange((obj) => (obj.write = e.target.checked))}
        value='nothing'
      >
        Write
      </Checkbox>
      <Checkbox
        checked={Boolean(actions?.confirm)}
        onChange={(e) => handleChange((obj) => (obj.actions = { ...obj.actions, confirm: e.target.checked }))}
        value='nothing'
      >
        Confirm
      </Checkbox>
      <Checkbox
        checked={Boolean(actions?.sign)}
        onChange={(e) => handleChange((obj) => (obj.actions = { ...obj.actions, sign: e.target.checked }))}
        value='nothing'
      >
        Sign
      </Checkbox>
      <Checkbox
        checked={Boolean(actions?.reject)}
        onChange={(e) => handleChange((obj) => (obj.actions = { ...obj.actions, reject: e.target.checked }))}
        value='nothing'
      >
        Reject
      </Checkbox>
    </Checkbox.Group>
  );
};
