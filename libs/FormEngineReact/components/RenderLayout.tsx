import React from 'react';

import { Table } from '@digdir/designsystemet-react';
import { ComponentRenderer } from 'libs/FormEngineReact/components/ComponentRenderer';
import type { BaseComponent } from 'libs/FormEngine/types';

import type { Expression } from 'src/features/expressions/types';

interface RenderLayoutType {
  components?: BaseComponent[];
  parentBinding?: string;
  itemIndex?: number;
  className?: string;
}

const getBinding = (component: BaseComponent): string | undefined => {
  if (component.type === 'RepeatingGroup') {
    return component.dataModelBindings?.group;
  }

  return component.dataModelBindings?.simpleBinding;
};

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({
  components,
  parentBinding,
  itemIndex,
  className = '',
}) => {
  if (!components) {
    return null;
  }

  return (
    <div className={`render-layout ${className}`}>
      {components.map((currentComponent) => {
        const childMapping = getBinding(currentComponent);
        const childField = childMapping && parentBinding ? childMapping.replace(parentBinding, '') : undefined;
        const id = `item-${currentComponent.id}`;

        return (
          <div
            key={`grid-${id}`}
            data-componentbaseid={id}
            data-componentid={id}
            data-componenttype={currentComponent.type}
            style={{ marginBottom: '16px' }}
          >
            <ComponentRenderer
              component={currentComponent}
              parentBinding={parentBinding}
              itemIndex={itemIndex}
            />
          </div>
        );
      })}
    </div>
  );
};

interface RenderLayoutRowType {
  components?: BaseComponent[];
  parentBinding?: string;
  itemIndex?: number;
  isRowHiddenExpression?: Expression;
}

export const RenderLayoutRow: React.FunctionComponent<RenderLayoutRowType> = ({
  components,
  parentBinding,
  itemIndex,
  isRowHiddenExpression: _isRowHiddenExpression,
}) => {
  // TODO: Implement expression evaluation for row visibility
  // const isHidden = useExpression(isRowHiddenExpression, [parentBinding, itemIndex]);

  // if (isHidden) {
  //   return null;
  // }

  // Note: isRowHiddenExpression is kept for future implementation but currently unused

  if (!components) {
    return null;
  }

  return (
    <Table.Row>
      {components.map((currentComponent) => {
        const childMapping = getBinding(currentComponent);
        const childField = childMapping && parentBinding ? childMapping.replace(parentBinding, '') : undefined;

        return (
          <Table.Cell key={currentComponent.id}>
            <ComponentRenderer
              component={currentComponent}
              parentBinding={parentBinding}
              itemIndex={itemIndex}
            />
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
};
