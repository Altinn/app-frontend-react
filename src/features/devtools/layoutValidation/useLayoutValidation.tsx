import React, { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import { dotNotationToPointer } from 'src/features/datamodel/notations';
import { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import { useCurrentDataModelSchema, useCurrentDataModelType } from 'src/features/datamodel/useBindingSchema';
import { useLayoutSchemaValidation } from 'src/features/devtools/layoutValidation/useLayoutSchemaValidation';
import { generateSimpleRepeatingGroups } from 'src/features/layout/repGroups/generateSimpleRepeatingGroups';
import { useCurrentLayoutSetId } from 'src/features/layout/useLayouts';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useIsDev } from 'src/hooks/useIsDev';
import { getLayoutComponentObject } from 'src/layout';
import { selectDataSourcesFromState } from 'src/utils/layout/hierarchy';
import { generateEntireHierarchy } from 'src/utils/layout/HierarchyGenerator';
import { getRootElementPath } from 'src/utils/schemaUtils';
import { duplicateStringFilter } from 'src/utils/stringHelper';
import type { LayoutValidationErrors } from 'src/features/devtools/layoutValidation/types';
import type { ILayouts } from 'src/layout/layout';

export interface LayoutValidationProps {
  logErrors?: boolean;
}

function mergeValidationErrors(a: LayoutValidationErrors, b: LayoutValidationErrors): LayoutValidationErrors {
  const out: LayoutValidationErrors = structuredClone(a);

  for (const [layoutSetId, layouts] of Object.entries(b)) {
    if (out[layoutSetId]) {
      for (const [pageName, layout] of Object.entries(layouts)) {
        if (out[layoutSetId][pageName]) {
          for (const [componentId, errors] of Object.entries(layout)) {
            if (out[layoutSetId][pageName][componentId]) {
              out[layoutSetId][pageName][componentId] = [...out[layoutSetId][pageName][componentId], ...errors].filter(
                duplicateStringFilter,
              );
            } else {
              out[layoutSetId][pageName][componentId] = errors;
            }
          }
        } else {
          out[layoutSetId][pageName] = layout;
        }
      }
    } else {
      out[layoutSetId] = layouts;
    }
  }

  return out;
}

const defaultLayouts: ILayouts = {};

/**
 * Validates a layout page against the current data model schema (looking up bindings in the schema).
 *
 * You can call this without specifying the repeating groups state, as we'll generate a simple state for you where
 * every repeating group has one row (thus making every possible component appear in the layout).
 */
function useDataModelBindingsValidation(props: LayoutValidationProps) {
  const layoutSetId = useCurrentLayoutSetId() || 'default';
  const layouts = useAppSelector((state) => state.formLayout.layouts) || defaultLayouts;
  const { logErrors = false } = props;
  const repeatingGroups = useMemo(() => generateSimpleRepeatingGroups(layouts), [layouts]);
  const schema = useCurrentDataModelSchema();
  const dataType = useCurrentDataModelType();
  const dataSources = useAppSelector(selectDataSourcesFromState);
  const currentPage = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const nodes = useMemo(
    () => generateEntireHierarchy(layouts, currentPage, repeatingGroups, dataSources, getLayoutComponentObject),
    [layouts, currentPage, repeatingGroups, dataSources],
  );

  return useMemo(() => {
    const failures: LayoutValidationErrors = {
      [layoutSetId]: {},
    };
    if (!schema) {
      return failures;
    }
    const rootElementPath = getRootElementPath(schema, dataType);

    const lookupBinding = (binding: string) =>
      lookupBindingInSchema({
        schema,
        rootElementPath,
        targetPointer: dotNotationToPointer(binding),
      });

    for (const [pageName, layout] of Object.entries(nodes.all())) {
      for (const node of layout.flat(true)) {
        if ('validateDataModelBindings' in node.def) {
          const errors = node.def.validateDataModelBindings({
            node: node as any,
            lookupBinding,
          });
          if (errors.length) {
            const id = node.item.baseComponentId || node.item.id;
            failures[layoutSetId][pageName] = failures[layoutSetId][pageName] ?? {};
            failures[layoutSetId][pageName][id] = errors;

            if (logErrors) {
              for (const error of errors) {
                window.logErrorOnce(`Validation errors for component '${layoutSetId}/${pageName}/${id}': ${error}`);
              }
            }
          }
        }
      }
    }

    return failures;
  }, [schema, dataType, nodes, logErrors, layoutSetId]);
}

const Context = createContext<LayoutValidationErrors | undefined>(undefined);

export const useLayoutValidation = () => useContext(Context);
export const useLayoutValidationForPage = () => {
  const ctx = useLayoutValidation();
  const layoutSetId = useCurrentLayoutSetId() || 'default';
  const currentPage = useAppSelector((state) => state.formLayout.uiConfig.currentView);

  return ctx?.[layoutSetId]?.[currentPage];
};

export function LayoutValidationProvider({ children }: PropsWithChildren) {
  const isDev = useIsDev();
  const panelOpen = useAppSelector((state) => state.devTools.isOpen);
  const enabled = isDev || panelOpen;

  const layoutSchemaValidations = useLayoutSchemaValidation(enabled);
  const dataModelBindingsValidations = useDataModelBindingsValidation({ logErrors: true });

  if (!layoutSchemaValidations) {
    return <Context.Provider value={undefined}>{children}</Context.Provider>;
  }

  const value = mergeValidationErrors(dataModelBindingsValidations, layoutSchemaValidations);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
