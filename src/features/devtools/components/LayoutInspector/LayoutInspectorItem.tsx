/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import classes from 'src/features/devtools/components/LayoutInspector/LayoutInspector.module.css';
import { useComponentHighlighter } from 'src/features/devtools/hooks/useComponentHighlighter';
import type { ExprUnresolved } from 'src/features/expressions/types';
import type { ILayoutComponentOrGroup } from 'src/layout/layout';

interface ILayoutInspectorItemProps {
  component: ExprUnresolved<ILayoutComponentOrGroup>;
  onClick: () => void;
}

export const LayoutInspectorItem = ({ component, onClick }: ILayoutInspectorItemProps) => {
  const { onMouseEnter, onMouseLeave } = useComponentHighlighter(component.id);

  return (
    <li
      className={classes.item}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <span className={classes.componentType}>{component.type}</span>
      <span className={classes.componentId}>id: &quot;{component.id}&quot;</span>
    </li>
  );
};
