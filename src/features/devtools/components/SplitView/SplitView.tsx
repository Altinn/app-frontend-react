/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { Children, useEffect } from 'react';

import classes from 'src/features/devtools/components/SplitView/SplitView.module.css';

interface SplitViewProps {
  direction: 'row' | 'column';
  children: React.ReactNode;
}

export const SplitView = ({ direction, children }: SplitViewProps) => {
  const childArray = Children.toArray(children);
  const [sizes, setSizes] = React.useState<number[]>(childArray.map(() => 1 / childArray.length));

  // TODO: fix
  useEffect(() => {
    setSizes(childArray.map(() => 1 / childArray.length));
  }, [childArray]);

  const isRow = direction === 'row';
  const sizeKey = isRow ? 'maxWidth' : 'maxHeight';

  function resizeHandler(index: number, mouseDownEvent: React.MouseEvent) {
    mouseDownEvent.preventDefault();
    const startSizes = [...sizes];
    const startPosition = isRow ? mouseDownEvent.screenX : mouseDownEvent.screenY;

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      if (mouseMoveEvent.buttons < 1) {
        onMouseUp();
        return;
      }
      const position = isRow ? mouseMoveEvent.screenX : mouseMoveEvent.screenY;
      const delta = position - startPosition;
      const totalSize = startSizes.reduce((a, b) => a + b);
      const size = startSizes[index];
      const newSize = size + (delta / (isRow ? window.innerWidth : window.innerHeight)) * totalSize;
      const newSizes = [...startSizes];
      newSizes[index] = newSize;
      setSizes(newSizes);
    }

    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove);
    }

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  }

  return (
    <div
      className={classes.container}
      style={{ flexDirection: direction }}
    >
      {childArray.map((child, index, { length }) => (
        <>
          <div
            className={classes.panel}
            style={{ [sizeKey]: index < length - 1 ? `${(sizes[index] * 100).toFixed(2)}%` : undefined }}
          >
            {child}
          </div>
          {index < length - 1 && (
            <div
              role='separator'
              onMouseDown={(e) => resizeHandler(index, e)}
              className={classes.separator}
              style={{ cursor: isRow ? 'ew-resize' : 'ns-resize', flexDirection: direction }}
            >
              <div className={classes.handle} />
            </div>
          )}
        </>
      ))}
    </div>
  );
};
