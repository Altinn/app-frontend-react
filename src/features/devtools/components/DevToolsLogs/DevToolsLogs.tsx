import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button, TextField } from '@digdir/design-system-react';
import {
  ExclamationmarkTriangleFillIcon,
  InformationSquareFillIcon,
  TrashIcon,
  XMarkOctagonFillIcon,
} from '@navikt/aksel-icons';

import classes from 'src/features/devtools/components/DevToolsLogs/DevToolsLogs.module.css';
import { DevToolsActions } from 'src/features/devtools/data/devToolsSlice';
import { useAppSelector } from 'src/hooks/useAppSelector';

const colorMap = {
  error: 'red',
  warn: 'darkorange',
  info: 'black',
};

export const DevToolsLogs = () => {
  const logs = useAppSelector((state) => state.devTools.logs);
  const [filter, setFilter] = useState('');
  const [showLevels, setShowLevels] = useState({ error: true, warn: true, info: true });

  const dispatch = useDispatch();
  const clearLogs = () => dispatch(DevToolsActions.logsClear());
  const toggleShow = (level: string) => setShowLevels({ ...showLevels, [level]: !showLevels[level] });

  const filteredLogs = logs.filter((log) => {
    if (!showLevels[log.level]) {
      return false;
    }
    if (filter === '') {
      return true;
    }
    return log.message.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <Button
          onClick={clearLogs}
          color={'secondary'}
          icon={<TrashIcon title='slett alle logger' />}
        />
        <div className={classes.filterField}>
          <TextField
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filtrer logger'
          />
        </div>

        <Button
          onClick={() => toggleShow('error')}
          color={showLevels.error ? 'secondary' : 'inverted'}
          icon={<XMarkOctagonFillIcon title='vis/skjul error' />}
        />
        <Button
          onClick={() => toggleShow('warn')}
          color={showLevels.warn ? 'secondary' : 'inverted'}
          icon={<ExclamationmarkTriangleFillIcon title='vis/skjul advarsler' />}
        />
        <Button
          onClick={() => toggleShow('info')}
          color={showLevels.info ? 'secondary' : 'inverted'}
          icon={<InformationSquareFillIcon title='vis/skjul informasjon' />}
        />
      </div>
      <div className={classes.logContainer}>
        {filteredLogs.map((log) => (
          <div key={log.index}>
            <span>{log.index + 1}.</span>
            <span style={{ color: colorMap[log.level] }}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
