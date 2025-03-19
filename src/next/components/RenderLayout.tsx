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

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { RenderComponent } from 'src/next/components/RenderComponent';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';

interface RenderLayoutType {
  components?: ResolvedCompExternal[];
  parentBinding?: string;
  itemIndex?: number;
}

interface IntersectionOptions {
  once?: boolean; // if you only want to fire once
}
function useGlobalIntersectionObserver(options: IntersectionOptions = {}) {
  const { once = false, ...observerOptions } = options;
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  // Create a stable observer
  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.id;
          if (!elementId) {
            return;
          }

          // If in view
          if (entry.isIntersecting) {
            setVisibleIds((prev) => {
              const next = new Set(prev);
              next.add(elementId);
              return next;
            });

            // Unobserve if only needed once
            if (once) {
              observer.unobserve(entry.target);
            }
          } else {
            // If out of view and not a once-only intersection
            if (!once) {
              setVisibleIds((prev) => {
                const next = new Set(prev);
                next.delete(elementId);
                return next;
              });
            }
          }
        });
      }, observerOptions),
    [once, observerOptions],
  );

  // Ref callback for attaching/detaching from the observer
  const observe = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        observer.observe(node);
      }
    },
    [observer],
  );

  // Cleanup
  useEffect(() => () => observer.disconnect(), [observer]);

  return { observe, visibleIds };
}

// function useGlobalIntersectionObserver(options: IntersectionOptions = {}) {
//   const { once, ...observerOptions } = options;
//   const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
//
//   const observer = useMemo(
//     () =>
//       new IntersectionObserver((entries) => {
//         entries.forEach((entry) => {
//           const elementId = entry.target.id;
//           if (entry.isIntersecting && elementId) {
//             setVisibleIds((prev) => {
//               // If we only want to fire once, keep the ID in our set
//               const next = new Set(prev).add(elementId);
//               return next;
//             });
//             if (once) {
//               // Stop observing if we only need it once
//               observer.unobserve(entry.target);
//             }
//           }
//         });
//       }, observerOptions),
//     [],
//   );
//
//   // The "ref callback" for each item to mount/unmount in the observer
//   const observe = useCallback(
//     (node: HTMLElement | null) => {
//       if (node) {
//         observer.observe(node);
//       }
//     },
//     [observer],
//   );
//
//   // Cleanup
//   useEffect(() => () => observer.disconnect(), [observer]);
//
//   return { observe, visibleIds };
// }

export const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ components, parentBinding, itemIndex }) => {
  //const { observe, visibleIds } = useGlobalIntersectionObserver({ once: true });

  if (!components) {
    return null;
  }

  return (
    <div>
      {components.map((currentComponent, idx) => {
        const childMapping = currentComponent.dataModelBindings
          ? currentComponent.dataModelBindings['simpleBinding']
          : '';
        const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
        const id = `item-${currentComponent.id}`;
        // const isVisible = visibleIds.has(id);

        return (
          <div
            key={idx}
            id={id}
          >
            <RenderComponent
              component={currentComponent}
              parentBinding={parentBinding}
              itemIndex={itemIndex}
              childField={childField}
            />
          </div>
        );
      })}
    </div>
  );

  // return (
  //   <div>
  //     {components.map((currentComponent, idx) => {
  //       const childMapping = currentComponent.dataModelBindings
  //         ? currentComponent.dataModelBindings['simpleBinding']
  //         : '';
  //       const childField = childMapping ? childMapping.replace(parentBinding, '') : undefined;
  //       const id = `item-${currentComponent.id}`;
  //       const isVisible = visibleIds.has(id);
  //
  //       return (
  //         <div
  //           key={idx}
  //           ref={observe}
  //           id={id}
  //         >
  //           {isVisible && (
  //             <RenderComponent
  //               component={currentComponent}
  //               parentBinding={parentBinding}
  //               itemIndex={itemIndex}
  //               childField={childField}
  //             />
  //           )}
  //           {!isVisible && <div>Loading...</div>}
  //         </div>
  //       );
  //     })}
  //   </div>
  // );
};
