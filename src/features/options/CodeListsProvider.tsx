import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { useMarkAsLoading } from 'src/core/loading/LoadingRegistry';
import { useLayouts } from 'src/features/form/layout/LayoutsContext';
import { useLaxInstanceId } from 'src/features/instance/InstanceContext';
import { useCurrentLanguage } from 'src/features/language/LanguageProvider';
import { useGetOptionsQuery } from 'src/features/options/useGetOptionsQuery';
import { getOptionsUrl } from 'src/utils/urls/appUrlHelper';
import type { IOptionInternal } from 'src/features/options/castOptionsToStrings';
import type { ISelectionComponent } from 'src/layout/common.generated';
import type { ILayouts } from 'src/layout/layout';
import type { ParamValue } from 'src/utils/urls/appUrlHelper';

export const CodeListPending = Symbol('PENDING');

interface CodeListsStore {
  codeLists: {
    [id: string]: IOptionInternal[] | undefined | typeof CodeListPending;
  };
  updateCodeList(id: string, options: IOptionInternal[] | typeof CodeListPending): void;
}

function initialCreateStore() {
  return createStore<CodeListsStore>((set) => ({
    codeLists: {},
    updateCodeList: (id, options) => set((state) => ({ codeLists: { ...state.codeLists, [id]: options } })),
  }));
}

const { Provider, useDelayedSelector, useDelayedSelectorProps, useStaticSelector } = createZustandContext({
  name: 'CodeListsContext',
  required: true,
  initialCreateStore,
});

/**
 * Provider for fetching and storing code lists not directly tied to components. This provider fetches code lists
 * referenced in the `optionLabel` expression function and stores them for later use in those expressions. This
 * has to be done ahead of time, as the expression engine is currently not able to work asynchronously.
 */
export function CodeListsProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      {children}
      <FindAndMaintainCodeLists />
    </Provider>
  );
}

const delayedSelectorProps = {
  mode: 'simple' as const,
  selector: (optionsId: string) => (state: CodeListsStore) => state.codeLists[optionsId],
};

export type CodeListSelector = (optionsId: string) => IOptionInternal[] | undefined | typeof CodeListPending;
export const useCodeListSelector = (): CodeListSelector => useDelayedSelector(delayedSelectorProps);
export const useCodeListSelectorProps = () => useDelayedSelectorProps(delayedSelectorProps);

function FindAndMaintainCodeLists() {
  const layouts = useLayouts();
  const language = useCurrentLanguage();
  const instanceId = useLaxInstanceId();
  const toFetch = getAllReferencedCodeLists(layouts, language, instanceId);

  return (
    <>
      {Array.from(toFetch.keys()).map((url) => (
        <CodeListFetcher
          key={url}
          url={url}
          {...toFetch.get(url)!}
        />
      ))}
    </>
  );
}

interface ToFetch {
  optionsId: string;
  storeInZustand: boolean;
}

function CodeListFetcher({ url, optionsId, storeInZustand }: { url: string } & ToFetch) {
  const updateCodeList = useStaticSelector((state) => state.updateCodeList);
  const { data, isPending, error } = useGetOptionsQuery(url);
  useMarkAsLoading(['CodeListsProvider', url], isPending);

  useEffect(() => {
    if (!storeInZustand) {
      return;
    }
    if (data) {
      updateCodeList(optionsId, data.data);
    } else if (error) {
      window.logErrorOnce(
        `Failed to fetch options for optionLabel expression (tried to fetch '${optionsId}')\n`,
        error,
      );
    } else {
      updateCodeList(optionsId, CodeListPending);
    }
  }, [data, error, optionsId, storeInZustand, updateCodeList]);

  return null;
}

/**
 * Looks through all layouts and returns a list of unique optionIds that are referenced in
 * expressions like ["optionLabel", "...", "..."]
 */
function getAllReferencedCodeLists(
  layouts: ILayouts,
  language: string,
  instanceId: string | undefined,
): Map<string, ToFetch> {
  const urls = new Map<string, ToFetch>();

  for (const layout of Object.values(layouts)) {
    for (const component of layout ?? []) {
      if (canBeFetchedStatically(component)) {
        // These are not needed for the expression engine, but it's nice to start pre-fetching these before
        // the rest of the data is available.
        const url = getOptionsUrl({
          instanceId,
          language,
          optionsId: component.optionsId,
          queryParameters: component.queryParameters,
          secure: component.secure,
        });
        urls.set(url, { optionsId: component.optionsId, storeInZustand: false });
      }
      addCodeListsFromExpressionsRecursive(component, language, instanceId, urls);
    }
  }

  return urls;
}

/**
 * Recurse component properties and look for expressions ["optionLabel", "...", "..."]. Picks out the second value
 * (the first argument to the `optionLabel` function) and adds it to the input Set.
 */
function addCodeListsFromExpressionsRecursive(
  obj: unknown,
  language: string,
  instanceId: string | undefined,
  urls: Map<string, ToFetch>,
): void {
  if (obj == null || typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return;
  }

  if (Array.isArray(obj)) {
    if (obj.at(0) === 'optionLabel' && obj.length === 3) {
      const maybeOptionId = obj.at(1);
      if (typeof maybeOptionId === 'string') {
        const url = getOptionsUrl({
          instanceId,
          language,
          optionsId: maybeOptionId,
        });
        urls.set(url, { optionsId: maybeOptionId, storeInZustand: true });
      } else {
        window.logWarnOnce(
          'A non-string value was found when looking for optionsId references in expressions, the following option id could not be determined:\n',
          maybeOptionId,
        );
      }
    }

    for (const child of obj) {
      addCodeListsFromExpressionsRecursive(child, language, instanceId, urls);
    }
  } else if (typeof obj === 'object') {
    for (const child of Object.values(obj)) {
      addCodeListsFromExpressionsRecursive(child, language, instanceId, urls);
    }
  }
}

/**
 * Some components may have a static configuration that allows us to fetch the options before the data model has
 * been fetched.
 */
function canBeFetchedStatically(component: unknown): component is ISelectionComponent &
  Required<Pick<ISelectionComponent, 'optionsId'>> & {
    queryParameters?: Record<string, ParamValue>;
  } {
  return !!(
    component &&
    typeof component === 'object' &&
    'optionsId' in component &&
    component.optionsId &&
    !('mapping' in component) &&
    (!('queryParameters' in component) ||
      Object.values(component.queryParameters!).every(
        (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null,
      ))
  );
}
