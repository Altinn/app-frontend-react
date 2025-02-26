import { getComponentCapabilities, getComponentDef } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { NodeReference, PageReference } from 'src/features/expressions/types';
import type { CompExternal, CompTypes, ILayouts } from 'src/layout/layout';
import type { ChildClaimerProps } from 'src/layout/LayoutComponent';

interface PlainLayoutMaps {
  // Map of all component ids (without row indexes) to component definitions
  allComponents: {
    [componentId: string]: CompExternal;
  };

  // Map of all page keys, with all the component ids on that page
  allPerPage: {
    [pageKey: string]: string[];
  };

  // Map of all component ids to the page key they are on
  componentToPage: {
    [componentId: string]: string;
  };
}

interface Relationships {
  // Map of all component ids to their parent component id
  componentToParent: {
    [componentId: string]: PageReference | NodeReference;
  };

  // Map of all page keys to the top-level component ids on that page
  topLevelComponents: {
    [pageKey: string]: string[];
  };
}

interface ClaimsMap {
  [parentId: string]: {
    [childId: string]: {
      pluginKey?: string;
    };
  };
}

export type LayoutRelationships = PlainLayoutMaps & Relationships;

/**
 * Produces a map of all components in multiple layouts/pages, their parents, the top-level components on each
 * page (in their defined order), and serves as a tool for looking up component definitions by id, along with
 * parent/child relationships.
 */
export function makeRelationships(layouts: ILayouts): LayoutRelationships {
  const maps = makeMaps(layouts);
  const componentToParent: { [componentId: string]: PageReference | NodeReference } = {};
  const topLevelComponents: { [pageKey: string]: string[] } = {};

  for (const pageKey of Object.keys(maps.allPerPage)) {
    const childClaims = claimChildren(pageKey, maps);
    const claimedIds = new Set<string>();

    // All claimed components have their parent set to the component that claimed them
    for (const parentId in childClaims) {
      const children = childClaims[parentId];
      for (const childId in children) {
        componentToParent[childId] = { type: 'node', id: parentId };
        claimedIds.add(childId);
      }
    }

    // All non-claimed components on a page are top-level components, and their parent is the page
    for (const componentId of maps.allPerPage[pageKey]) {
      if (!claimedIds.has(componentId)) {
        componentToParent[componentId] = { type: 'page', id: pageKey };
        if (!topLevelComponents[pageKey]) {
          topLevelComponents[pageKey] = [];
        }
        topLevelComponents[pageKey].push(componentId);
      }
    }
  }

  return { ...maps, componentToParent, topLevelComponents };
}

/**
 * Make the simple hash-maps for all components in the layouts. This is used to quickly look up component, and
 * which components are on which pages.
 */
function makeMaps(layouts: ILayouts): PlainLayoutMaps {
  const allComponents: { [componentId: string]: CompExternal } = {};
  const allPerPage: { [pageKey: string]: string[] } = {};
  const componentToPage: { [componentId: string]: string } = {};

  for (const pageKey of Object.keys(layouts)) {
    const page = layouts[pageKey];
    if (!page) {
      continue;
    }

    allPerPage[pageKey] = [];
    for (const component of page) {
      allComponents[component.id] = component;
      allPerPage[pageKey].push(component.id);
      componentToPage[component.id] = pageKey;
    }
  }

  return { allComponents, allPerPage, componentToPage };
}

/**
 * Given a page, find all container components on that page, and have them claim their children.
 */
function claimChildren(pageKey: string, maps: PlainLayoutMaps): ClaimsMap {
  const map: ClaimsMap = {};
  for (const componentId of maps.allPerPage[pageKey]) {
    const component = maps.allComponents[componentId];
    const def = getComponentDef(component.type);
    if (def instanceof ContainerComponent) {
      const props = makeClaimerProps(component, pageKey, maps, map);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      def.claimChildren(props as any);
    }
  }

  return map;
}

/**
 * Utility function to get all parents that have claimed a child component
 */
function getClaimedBy(map: ClaimsMap, childId: string) {
  const out: string[] = [];
  for (const parentId in map) {
    if (map[parentId]?.[childId]) {
      out.push(parentId);
    }
  }

  return out;
}

/**
 * Make the props for a child claimer, which is implemented by container components
 */
function makeClaimerProps<T extends CompTypes>(
  component: CompExternal<T>,
  pageKey: string,
  maps: PlainLayoutMaps,
  map: ClaimsMap,
): ChildClaimerProps<T> {
  return {
    item: component,
    claimChild: (pluginKey, childId) => {
      const parentId = component.id;
      const exists = !!maps.allComponents[childId];
      const existsOnThisPage = exists && maps.componentToPage[childId] === pageKey;
      if (!exists) {
        window.logError(`Component '${childId}' (as referenced by '${parentId}') does not exist`);
        return;
      }
      if (!existsOnThisPage) {
        const actualPage = maps.componentToPage[childId];
        window.logError(
          `Component '${childId}' (as referenced by '${parentId}') exists on page '${actualPage}', not '${pageKey}'`,
        );
        return;
      }
      const otherClaims = getClaimedBy(map, childId);
      if (otherClaims.length > 0) {
        const claimsStr = otherClaims.join(', ');
        window.logError(`Component '${childId}' (as referenced by '${parentId}') is already claimed by '${claimsStr}'`);
        return;
      }

      map[parentId] = {
        ...map[parentId],
        [childId]: { pluginKey },
      };
    },
    getProto: (id) => {
      const type = maps.allComponents[id]?.type;
      if (type === undefined) {
        window.logError(`Component '${id}' (as referenced by '${component.id}') does not exist`);
      }
      return {
        type,
        capabilities: getComponentCapabilities(type),
      };
    },
  };
}
