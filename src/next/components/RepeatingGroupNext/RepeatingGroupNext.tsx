import React, { useRef } from 'react';

import { Button } from '@digdir/designsystemet-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import dot from 'dot-object';
import { useStore } from 'zustand';

import { RenderLayout } from 'src/next/components/RenderLayout';
import classes from 'src/next/components/RepeatingGroupNext/RepeatingGroupNext.module.css';
import { layoutStore } from 'src/next/stores/layoutStore';
import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';
interface RepeatingGroupNextType {
  component: ResolvedCompExternal;
  parentBinding?: string;
  itemIndex?: number;
}

export const RepeatingGroupNext: React.FC<RepeatingGroupNextType> = ({ component, parentBinding, itemIndex }) => {
  // @ts-ignore
  const binding = component.dataModelBindings?.group;
  if (!binding) {
    throw new Error('Tried to render repeating group without datamodel binding');
  }

  const splittedBinding = binding.split('.');

  const actualBinding =
    parentBinding !== undefined
      ? `${parentBinding}[${itemIndex}].${splittedBinding[splittedBinding.length - 1] || ''}`
      : binding;

  const groupArray = useStore(layoutStore, (state) => dot.pick(actualBinding, state.data)) || [];

  const addRow = useStore(layoutStore, (state) => state.addRow);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: groupArray.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // just a rough estimate
    overscan: 2,
    measureElement: (element, _, __) => element.getBoundingClientRect().height,
  });
  if (!component.children || !Array.isArray(component.children)) {
    return null;
  }

  if (groupArray.length < 1) {
    return null;
  }

  if (groupArray.length < 100) {
    return (
      <div style={{ border: '1px solid green' }}>
        {/*<h2>here comes things</h2>*/}
        {/*<pre>{JSON.stringify(component, null, 2)}</pre>*/}

        {!parentBinding && (
          <ul>
            <li>Im a parent!</li>
            <li>{`mybinding: ${binding}`}</li>
            <li>{`actualBinding: ${actualBinding}`}</li>
            <li>{`groupArray.length: ${groupArray.length}`}</li>
          </ul>
        )}

        {parentBinding && (
          <ul>
            <li>Im a child!</li>
            <li>{`parentBinding: ${parentBinding}`}</li>
            <li>{`mybinding: ${binding}`}</li>
            <li>{`actualBinding: ${actualBinding}`}</li>
            <li>{`groupArray.length: ${groupArray.length}`}</li>
          </ul>
        )}

        {/*<pre>{JSON.stringify(component.children, null, 2)}</pre>*/}

        {groupArray.map((_, index) => (
          <div key={index}>
            <RenderLayout
              components={component.children}
              parentBinding={actualBinding}
              itemIndex={index}
            />
          </div>
        ))}

        <Button
          onClick={() => {
            addRow(binding, parentBinding, itemIndex);
          }}
        >
          Legg til rad
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        ref={parentRef}
        className={classes.container}
        style={{
          width: '100%',
          height: '500px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
            width: '100%',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const index = virtualRow.index;
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) {
                    rowVirtualizer.measureElement(el);
                  }
                }}
                data-index={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${groupArray[virtualRow.index]}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <RenderLayout
                  components={component.children}
                  parentBinding={binding}
                  itemIndex={index}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Button
        onClick={() => {
          addRow(binding, parentBinding, itemIndex);
        }}
      >
        Til rad
      </Button>
    </div>
  );
};

//
// import React, { useRef } from 'react';
//
// import { Button } from '@digdir/designsystemet-react';
// import { useVirtualizer } from '@tanstack/react-virtual';
// import dot from 'dot-object';
// import { useStore } from 'zustand';
//
// import { RenderLayout } from 'src/next/components/RenderLayout';
// import classes from 'src/next/components/RepeatingGroupNext/RepeatingGroupNext.module.css';
// import { layoutStore } from 'src/next/stores/layoutStore';
// import type { CompIntermediateExact } from 'src/layout/layout';
// import type { ResolvedCompExternal } from 'src/next/stores/layoutStore';
// interface RepeatingGroupNextType {
//   component: ResolvedCompExternal;
//   parentBinding?: string;
//   itemIndex?: number;
// }
//
// export const RepeatingGroupNext: React.FC<RepeatingGroupNextType> = ({ component, parentBinding, itemIndex }) => {
//   // @ts-ignore
//   const binding = component.dataModelBindings?.group;
//   if (!binding) {
//     throw new Error('Tried to render repeating group without datamodel binding');
//   }
//
//   const actualBinding =
//     itemIndex !== undefined ? `${parentBinding}[${itemIndex}].${binding.split('.')[1] || ''}` : binding;
//
//   const componentConfig = component as unknown as CompIntermediateExact<'RepeatingGroup'>;
//
//   const groupArray = useStore(layoutStore, (state) => dot.pick(actualBinding, state.data)) || [];
//
//   const addRow = useStore(layoutStore, (state) => state.addRow);
//
//   const parentRef = useRef<HTMLDivElement>(null);
//
//   const rowVirtualizer = useVirtualizer({
//     count: groupArray.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 150, // just a rough estimate
//     overscan: 2,
//     measureElement: (element, _, __) => element.getBoundingClientRect().height,
//   });
//   if (!component.children || !Array.isArray(component.children)) {
//     return null;
//   }
//
//   // if (componentConfig.tableColumns) {
//   //   console.log('componentConfig.tableColumns', componentConfig.tableColumns);
//   //
//   //   return (
//   //     <table>
//   //       {Object.values(componentConfig.tableColumns).map((entry) => {
//   //         const componentId = entry[0];
//   //         const config = entry[1];
//   //         return (
//   //           <div key={componentId}>
//   //             <pre>{JSON.stringify(componentId, null, 2)}</pre>
//   //             <pre>{JSON.stringify(config, null, 2)}</pre>
//   //           </div>
//   //         );
//   //       })}
//   //     </table>
//   //   );
//   // }
//   //
//   if (groupArray.length < 100) {
//     return (
//       <div>
//         <h2>here comes things</h2>
//         {/*<pre>{JSON.stringify(groupArray, null, 2)}</pre>*/}
//
//         {binding}
//
//         {/*<pre>{JSON.stringify(component.children, null, 2)}</pre>*/}
//
//         {groupArray.map((_, index) => (
//           <div
//             key={index}
//             style={{ border: '1px solid green' }}
//           >
//             <RenderLayout
//               components={component.children}
//               parentBinding={binding}
//               itemIndex={index}
//             />
//           </div>
//         ))}
//
//         <Button
//           onClick={() => {
//             addRow(binding, parentBinding, itemIndex);
//           }}
//         >
//           Legg til rad
//         </Button>
//       </div>
//     );
//   }
//
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
//       <div
//         ref={parentRef}
//         className={classes.container}
//         style={{
//           width: '100%',
//           height: '500px',
//           overflow: 'auto',
//         }}
//       >
//         <div
//           style={{
//             height: `${rowVirtualizer.getTotalSize()}px`,
//             position: 'relative',
//             width: '100%',
//           }}
//         >
//           {rowVirtualizer.getVirtualItems().map((virtualRow) => {
//             const index = virtualRow.index;
//             return (
//               <div
//                 key={index}
//                 ref={(el) => {
//                   if (el) {
//                     rowVirtualizer.measureElement(el);
//                   }
//                 }}
//                 data-index={index}
//                 style={{
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   width: '100%',
//                   height: `${groupArray[virtualRow.index]}px`,
//                   transform: `translateY(${virtualRow.start}px)`,
//                 }}
//               >
//                 <RenderLayout
//                   components={component.children}
//                   parentBinding={binding}
//                   itemIndex={index}
//                 />
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <Button
//         onClick={() => {
//           addRow(binding, parentBinding, itemIndex);
//         }}
//       >
//         Til rad
//       </Button>
//     </div>
//   );
// };
