import { getComponentCapabilities, getComponentDef } from 'src/layout';
import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { NodeReference, PageReference } from 'src/features/expressions/types';
import type { CompExternal, CompTypes, ILayouts } from 'src/layout/layout';
import type { ChildClaimerProps } from 'src/layout/LayoutComponent';

interface PlainLayoutLookups {
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

interface RelationshipLookups {
  // Map of all component ids to their parent component id
  componentToParent: {
    [componentId: string]: PageReference | NodeReference;
  };

  // Map of all page keys to the top-level component ids on that page
  topLevelComponents: {
    [pageKey: string]: string[];
  };
}

interface ChildClaims {
  [parentId: string]: {
    [childId: string]: true;
  };
}

export type LayoutLookups = PlainLayoutLookups & RelationshipLookups;

/**
 * Make the simple hash-maps for all components in the layouts. This is used to quickly look up component, and
 * which components are on which pages.
 */
function makePlainLookup(layouts: ILayouts): PlainLayoutLookups {
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
 * Produces a map of all components in multiple layouts/pages, their parents, the top-level components on each
 * page (in their defined order), and serves as a tool for looking up component definitions by id, along with
 * parent/child relationships.
 */
export function makeLayoutLookups(layouts: ILayouts): LayoutLookups {
  const lookup = makePlainLookup(layouts);
  const componentToParent: { [componentId: string]: PageReference | NodeReference } = {};
  const topLevelComponents: { [pageKey: string]: string[] } = {};

  for (const pageKey of Object.keys(lookup.allPerPage)) {
    const childClaims: ChildClaims = {};
    for (const componentId of lookup.allPerPage[pageKey]) {
      const component = lookup.allComponents[componentId];
      const def = getComponentDef(component.type);
      if (def instanceof ContainerComponent) {
        const props: ChildClaimerProps<CompTypes> = {
          item: component,
          claimChild: (_, childId) => claimChild(childId, component.id, lookup, childClaims),
          getProto: (id) => getPrototype(id, component.id, lookup),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        def.claimChildren(props as any);
      }
    }

    // All claimed components have their parent set to the component that claimed them
    const claimedIds = new Set<string>();
    for (const parentId in childClaims) {
      const children = childClaims[parentId];
      for (const childId in children) {
        componentToParent[childId] = { type: 'node', id: parentId };
        claimedIds.add(childId);
      }
    }

    // All non-claimed components on a page are top-level components, and their parent is the page
    for (const componentId of lookup.allPerPage[pageKey]) {
      if (!claimedIds.has(componentId)) {
        componentToParent[componentId] = { type: 'page', id: pageKey };
        if (!topLevelComponents[pageKey]) {
          topLevelComponents[pageKey] = [];
        }
        topLevelComponents[pageKey].push(componentId);
      }
    }
  }

  return { ...lookup, componentToParent, topLevelComponents };
}

function claimChild(childId: string, parentId: string, lookup: PlainLayoutLookups, claims: ChildClaims) {
  const parentPageKey = lookup.componentToPage[parentId];
  const exists = !!lookup.allComponents[childId];
  const existsOnThisPage = exists && lookup.componentToPage[childId] === parentPageKey;
  if (!exists) {
    window.logError(`Component '${childId}' (as referenced by '${parentId}') does not exist`);
    return;
  }
  if (!existsOnThisPage) {
    const actualPage = lookup.componentToPage[childId];
    window.logError(
      `Component '${childId}' (as referenced by '${parentId}') exists on page '${actualPage}', not '${parentPageKey}'`,
    );
    return;
  }
  const otherClaims: string[] = [];
  for (const otherParentId in claims) {
    if (claims[otherParentId]?.[childId]) {
      otherClaims.push(otherParentId);
    }
  }
  if (otherClaims.length > 0) {
    const claimsStr = otherClaims.join(', ');
    window.logError(`Component '${childId}' (as referenced by '${parentId}') is already claimed by '${claimsStr}'`);
    return;
  }

  claims[parentId] = {
    ...claims[parentId],
    [childId]: true,
  };
}

function getPrototype(id: string, requestedBy: string, lookup: PlainLayoutLookups) {
  const type = lookup.allComponents[id]?.type;
  if (type === undefined) {
    window.logError(`Component '${id}' (as referenced by '${requestedBy}') does not exist`);
  }
  return {
    type,
    capabilities: getComponentCapabilities(type),
  };
}
