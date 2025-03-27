// import React, { useCallback } from 'react';
// import { FixedSizeList as List } from 'react-window';
// import type { ListChildComponentProps } from 'react-window';
//
// import { RenderComponent } from 'src/next/components/RenderComponent';
// import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';
//
// interface RenderLayoutType {
//   components: ResolvedCompExternal[];
//   parentBinding?: string;
//   itemIndex?: number;
// }
//
// /**
//  * A virtualized layout renderer using react-window's FixedSizeList.
//  * If each component has roughly the same height, this is enough to speed up rendering of large lists.
//  */
// export const RenderLayout: React.FC<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
//   // For a big list of components
//   const itemCount = components.length;
//   // The row height in pixels. Adjust as needed.
//   const itemSize = 80;
//
//   // This is the row renderer that react-window will call for each visible item
//   const Row = useCallback(
//     ({ index, style }: ListChildComponentProps) => {
//       const currentComponent = components[index];
//
//       // The "style" is required by react-window to position items properly in the virtualized container
//       return (
//         <div
//           style={style}
//           data-index={index}
//         >
//           <RenderComponent
//             component={currentComponent}
//             parentBinding={parentBinding}
//             itemIndex={itemIndex}
//           />
//         </div>
//       );
//     },
//     [components, parentBinding, itemIndex],
//   );
//
//   if (!components) {
//     return null;
//   }
//
//   return (
//     <List
//       height={600} // The total height of the scrollable area
//       width='100%' // Or a numeric width if you prefer
//       itemCount={itemCount} // Number of items in the list
//       itemSize={itemSize} // Fixed row height
//     >
//       {Row}
//     </List>
//   );
// };

import React from 'react';

import classNames from 'classnames';

import { Flex } from 'src/app-components/Flex/Flex';
import { gridToClasses } from 'src/layout/GenericComponent';
import classes from 'src/layout/GenericComponent.module.css';
import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
  if (!components) {
    return null;
  }

  return (
    <Flex
      container
      spacing={6}
      alignItems='flex-start'
    >
      {components.map((currentComponent, idx) => {
        const childMapping = currentComponent.dataModelBindings
          ? currentComponent.dataModelBindings['simpleBinding']
          : '';
        const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
        const id = `item-${currentComponent.id}`;

        return (
          <Flex
            data-componentbaseid={id}
            data-componentid={id}
            data-componenttype={currentComponent.type}
            item
            container
            size={currentComponent.grid}
            key={`grid-${id}`}
            className={classNames(classes.container, gridToClasses(currentComponent.grid?.labelGrid, classes))}
          >
            <RenderComponent
              component={currentComponent}
              parentBinding={parentBinding}
              itemIndex={itemIndex}
              childField={childField}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};
